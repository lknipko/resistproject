import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

type SitemapEntry = {
  url: string
  lastModified?: string | Date
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

// Get all MDX files from a directory
function getMDXFiles(dir: string): string[] {
  const contentDir = path.join(process.cwd(), 'content', dir)

  if (!fs.existsSync(contentDir)) {
    return []
  }

  return fs.readdirSync(contentDir)
    .filter(file => file.endsWith('.mdx'))
    .map(file => file.replace(/\.mdx$/, ''))
}

// Get frontmatter from an MDX file
function getMDXFrontmatter(section: string, slug: string): { lastUpdated?: string } {
  const filePath = path.join(process.cwd(), 'content', section, `${slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    return {}
  }

  const fileContents = fs.readFileSync(filePath, 'utf8')
  const { data } = matter(fileContents)

  return {
    lastUpdated: data.lastUpdated
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://resistproject.com'

  const entries: SitemapEntry[] = []

  // Homepage
  entries.push({
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  })

  // Learn section landing page
  entries.push({
    url: `${baseUrl}/learn`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  })

  // Act section landing page
  entries.push({
    url: `${baseUrl}/act`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  })

  // Learn pages
  const learnSlugs = getMDXFiles('learn')
  for (const slug of learnSlugs) {
    const { lastUpdated } = getMDXFrontmatter('learn', slug)
    entries.push({
      url: `${baseUrl}/learn/${slug}`,
      lastModified: lastUpdated ? new Date(lastUpdated) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  // Act pages
  const actSlugs = getMDXFiles('act')
  for (const slug of actSlugs) {
    const { lastUpdated } = getMDXFrontmatter('act', slug)
    entries.push({
      url: `${baseUrl}/act/${slug}`,
      lastModified: lastUpdated ? new Date(lastUpdated) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  // Other important pages
  entries.push(
    {
      url: `${baseUrl}/auth/signin`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/profile`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/review`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    }
  )

  return entries
}
