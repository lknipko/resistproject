# Collapsible Sections - Contributor Guide

## What Are Collapsible Sections?

Collapsible sections allow you to hide detailed content behind an expandable header. This keeps pages scannable while still providing comprehensive information for readers who want more details.

**Use collapsibles for:**
- Evidence sections with many primary sources (10+)
- Detailed timelines with numerous events
- Technical or legal documentation
- Supporting details that aren't immediately essential

---

## Syntax

### Collapsible Headings

Add `[+]` at the start of any heading to make it collapsible:

```markdown
## [+] Primary Sources

This content is collapsed by default.

### [+] Executive Orders

This is nested inside the h2 collapsible.

### Regular Heading

This is NOT collapsible (no [+] marker).
```

**Supported levels:** h2, h3, h4

---

### Collapsible List Items

Add `[+]` at the start of a list item, with content on following lines:

```markdown
- [+] Timeline of Events

  Content here is hidden until expanded.

  Important: blank line above and 2-space indent required.

  - January 20: Event A
  - January 22: Event B

- Regular list item (not collapsible)

- [+] Another Collapsible

  More content here.
```

**Critical formatting rules:**
- ✅ Blank line between title and content
- ✅ 2-space indentation for content
- ❌ Without these, content won't be part of the list item

---

## Visual Design

### Collapsed State
- Looks like regular content with small chevron (▸)
- No background box
- Hover: title underlines

### Expanded State
- Chevron rotates down (▾)
- Content appears with subtle left border
- Indentation shows nesting level

### Colors
- **Learn pages:** Teal accents
- **Act pages:** Orange accents

---

## Examples

### Evidence Section with Multiple Sources

```markdown
## [+] Primary Sources

### [+] Executive Orders

- [source: EO 12345](https://whitehouse.gov/eo-12345)
- [source: EO 67890](https://whitehouse.gov/eo-67890)

### [+] Court Filings

- [source: District Court Filing](https://example.gov/filing-1)
- [source: Appeals Court Decision](https://example.gov/filing-2)
```

### Timeline with Collapsible Details

```markdown
## Facts

### [+] Timeline of Events

- **January 20, 2025:** Event description [source: Document](https://example.gov)
- **January 22, 2025:** Another event [source: Document](https://example.gov)

### [+] Detailed Evidence

Additional supporting documentation...
```

### Nested List with Details

```markdown
- [+] Impact on Healthcare

  Overview of healthcare impacts.

  - [+] Medicaid Changes

    Detailed information about Medicaid.

  - [+] Medicare Changes

    Detailed information about Medicare.
```

---

## Best Practices

**DO:**
- ✅ Use for sections with 5+ items/sources
- ✅ Nest collapsibles for hierarchical information
- ✅ Keep titles short and descriptive
- ✅ Use proper markdown indentation for lists

**DON'T:**
- ❌ Collapse critical summary information
- ❌ Use for short sections (2-3 items)
- ❌ Forget blank lines in list items
- ❌ Over-nest (more than 3 levels gets confusing)

---

## Accessibility

Collapsible sections are fully accessible:
- **Keyboard:** Tab to focus, Enter/Space to toggle
- **Screen readers:** Announce expanded/collapsed state
- **Mobile:** Touch-friendly, responsive indentation

---

## Testing Your Content

After adding collapsibles:
1. Preview the page
2. Click to expand/collapse
3. Check nesting works correctly
4. Test on mobile viewport
5. Verify content is properly hidden/shown

---

**Need help?** Check `/test/mdx-collapsibles` for working examples.
