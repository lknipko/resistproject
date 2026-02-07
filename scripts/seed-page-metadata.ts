/**
 * Seed Script: Initialize PageMetadata for all existing MDX files
 *
 * This script scans all MDX files in content/learn/ and content/act/,
 * extracts frontmatter, and creates PageMetadata records in the database.
 *
 * Run with: npx tsx scripts/seed-page-metadata.ts
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface PageFrontmatter {
  title: string
  subtitle?: string
  type: string
  tags?: string[]
  lastUpdated?: string
  description?: string
}

async function seedPageMetadata() {
  console.log('🌱 Starting page metadata seeding...\n')

  const contentDirectory = path.join(process.cwd(), 'content')
  const sections = ['learn', 'act'] as const

  let totalCreated = 0
  let totalUpdated = 0
  let totalErrors = 0

  // Get the highest existing pageId to continue from
  const maxPage = await prisma.pageMetadata.findFirst({
    orderBy: { pageId: 'desc' },
    select: { pageId: true }
  })
  let nextPageId = (maxPage?.pageId || 0) + 1

  for (const section of sections) {
    const sectionPath = path.join(contentDirectory, section)

    if (!fs.existsSync(sectionPath)) {
      console.warn(`⚠️  Section directory not found: ${sectionPath}`)
      continue
    }

    const files = fs.readdirSync(sectionPath).filter(file => file.endsWith('.mdx'))
    console.log(`📂 Found ${files.length} MDX files in ${section}/\n`)

    for (const filename of files) {
      const slug = filename.replace(/\.mdx$/, '')
      const filePath = path.join(sectionPath, filename)
      const pagePath = `/${section}/${slug}`

      try {
        // Read and parse MDX file
        const fileContents = fs.readFileSync(filePath, 'utf8')
        const { data } = matter(fileContents)
        const frontmatter = data as PageFrontmatter

        // Check if PageMetadata already exists
        const existing = await prisma.pageMetadata.findFirst({
          where: { pagePath }
        })

        if (existing) {
          // Update existing record
          await prisma.pageMetadata.update({
            where: { id: existing.id },
            data: {
              contentType: frontmatter.type || section,
              issueTags: (frontmatter.tags || []) as any[],
              tier: 3, // Default tier
              status: 'active'
            }
          })
          totalUpdated++
          console.log(`✏️  Updated: ${pagePath} (ID: ${existing.id})`)
        } else {
          // Create new record
          await prisma.pageMetadata.create({
            data: {
              pageId: nextPageId,
              pagePath,
              contentType: frontmatter.type || section,
              issueTags: (frontmatter.tags || []) as any[],
              tier: 3, // Default tier
              status: 'active',
              baseScore: 100, // Default base score
              currentScore: 100,
              urgencyFactor: 1.0,
              freshnessFactor: 1.0
            }
          })
          totalCreated++
          console.log(`✅ Created: ${pagePath} (ID: ${nextPageId})`)
          nextPageId++
        }
      } catch (error) {
        totalErrors++
        console.error(`❌ Error processing ${pagePath}:`, error instanceof Error ? error.message : error)
      }
    }

    console.log('') // Empty line between sections
  }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✨ Seeding Complete!')
  console.log(`   Created: ${totalCreated}`)
  console.log(`   Updated: ${totalUpdated}`)
  console.log(`   Errors:  ${totalErrors}`)
  console.log(`   Total:   ${totalCreated + totalUpdated}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // Verify results
  const allPages = await prisma.pageMetadata.findMany({
    orderBy: { pageId: 'asc' },
    select: { pageId: true, pagePath: true, contentType: true }
  })

  console.log('📊 All PageMetadata records:')
  allPages.forEach(page => {
    console.log(`   [${page.pageId}] ${page.pagePath} (${page.contentType})`)
  })
}

async function main() {
  try {
    await seedPageMetadata()
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
