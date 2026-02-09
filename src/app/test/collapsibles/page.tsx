import { Collapsible } from '@/components/mdx/Collapsible'

export default function CollapsiblesTestPage() {
  return (
    <article className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Collapsible Sections Test</h1>

      <p className="mb-6">
        This page tests the new collapsible sections feature. Click on any section header to expand/collapse it.
      </p>

      <Collapsible title="Level 2 Collapsible" level="h2" section="learn">
        <p>This is top-level collapsible content at the h2 level.</p>
        <ul>
          <li>Light gray background (bg-gray-50)</li>
          <li>No extra indentation</li>
          <li>Teal border accent</li>
        </ul>

        <Collapsible title="Nested Level 3" level="h3" section="learn">
          <p>This is nested inside the h2 collapsible.</p>
          <ul>
            <li>Medium gray background (bg-gray-100)</li>
            <li>Medium indentation (pl-4 md:pl-6)</li>
            <li>Teal border accent</li>
          </ul>

          <Collapsible title="Deeply Nested Level 4" level="h4" section="learn">
            <p>This is the deepest level (h4).</p>
            <ul>
              <li>Darker gray background (bg-gray-200)</li>
              <li>Deep indentation (pl-8 md:pl-12)</li>
              <li>Teal border accent</li>
            </ul>
          </Collapsible>
        </Collapsible>

        <h3 className="text-xl font-bold mt-6 mb-3">Regular Heading (Not Collapsible)</h3>
        <p>This is a regular h3 heading without being wrapped in a Collapsible component.</p>

        <Collapsible title="Another Level 3 Collapsible" level="h3" section="learn">
          <p>This is a second h3 collapsible at the same level. Each maintains its own state.</p>
        </Collapsible>
      </Collapsible>

      <h2 className="text-2xl font-bold mt-12 mb-4">Regular H2 Section</h2>
      <p>This is not collapsible - just a regular h2 heading.</p>

      <Collapsible title="Act Page Style Test" level="h2" section="act">
        <p>This collapsible uses the &quot;act&quot; section prop, so it should have:</p>
        <ul>
          <li>Orange border accent instead of teal</li>
          <li>Orange hover effect instead of teal</li>
        </ul>

        <Collapsible title="Nested Act Style" level="h3" section="act">
          <p>Nested collapsibles in act pages also use orange styling.</p>
        </Collapsible>
      </Collapsible>

      <Collapsible title="Empty Section Test" level="h2" section="learn">
        {/* This collapsible has no content to test empty state handling */}
      </Collapsible>

      <div className="mt-12 p-6 bg-blue-50 border-l-4 border-blue-500">
        <h2 className="text-xl font-bold mb-4">Test Checklist</h2>
        <p className="mb-2">When testing this page, verify:</p>
        <ul className="space-y-1">
          <li>✅ h2 collapsibles render with light gray background</li>
          <li>✅ h3 collapsibles render with medium gray and indentation</li>
          <li>✅ h4 collapsibles render with dark gray and deep indentation</li>
          <li>✅ Chevron icon rotates smoothly on expand/collapse</li>
          <li>✅ Content transitions smoothly (no jumps)</li>
          <li>✅ Nested collapsibles maintain independent state</li>
          <li>✅ Act pages use orange accents, learn pages use teal</li>
          <li>✅ Keyboard navigation works (Tab, Enter, Space)</li>
          <li>✅ Mobile responsive (test on small screen)</li>
        </ul>
      </div>
    </article>
  )
}
