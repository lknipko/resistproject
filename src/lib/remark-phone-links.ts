import { visit } from 'unist-util-visit'
import type { Root, Text, PhrasingContent } from 'mdast'

/**
 * Remark plugin to automatically convert phone numbers to tel: links
 *
 * Matches patterns like:
 * - (202) 224-3121
 * - 202-224-3121
 * - 1-844-363-1423
 * - (212) 725-6422
 */
export function remarkPhoneLinks() {
  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || index === undefined) return

      // Skip if already inside a link
      if (parent.type === 'link') return

      const text = node.value

      // Phone number pattern: optional 1-, optional (###), ###-###-####
      // Matches: (202) 224-3121, 202-224-3121, 1-844-363-1423, (212) 725-6422, etc.
      // Use lookahead/lookbehind to work after colons and other punctuation
      const phonePattern = /(^|[:\s])(1-)?(\(\d{3}\)|\d{3})[\s-]?\d{3}[\s-]?\d{4}\b/g

      const matches = Array.from(text.matchAll(phonePattern))

      if (matches.length === 0) return

      // Build array of text and link nodes
      const newNodes: PhrasingContent[] = []
      let lastIndex = 0

      for (const match of matches) {
        const fullMatch = match[0]
        const prefix = match[1] || '' // Captured colon/space before number
        const phoneText = fullMatch.slice(prefix.length) // Phone number without prefix
        const matchIndex = match.index!

        // Add text before match (including any prefix character)
        const textBefore = text.slice(lastIndex, matchIndex + prefix.length)
        if (textBefore) {
          newNodes.push({
            type: 'text',
            value: textBefore,
          })
        }

        // Create tel: link (strip everything except digits)
        const digitsOnly = phoneText.replace(/\D/g, '')
        const telLink = `tel:+1${digitsOnly.slice(-10)}` // Always use +1 for US numbers

        newNodes.push({
          type: 'link',
          url: telLink,
          children: [{
            type: 'text',
            value: phoneText,
          }],
        })

        lastIndex = matchIndex + fullMatch.length
      }

      // Add remaining text
      if (lastIndex < text.length) {
        newNodes.push({
          type: 'text',
          value: text.slice(lastIndex),
        })
      }

      // Replace the text node with new nodes
      parent.children.splice(index, 1, ...newNodes)
    })
  }
}
