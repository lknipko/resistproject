import { NextRequest, NextResponse } from 'next/server'
import { serialize } from 'next-mdx-remote/serialize'
import remarkGfm from 'remark-gfm'
import remarkSectionWrapper from '@/lib/remark-section-wrapper'
import { remarkPhoneLinks } from '@/lib/remark-phone-links'
import rehypeSlug from 'rehype-slug'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content } = body

    if (typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "content" field' },
        { status: 400 }
      )
    }

    // Use the same plugins as the production MDX pipeline (src/lib/mdx.ts)
    const mdxSource = await serialize(content, {
      mdxOptions: {
        remarkPlugins: [
          remarkGfm,
          remarkSectionWrapper,
          remarkPhoneLinks,
        ],
        rehypePlugins: [rehypeSlug],
      },
    })

    return NextResponse.json({ mdxSource })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'MDX compilation failed'
    return NextResponse.json(
      { error: message },
      { status: 422 }
    )
  }
}
