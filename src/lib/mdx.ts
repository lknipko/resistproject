import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import remarkSectionWrapper from './remark-section-wrapper'
import { remarkPhoneLinks } from './remark-phone-links'
import rehypeSlug from 'rehype-slug'
import type { PageFrontmatter } from '@/types/content'
import { mdxComponents } from '@/components/mdx-components'

export async function compilePage(source: string) {
  return await compileMDX<PageFrontmatter>({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [
          remarkGfm,
          remarkSectionWrapper, // Transform sections and special links (must run before rehype)
          remarkPhoneLinks, // Auto-link phone numbers
        ],
        rehypePlugins: [rehypeSlug],
      },
    },
    components: mdxComponents,
  })
}
