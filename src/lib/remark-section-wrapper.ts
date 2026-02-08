import { visit, SKIP } from 'unist-util-visit'
import type { Root, Heading, Paragraph, Link, Text, PhrasingContent } from 'mdast'

interface SectionDefinition {
  name: string
  component: string
  matchHeadings: string[] // Case-insensitive matches
  autoIntro?: string // Auto-insert intro text after heading
}

const SECTION_DEFINITIONS: SectionDefinition[] = [
  {
    name: 'quick-summary',
    component: 'QuickSummary',
    matchHeadings: ['quick summary', 'summary'],
  },
  {
    name: 'facts',
    component: 'FactsSection',
    matchHeadings: ['facts'],
  },
  {
    name: 'analysis',
    component: 'AnalysisSection',
    matchHeadings: ['analysis'],
  },
  {
    name: 'quick-actions',
    component: 'div', // Not a special component, just gets intro text
    matchHeadings: ['quick actions'],
    autoIntro: 'Complete these in under 5 minutes',
  },
  {
    name: 'sustained-actions',
    component: 'div',
    matchHeadings: ['sustained actions'],
    autoIntro: 'Ongoing actions requiring more time commitment',
  },
  {
    name: 'resources',
    component: 'div',
    matchHeadings: ['resources'],
  },
]

/**
 * Extract text content from heading children
 */
function getHeadingText(heading: Heading): string {
  const textParts: string[] = []

  function extractText(node: PhrasingContent): void {
    if (node.type === 'text') {
      textParts.push(node.value)
    } else if ('children' in node) {
      ;(node.children as PhrasingContent[]).forEach(extractText)
    }
  }

  heading.children.forEach(extractText)
  return textParts.join('').trim().toLowerCase()
}

/**
 * Find which section definition matches a heading
 */
function matchSection(headingText: string): SectionDefinition | null {
  return SECTION_DEFINITIONS.find(def =>
    def.matchHeadings.includes(headingText)
  ) || null
}

/**
 * Create an MDX JSX element node with proper structure
 */
function createMDXElement(
  name: string,
  props: Record<string, string> = {},
  children: any[] = []
): any {
  return {
    type: 'mdxJsxFlowElement',
    name,
    attributes: Object.entries(props).map(([key, value]) => ({
      type: 'mdxJsxAttribute',
      name: key,
      value: value,
    })),
    children,
    data: { _mdxExplicitJsx: true },
  }
}

/**
 * Create a text node
 */
function createText(value: string): Text {
  return {
    type: 'text',
    value,
  }
}

/**
 * Transform arrow links to CTA boxes
 * [→ Take Action: Text](url) → <ActNowBox href="url">Text</ActNowBox>
 * [← Learn More: Text](url) → <LearnMoreBox href="url">Text</LearnMoreBox>
 */
function transformCTALinks(tree: Root): void {
  visit(tree, (node: any) => {
    // Visit all nodes including those inside mdxJsxFlowElement
    return true
  }, (node: any, index, parent: any) => {
    if (node.type !== 'paragraph' || !parent || index === undefined) return

    // Check if paragraph contains only a single link
    if (node.children.length === 1 && node.children[0].type === 'link') {
      const link = node.children[0] as Link

      // Get link text
      let text = ''
      link.children.forEach((child: PhrasingContent) => {
        if (child.type === 'text') {
          text += child.value
        }
      })
      text = text.trim()

      // Check for arrow prefixes
      if (text.startsWith('→')) {
        // ActNowBox
        const cleanText = text.replace(/^→\s*(?:Take Action:\s*)?/, '').trim()
        const actNowBox = createMDXElement('ActNowBox', { href: link.url }, [createText(cleanText)])
        parent.children[index] = actNowBox
        return [SKIP, index]
      } else if (text.startsWith('←')) {
        // LearnMoreBox
        const cleanText = text.replace(/^←\s*(?:Learn More:\s*)?/, '').trim()
        const learnMoreBox = createMDXElement('LearnMoreBox', { href: link.url }, [createText(cleanText)])
        parent.children[index] = learnMoreBox
        return [SKIP, index]
      }
    }
  })
}

/**
 * Transform source links
 * [source: Label](url) → <SourceLink href="url" label="Label" />
 */
