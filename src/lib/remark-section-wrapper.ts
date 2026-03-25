import { visit, SKIP } from 'unist-util-visit'
import type { Root, Heading, Paragraph, Link, Text, PhrasingContent, ListItem } from 'mdast'

/**
 * Generate a slug from text (similar to rehype-slug)
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

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

interface CollapsibleInfo {
  cleanTitle: string  // Title with [+] stripped
  level: 'h2' | 'h3' | 'h4'
}

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
  return textParts.join('').trim()
}

/**
 * Extract text from paragraph or phrasing content
 */
function extractText(node: any): string {
  if (node.type === 'text') {
    return node.value
  }
  if (node.children) {
    return node.children.map(extractText).join('')
  }
  return ''
}

/**
 * Detect if a heading is marked as collapsible with [+] pattern
 */
function detectCollapsibleHeading(heading: Heading): CollapsibleInfo | null {
  const text = getHeadingText(heading)

  // Check for [+] pattern at the start (case-insensitive)
  const collapsibleMatch = text.match(/^\[\+\]\s*(.+)$/i)

  if (!collapsibleMatch) {
    return null
  }

  // Map depth to level string
  const levelMap: Record<number, 'h2' | 'h3' | 'h4'> = {
    2: 'h2',
    3: 'h3',
    4: 'h4'
  }

  const level = levelMap[heading.depth]
  if (!level) {
    return null // Only support h2, h3, h4
  }

  return {
    cleanTitle: collapsibleMatch[1].trim(),
    level
  }
}

/**
 * Detect if a list item is marked as collapsible with [+] pattern
 * Returns the clean title and whether the first paragraph has additional content
 */
function detectCollapsibleListItem(listItem: ListItem): { cleanTitle: string; firstParaHasContent: boolean } | null {
  // Get the first child (usually a paragraph)
  if (!listItem.children || listItem.children.length === 0) {
    return null
  }

  const firstChild = listItem.children[0]

  // Only process if first child is a paragraph
  if (firstChild.type !== 'paragraph') {
    return null
  }

  const text = extractText(firstChild)

  // Check for [+] pattern at the start - capture just the first line/sentence
  const collapsibleMatch = text.match(/^\[\+\]\s*(.+?)(?:\n|$)/i)

  if (!collapsibleMatch) {
    return null
  }

  const title = collapsibleMatch[1].trim()
  const restOfText = text.substring(collapsibleMatch[0].length).trim()

  return {
    cleanTitle: title,
    firstParaHasContent: restOfText.length > 0
  }
}

/**
 * Collect content for a collapsible section
 * Collects nodes until we hit a heading of same or higher level
 */
function collectCollapsibleContent(children: any[], startIndex: number, currentLevel: number): any[] {
  const content: any[] = []

  for (let i = startIndex; i < children.length; i++) {
    const node = children[i]

    // Stop if we hit a heading of same or higher level (lower depth number = higher level)
    if (node.type === 'heading' && (node as Heading).depth <= currentLevel) {
      break
    }

    content.push(node)
  }

  return content
}

/**
 * Process list items for collapsibles
 */
function processListItems(listNode: any, section: 'learn' | 'act'): any {
  if (!listNode.children) {
    return listNode
  }

  const newChildren: any[] = []

  for (const item of listNode.children) {
    if (item.type !== 'listItem') {
      newChildren.push(item)
      continue
    }

    const collapsibleInfo = detectCollapsibleListItem(item as ListItem)

    if (collapsibleInfo) {
      // This is a collapsible list item
      // All children become the collapsible content
      let contentChildren = item.children.slice(1) // Skip first paragraph with title

      // If first paragraph has content after the title, we need to include it
      if (collapsibleInfo.firstParaHasContent && item.children[0]) {
        // Clone the first paragraph and remove the [+] title from its text
        const firstPara = { ...item.children[0] }
        // We'll just include all children - the title will be in the Collapsible header
        contentChildren = item.children.slice(1)
      }

      // Recursively process content for nested collapsibles and lists
      const processedContent = processCollapsibles(contentChildren, section)

      // Create Collapsible wrapper with level='li' and id for anchor links
      const collapsible = createMDXElement(
        'Collapsible',
        {
          title: collapsibleInfo.cleanTitle,
          level: 'li',
          section,
          id: slugify(collapsibleInfo.cleanTitle)
        },
        processedContent
      )

      newChildren.push(collapsible)
    } else {
      // Regular list item - but still process its children for nested lists
      if (item.children) {
        item.children = processCollapsibles(item.children, section)
      }
      newChildren.push(item)
    }
  }

  listNode.children = newChildren
  return listNode
}

