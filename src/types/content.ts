export type SiteSection = 'learn' | 'act' | 'environment'

export interface PageFrontmatter {
  title: string
  subtitle?: string
  type: SiteSection
  tags?: string[]
  urgency?: 'high' | 'medium' | 'low'
  actLink?: string
  lastUpdated: string
  description?: string
}

export interface PageMetadata extends PageFrontmatter {
  slug: string
  path: string
}

export interface PageContent {
  metadata: PageMetadata
  content: string
}
