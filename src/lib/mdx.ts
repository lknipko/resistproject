import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import remarkSectionWrapper from './remark-section-wrapper'
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
        ],
        rehypePlugins: [rehypeSlug],
      },
    },
    components: mdxComponents,
  })
}
