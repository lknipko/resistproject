import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface RailwayStatus {
  available: boolean
  deploymentStatus?: string
  lastDeployedAt?: string
  serviceName?: string
  error?: string
}

async function fetchRailwayStatus(): Promise<RailwayStatus> {
  const token = process.env.RAILWAY_API_TOKEN
  if (!token) {
    return { available: false }
  }

  try {
    const query = `
      query {
        me {
          projects {
            edges {
              node {
                name
                services {
                  edges {
                    node {
                      name
                      serviceInstances {
                        edges {
                          node {
                            latestDeployment {
                              status
                              createdAt
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    const res = await fetch('https://backboard.railway.com/graphql/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) {
      return { available: true, error: `Railway API returned ${res.status}` }
    }

    const data = await res.json()

    if (data.errors) {
      return { available: true, error: data.errors[0]?.message || 'GraphQL error' }
    }

    // Find the first project with a service that has a deployment
    const projects = data.data?.me?.projects?.edges || []
    for (const projectEdge of projects) {
      const project = projectEdge.node
      const services = project.services?.edges || []
      for (const serviceEdge of services) {
        const service = serviceEdge.node
        const instances = service.serviceInstances?.edges || []
        for (const instanceEdge of instances) {
          const deployment = instanceEdge.node?.latestDeployment
          if (deployment) {
            return {
              available: true,
              deploymentStatus: deployment.status,
              lastDeployedAt: deployment.createdAt,
              serviceName: service.name || project.name,
            }
          }
        }
      }
    }

    return { available: true, error: 'No deployments found' }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return { available: true, error: message }
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userExtended = await prisma.userExtended.findUnique({
    where: { userId: session.user.id },
    select: { userTier: true },
  })

  if (!userExtended || userExtended.userTier < 5) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    newUsersToday,
    totalUsers,
    proposalsToday,
    votesToday,
    recentSignups,
    civicActions,
    linkClicks,
    auditLogs,
    railway,
  ] = await Promise.all([
    prisma.userExtended.count({ where: { createdAt: { gte: today } } }),
    prisma.userExtended.count(),
    prisma.editProposal.count({ where: { createdAt: { gte: today } } }),
    prisma.vote.count({ where: { createdAt: { gte: today } } }),
    prisma.userExtended.findMany({
      where: { createdAt: { gte: today } },
      select: { displayName: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.civicAction.findMany({
      where: { createdAt: { gte: today } },
      select: { actionType: true, sourcePage: true },
    }),
    prisma.externalLinkClick.findMany({
      where: { clickedAt: { gte: today } },
      select: { category: true, sourcePage: true },
    }),
    prisma.auditLog.findMany({
      where: { createdAt: { gte: today } },
      select: { actionCategory: true },
    }),
    fetchRailwayStatus(),
  ])

  // Aggregate civic actions by type
  const civicActionsByType: Record<string, number> = {}
  const civicPageCounts: Record<string, number> = {}
  for (const action of civicActions) {
    civicActionsByType[action.actionType] = (civicActionsByType[action.actionType] || 0) + 1
    civicPageCounts[action.sourcePage] = (civicPageCounts[action.sourcePage] || 0) + 1
  }

  // Aggregate link clicks by category
  const linkClicksByCategory: Record<string, number> = {}
  for (const click of linkClicks) {
    linkClicksByCategory[click.category] = (linkClicksByCategory[click.category] || 0) + 1
  }

  // Top pages by civic action count
  const topPages = Object.entries(civicPageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([page, count]) => ({ page, count }))

  // Aggregate audit log by category
  const auditByCategory: Record<string, number> = {}
  for (const log of auditLogs) {
    auditByCategory[log.actionCategory] = (auditByCategory[log.actionCategory] || 0) + 1
  }

  return NextResponse.json({
    newUsersToday,
    totalUsers,
    proposalsToday,
    votesToday,
    civicActionsToday: civicActions.length,
    civicActionsByType,
    linkClicksToday: linkClicks.length,
    linkClicksByCategory,
    topPages,
    recentSignups: recentSignups.map((u) => ({
      displayName: u.displayName || 'Anonymous',
      createdAt: u.createdAt.toISOString(),
    })),
    auditActionsToday: auditLogs.length,
    auditByCategory,
    railway,
  })
}
