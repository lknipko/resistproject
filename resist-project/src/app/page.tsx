import { readFileSync } from 'fs'
import path from 'path'
import { compilePage } from '@/lib/mdx'

export default async function HomePage() {
  const filePath = path.join(process.cwd(), 'content', 'home.mdx')
  const source = readFileSync(filePath, 'utf8')
  const { content } = await compilePage(source)

  return (
    <article className="max-w-[1200px] mx-auto px-8 py-12">
      {content}
    </article>
  )
}