/**
 * Process collapsibles recursively
 * This runs BEFORE section wrapping to allow collapsibles inside sections
 */
function processCollapsibles(children: any[], section: 'learn' | 'act' = 'learn'): any[] {
  const newChildren: any[] = []
  let i = 0

  while (i < children.length) {
    const node = children[i]

    // Recursively process MDX JSX element children
    if (node.type === 'mdxJsxFlowElement' && node.children) {
      node.children = processCollapsibles(node.children, section)
      newChildren.push(node)
      i++
      continue
    }

    // Process lists for collapsible list items
    if (node.type === 'list') {
      const processedList = processListItems(node, section)
      newChildren.push(processedList)
      i++
      continue
    }

    // Check if this is a collapsible heading
    if (node.type === 'heading' && (node.depth === 2 || node.depth === 3 || node.depth === 4)) {
      const collapsibleInfo = detectCollapsibleHeading(node as Heading)

      if (collapsibleInfo) {
        // This is a collapsible heading - collect its content
        const content = collectCollapsibleContent(children, i + 1, node.depth)

        // Recursively process content for nested collapsibles
        const processedContent = processCollapsibles(content, section)

        // Create Collapsible wrapper with id for anchor links
        const collapsible = createMDXElement(
          'Collapsible',
          {
            title: collapsibleInfo.cleanTitle,
            level: collapsibleInfo.level,
            section,
            id: slugify(collapsibleInfo.cleanTitle)
          },
          processedContent
        )

        newChildren.push(collapsible)

        // Skip the heading and all collected content
        i += content.length + 1
        continue
      }
    }

    // Not a collapsible - keep as-is
    newChildren.push(node)
    i++
  }

  return newChildren
}

/**
 * Find which section definition matches a heading
 */
function matchSection(headingText: string): SectionDefinition | null {
  const lower = headingText.toLowerCase()
  return SECTION_DEFINITIONS.find(def =>
    def.matchHeadings.includes(lower)
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
 * Extract source label from a link node if it matches [source: Label](url)
 * Returns { href, label } or null
 */
function extractSourceFromLink(link: any): { href: string; label: string } | null {
  const text = extractText(link).trim()
  const match = text.match(/^source:\s*(.+)$/i)
  if (match) {
    return { href: link.url, label: match[1].trim() }
  }
  return null
}

/**
 * Transform source links
 * [source: Label](url) → <SourceLink href="url" label="Label" />
 * [source: A](url1) | [source: B](url2) → <SourceGroup sources='[...]' />
 */
function transformSourceLinks(tree: Root): void {
  visit(tree, (node: any) => {
    // Visit all nodes including those inside mdxJsxFlowElement
    return true
  }, (node: any, index, parent: any) => {
    if (node.type !== 'paragraph' || !parent || index === undefined) return

    const children = node.children

    // Case 1: Single source link (paragraph with exactly one child)
    if (children.length === 1 && children[0].type === 'link') {
      const source = extractSourceFromLink(children[0])
      if (source) {
        const sourceLink = createMDXElement('SourceLink', { href: source.href, label: source.label }, [])
        parent.children[index] = sourceLink
        return [SKIP, index]
      }
    }

    // Case 2: Multiple source links separated by pipes or newlines
    // e.g. [source: A](url1) | [source: B](url2)
    // or consecutive lines:
    // [source: A](url1)
    // [source: B](url2)
    if (children.length >= 2) {
      const sources: Array<{ href: string; label: string }> = []
      let allSourcesAndSeparators = true

      for (const child of children) {
        if (child.type === 'link') {
          const source = extractSourceFromLink(child)
          if (source) {
            sources.push(source)
          } else {
            allSourcesAndSeparators = false
            break
          }
        } else if (child.type === 'text') {
          // Allow pipe separators, whitespace, or newlines between sources
          if (!/^[\s|]*$/.test(child.value)) {
            allSourcesAndSeparators = false
            break
          }
        } else {
          allSourcesAndSeparators = false
          break
        }
      }

      if (allSourcesAndSeparators && sources.length >= 2) {
        const sourceGroup = createMDXElement('SourceGroup', { sources: JSON.stringify(sources) }, [])
        parent.children[index] = sourceGroup
        return [SKIP, index]
      }
    }

    // Case 3: Trailing source links at end of mixed content paragraph
    // e.g. "Some text [source: A](url1) | [source: B](url2)"
    if (children.length >= 2) {
      let trailingStart = children.length
      for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i]
        if (child.type === 'link' && extractSourceFromLink(child)) {
          trailingStart = i
        } else if (child.type === 'text' && /^[\s|]*$/.test(child.value)) {
          trailingStart = i
        } else {
          break
        }
      }

      if (trailingStart < children.length && trailingStart > 0) {
        const trailingSources: Array<{ href: string; label: string }> = []
        for (const child of children.slice(trailingStart)) {
          if (child.type === 'link') {
            const source = extractSourceFromLink(child)
            if (source) trailingSources.push(source)
          }
        }

        if (trailingSources.length >= 1) {
          // Trim trailing whitespace/pipe from last content node
          const contentChildren = children.slice(0, trailingStart)
          const lastContent = contentChildren[contentChildren.length - 1]
          if (lastContent?.type === 'text') {
            lastContent.value = lastContent.value.replace(/\s*\|?\s*$/, '')
          }
          node.children = contentChildren

          // Insert source element after the paragraph
          const sourceElement = trailingSources.length === 1
            ? createMDXElement('SourceLink', { href: trailingSources[0].href, label: trailingSources[0].label }, [])
            : createMDXElement('SourceGroup', { sources: JSON.stringify(trailingSources) }, [])
          parent.children.splice(index + 1, 0, sourceElement)
          return [SKIP, index]
        }
      }
    }
  })
}

