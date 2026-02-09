import { compilePage } from '@/lib/mdx'

export default async function MDXCollapsiblesTestPage() {
  // Test MDX content with collapsible syntax
  const testMDX = `
# MDX Collapsibles Test

This page tests the collapsible syntax in MDX content using the remark plugin.

## [+] Simple Collapsible Heading

This is a simple collapsible section. It should be wrapped in a Collapsible component automatically.

- Item 1
- Item 2
- Item 3

## Regular Heading

This is a regular heading without the [+] marker.

## Collapsible List Items

Testing list items with the [+] syntax:

- [+] Primary Sources

  This content is hidden until you expand the list item.

  - Executive Order 12345
  - Court Filing ABC-2025
  - Congressional Record page 42

- Regular list item (not collapsible)

- [+] Another Collapsible Item

  More hidden content here.

  Can include multiple paragraphs.

## Nested List Collapsibles

- [+] Top Level Item

  This is the expanded content.

  - [+] Nested Collapsible Item

    This is nested content within the first collapsible.

  - Regular nested item

- Another top level item

## [+] Nested Heading Example

This has nested collapsibles.

### [+] Nested Level 3

This is nested inside the h2.

#### [+] Nested Level 4

This is the deepest level.

### Regular H3

This is not collapsible.

## Facts

This is a Facts section with collapsibles inside.

### [+] Evidence

This collapsible is inside the Facts section.

**Evidence 1:** Some factual information

**Evidence 2:** More facts

- [+] Detailed Source List

  These sources are hidden by default.

  - Source A
  - Source B
  - Source C
`

  try {
    const { content } = await compilePage(testMDX)

    return (
      <article className="max-w-4xl mx-auto p-8">
        {content}
      </article>
    )
  } catch (error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Compiling MDX</h1>
        <pre className="bg-red-50 p-4 rounded overflow-auto">
          {error instanceof Error ? error.message : 'Unknown error'}
        </pre>
        <pre className="bg-gray-100 p-4 rounded mt-4 overflow-auto text-xs">
          {error instanceof Error ? error.stack : ''}
        </pre>
      </div>
    )
  }
}
