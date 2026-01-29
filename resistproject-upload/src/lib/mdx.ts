import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import type { PageFrontmatter } from '@/types/content'
import { mdxComponents } from '@/components/mdx-components'

export async function compilePage(source: string) {
  return await compileMDX<PageFrontmatter>({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug],
      },
    },
    components: mdxComponents,
  })
}