/**
 * Transform photo links
 * [photo: Caption | Credit](url) → <ContentPhoto src="url" caption="Caption" credit="Credit" />
 */
function transformPhotoLinks(tree: Root): void {
  visit(tree, (node: any) => {
    return true
  }, (node: any, index, parent: any) => {
    if (node.type !== 'paragraph' || !parent || index === undefined) return

    if (node.children.length === 1 && node.children[0].type === 'link') {
      const link = node.children[0] as Link

      let text = ''
      link.children.forEach((child: PhrasingContent) => {
        if (child.type === 'text') text += child.value
      })
      text = text.trim()

      const photoMatch = text.match(/^photo:\s*(.+)$/i)
      if (!photoMatch) return

      const payload = photoMatch[1].trim()
      const pipeIndex = payload.indexOf(' | ')
      let caption: string
      let credit: string | undefined

      if (pipeIndex !== -1) {
        caption = payload.substring(0, pipeIndex).trim()
        credit = payload.substring(pipeIndex + 3).trim() || undefined
      } else {
        caption = payload
      }

      const props: Record<string, string> = { src: link.url, caption }
      if (credit) props.credit = credit

      const photoElement = createMDXElement('ContentPhoto', props, [])
      parent.children[index] = photoElement
      return [SKIP, index]
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
  const { definition, heading, content } = section

  // For sections with auto-intro, insert intro text at start of content
  let finalContent: any[] = content
  if (definition.autoIntro) {
    const intro = createMDXElement('SectionIntro', {}, [createText(definition.autoIntro)])
    finalContent = [intro, ...content]
  }

  // For 'div' component (simple wrapper), preserve the heading
  if (definition.component === 'div') {
    return createMDXElement(definition.component, {}, [heading, ...finalContent])
  }

  // For special components, exclude the heading (component provides its own)
  return createMDXElement(definition.component, {}, finalContent)
}

/**
 * Transform personalized action blocks to components
 * [[email]] ... [[/email]] → <EmailTemplate />
 * [[call]] ... [[/call]] → <CallRepButton />
 * [[reps]] → <RepresentativeCard />
 */
function transformPersonalizedActions(tree: Root): void {
  visit(tree, 'paragraph', (node: any, index, parent: any) => {
    if (!parent || index === undefined || !node.children) return

    // Check if paragraph contains the [[email]], [[call]], or [[reps]] marker
    const text = extractText(node)

    // Handle [[reps]] variants - single line components
    const repsMatch = text.trim().match(/^\[\[reps(?::(\w+))?\]\]$/)
    if (repsMatch) {
      const filter = repsMatch[1] // undefined, 'senators', or 'representative'
      const props: Record<string, string> = {}

      if (filter === 'senators') {
        props.repType = 'senator'
      } else if (filter === 'representative') {
        props.repType = 'representative'
      }
      // If no filter, show all (default behavior)

      const repCard = createMDXElement('RepresentativeCard', props, [])
      parent.children[index] = repCard
      return [SKIP, index]
    }

    // Handle [[email]] and [[call]] - multi-line blocks
    // These will be in multiple consecutive paragraphs, so we need to collect them
    const emailMatch = text.match(/^\[\[email\]\]/)
    const callMatch = text.match(/^\[\[call\]\]/)

    if (emailMatch || callMatch) {
      const componentType = emailMatch ? 'EmailTemplate' : 'CallRepButton'
      const endMarker = emailMatch ? '[[/email]]' : '[[/call]]'

      // Collect all content until we find the end marker
      const blockContent: string[] = []
      let endIndex = index

      // Start collecting from current node
      for (let i = index; i < parent.children.length; i++) {
        const currentNode = parent.children[i]
        const currentText = extractText(currentNode)

        blockContent.push(currentText)

        if (currentText.includes(endMarker)) {
          endIndex = i
          break
        }
      }

      // Join all content and parse it
      const fullContent = blockContent.join('\n')
      const parsed = parsePersonalizedActionBlock(fullContent, componentType)

      if (parsed) {
        // Create the component
        const component = createMDXElement(componentType, parsed.props, [])

        // Replace the start node with the component
        parent.children[index] = component

        // Remove all nodes that were part of this block (except the first)
        if (endIndex > index) {
          parent.children.splice(index + 1, endIndex - index)
        }

        return [SKIP, index]
      }
    }
  })
}

/**
 * Parse [[email]] or [[call]] block content
 * Format:
 * [[email]]
 * subject: Subject text here
 * repType: senator
 * ---
 * Body text here
 * [[/email]]
 */
function parsePersonalizedActionBlock(
  content: string,
  componentType: 'EmailTemplate' | 'CallRepButton'
): { props: Record<string, string> } | null {
  // Remove the markers (using [\s\S] instead of . with /s flag for ES5 compatibility)
  const markerPattern = componentType === 'EmailTemplate'
    ? /^\[\[email\]\]([\s\S]*)\[\[\/email\]\]$/
    : /^\[\[call\]\]([\s\S]*)\[\[\/call\]\]$/

  const match = content.match(markerPattern)
  if (!match) return null

  const innerContent = match[1].trim()

  // Split by --- separator (frontmatter separator)
  const parts = innerContent.split(/^---$/m)

  if (parts.length < 2) {
    // No separator found - treat entire content as body/script
    if (componentType === 'EmailTemplate') {
      return {
        props: {
          subject: 'Contact your representative',
          body: innerContent,
          repType: 'all'
        }
      }
    } else {
      return {
        props: {
          script: innerContent,
          repType: 'all'
        }
      }
    }
  }

  // Parse frontmatter (YAML-like key: value pairs)
  const frontmatter = parts[0].trim()
  const body = parts.slice(1).join('---').trim()

  const props: Record<string, string> = {}

  // Parse frontmatter lines
  const lines = frontmatter.split('\n')
  for (const line of lines) {
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) continue

    const key = line.substring(0, colonIndex).trim()
    const value = line.substring(colonIndex + 1).trim()

    props[key] = value
  }

  // Add body/script
  if (componentType === 'EmailTemplate') {
    props.body = body
    // Ensure required props have defaults
    if (!props.subject) props.subject = 'Contact your representative'
    if (!props.repType) props.repType = 'all'
  } else {
    props.script = body
    if (!props.repType) props.repType = 'all'
  }

  return { props }
}

/**
 * Detect section type from tree metadata (frontmatter)
 */
function detectSection(tree: Root): 'learn' | 'act' {
  // Check if tree has data.frontmatter (set by remark-frontmatter or parseFrontmatter)
  const frontmatter = (tree as any).data?.frontmatter

  if (frontmatter?.type === 'act') {
    return 'act'
  }

  // Default to 'learn' if not specified
  return 'learn'
}

/**
 * Remark plugin to transform sections
 */
export default function remarkSectionWrapper() {
  return (tree: Root) => {
    // Detect section type from frontmatter if available
    const section = detectSection(tree)

    // Phase 1: Transform links and personalized action blocks (must happen before section wrapping)
    transformCTALinks(tree)
    transformSourceLinks(tree)
    transformPhotoLinks(tree)
    transformPersonalizedActions(tree)

    // Phase 2: Process collapsibles (run before section wrapping)
    tree.children = processCollapsibles(tree.children, section) as any

    // Phase 3: Wrap sections
    wrapSections(tree)
  }
}