function transformSourceLinks(tree: Root): void {
  visit(tree, (node: any) => {
    // Visit all nodes including those inside mdxJsxFlowElement
    return true
  }, (node: any, index, parent: any) => {
    if (node.type !== 'paragraph' || !parent || index === undefined) return

    // Check if paragraph contains only a single link
    if (node.children.length === 1 && node.children[0].type === 'link') {
      const link = node.children[0] as Link

      // Get link text
      let text = ''
      link.children.forEach((child: PhrasingContent) => {
        if (child.type === 'text') {
          text += child.value
        }
      })
      text = text.trim()

      // Check for source: prefix (case-insensitive)
      const sourceMatch = text.match(/^source:\s*(.+)$/i)
      if (sourceMatch) {
        const label = sourceMatch[1].trim()
        const sourceLink = createMDXElement('SourceLink', { href: link.url, label }, [])
        parent.children[index] = sourceLink
        return [SKIP, index]
      }
    }
  })
}

/**
 * Process children array (works recursively on nested JSX)
 */
function processChildren(children: any[]): any[] {
  const newChildren: any[] = []
  let currentSection: {
    definition: SectionDefinition
    heading: Heading
    content: any[]
  } | null = null

  for (let i = 0; i < children.length; i++) {
    const node = children[i]

    // Check if this is a CTA box (ActNowBox or LearnMoreBox)
    const isCTABox = node.type === 'mdxJsxFlowElement' &&
                     (node.name === 'ActNowBox' || node.name === 'LearnMoreBox')

    if (isCTABox) {
      // Check if we're currently building a QuickSummary section
      if (currentSection && currentSection.definition.name === 'quick-summary') {
        // Close the QuickSummary section first
        const quickSummary = wrapSection(currentSection)
        currentSection = null

        // Wrap QuickSummary and CTA box together in TopSection
        const topSection = createMDXElement('TopSection', {}, [quickSummary, node])
        newChildren.push(topSection)
        continue
      }

      // Check if the previous element is a QuickSummary - if so, wrap them together in TopSection
      if (newChildren.length > 0) {
        const lastElement = newChildren[newChildren.length - 1]
        const isQuickSummary = lastElement.type === 'mdxJsxFlowElement' && lastElement.name === 'QuickSummary'

        if (isQuickSummary) {
          // Remove the QuickSummary from newChildren and wrap both in TopSection
          // Order: QuickSummary first (left/top), then CTA box (right/bottom)
          newChildren.pop()
          const topSection = createMDXElement('TopSection', {}, [lastElement, node])
          newChildren.push(topSection)
          continue
        }
      }

      // Not following a QuickSummary, add as standalone
      newChildren.push(node)
      continue
    }

    // If this is an MDX JSX element (but not CTA box), recursively process its children
    if (node.type === 'mdxJsxFlowElement' && node.children) {
      node.children = processChildren(node.children)

      // After processing children, check if we have a current section
      if (currentSection) {
        currentSection.content.push(node)
      } else {
        newChildren.push(node)
      }
      continue
    }

    // Check if this is an h2 heading
    if (node.type === 'heading' && (node as Heading).depth === 2) {
      // If we have a current section, close it
      if (currentSection) {
        newChildren.push(wrapSection(currentSection))
        currentSection = null
      }

      const headingText = getHeadingText(node as Heading)
      const sectionDef = matchSection(headingText)

      if (sectionDef) {
        // Start a new recognized section
        currentSection = {
          definition: sectionDef,
          heading: node as Heading,
          content: [],
        }
      } else {
        // Unrecognized h2 - keep as-is
        newChildren.push(node)
      }
    } else {
      // Regular content node
      if (currentSection) {
        // Add to current section
        currentSection.content.push(node)
      } else {
        // Not in a section - keep as-is
        newChildren.push(node)
      }
    }
  }

  // Close final section if any
  if (currentSection) {
    newChildren.push(wrapSection(currentSection))
  }

  return newChildren
}

/**
 * Main section wrapping logic
 */
function wrapSections(tree: Root): void {
  tree.children = processChildren(tree.children) as any
}

/**
 * Wrap a section in its component
 */
function wrapSection(section: {
  definition: SectionDefinition
  heading: Heading
  content: any[]
}): any {
  const { definition, content } = section

  // For sections with auto-intro, insert intro text at start of content
  let finalContent: any[] = content
  if (definition.autoIntro) {
    const intro = createMDXElement('SectionIntro', {}, [createText(definition.autoIntro)])
    finalContent = [intro, ...content]
  }

  // Create wrapper component
  // Note: The heading is NOT included in the wrapper - the component provides its own heading
  return createMDXElement(definition.component, {}, finalContent)
}

/**
 * Remark plugin to transform sections
 */
export default function remarkSectionWrapper() {
  return (tree: Root) => {
    // Phase 1: Transform links (must happen before section wrapping)
    transformCTALinks(tree)
    transformSourceLinks(tree)

    // Phase 2: Wrap sections
    wrapSections(tree)
  }
}
