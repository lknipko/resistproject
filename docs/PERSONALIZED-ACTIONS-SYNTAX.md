# Personalized Actions - Simple Syntax Guide

## Overview

This document defines the simple markdown syntax for embedding personalized action components in Act pages. The syntax is designed to be:
- **Simple** - Easy for content authors to use
- **Reliable** - Works with MDX compilation
- **Flexible** - Supports variable substitution and customization

---

## Design Principles

1. **Use simple shorthand for simple cases** (e.g., showing representative cards)
2. **Use JSX for complex cases** (e.g., email templates with long bodies)
3. **Make variable substitution obvious** with `{variableName}` syntax
4. **Keep it readable** - The source should be easy to scan and edit

---

## Syntax Reference

### 1. Representative Cards

**Purpose:** Display user's representatives with contact info and photos

**Syntax:**
```markdown
[[reps]]                    # Show all representatives (2 senators + 1 rep)
[[reps:senators]]           # Show only senators
[[reps:representative]]     # Show only house representative
```

**Examples:**
```markdown
## Your Representatives

Complete your civic profile to see your representatives.

[[reps]]
```

**Output:**
- Representative cards with photo, name, party, phone, website
- Automatically filtered based on user's zip code
- Shows sign-in prompt if user not authenticated

---

### 2. Email Templates

**Purpose:** Pre-filled email/contact form templates with variable substitution

**Syntax:**
```jsx
<EmailTemplate
  subject="Subject line with {repName}"
  repType="senator"
  body={`Email body with variables:

Dear {repName},

I am {firstName} {lastName} from {zipCode}...

Thank you.`}
/>
```

**Parameters:**
- `subject` - Email subject (can include variables)
- `repType` - Filter representatives: `"senator"`, `"representative"`, or `"all"`
- `body` - Email body (use template literals with backticks for multi-line)

**Available Variables:**
- `{firstName}` - User's first name
- `{lastName}` - User's last name
- `{zipCode}` - User's zip code
- `{repName}` - Representative's full name (auto-populated)

**Examples:**

**Email to Senators:**
```jsx
<EmailTemplate
  subject="Demand oversight of DOGE"
  repType="senator"
  body={`Dear Senator {repName},

I am writing as your constituent from {zipCode} to urge congressional oversight of DOGE.

Thank you for your attention.

Sincerely,
{firstName} {lastName}`}
/>
```

**Email to House Representative:**
```jsx
<EmailTemplate
  subject="Support H.R. 1234"
  repType="representative"
  body={`Dear Representative {repName},

I urge you to support H.R. 1234...

{firstName} {lastName}
{zipCode}`}
/>
```

**Output:**
- One card per matching representative
- "Open Contact Form →" button (most reps use forms, not email)
- Preview with "Copy Message" button for easy copy/paste
- ✓ Copy feedback when clicked

---

### 3. Call Scripts

**Purpose:** Phone scripts with click-to-call functionality

**Syntax:**
```jsx
<CallRepButton
  repType="senator"
  script={`Hello, my name is {firstName} {lastName} from {zipCode}.

I'm calling to urge Senator {repName} to support [issue].

Thank you.`}
/>
```

**Parameters:**
- `repType` - Filter representatives: `"senator"`, `"representative"`, or `"all"`
- `script` - Phone script (use template literals with backticks for multi-line)

**Available Variables:** Same as EmailTemplate

**Examples:**

**Call Senators:**
```jsx
<CallRepButton
  repType="senator"
  script={`Hello, I'm {firstName} {lastName} calling from {zipCode}.

I urge Senator {repName} to demand DOGE oversight.

Thank you for your time.`}
/>
```

**Output:**
- One button per matching representative
- "Call {Rep Name} →" with phone number
- Click opens phone dialer with number
- Shows script with variables filled in

---

## Complete Page Example

```markdown
---
title: "Contact Congress"
type: "act"
---

<PageHeader type="act" />
<PageContent>

# Contact Congress

## Quick Summary

Your representatives need to hear from constituents. Below are personalized templates.

## Your Representatives

[[reps]]

## Email Your Senators

<EmailTemplate
  subject="Demand congressional oversight"
  repType="senator"
  body={`Dear Senator {repName},

I am writing from {zipCode} to urge oversight of federal agencies.

Thank you,
{firstName} {lastName}`}
/>

## Call Your Representative

<CallRepButton
  repType="representative"
  script={`Hi, I'm {firstName} {lastName} from {zipCode}.

I'm calling Representative {repName} about H.R. 1234.

Thank you.`}
/>

</PageContent>
```

---

## Implementation Plan

### Phase 1: Enhance Remark Plugin (Simple Syntax)

**File:** `src/lib/remark-section-wrapper.ts`

**Add transformations for:**
1. `[[reps]]` → `<RepresentativeCard />`
2. `[[reps:senators]]` → `<RepresentativeCard repType="senator" />`
3. `[[reps:representative]]` → `<RepresentativeCard repType="representative" />`

**Implementation approach:**
- Look for paragraph nodes containing only `[[reps...]]`
- Transform to JSX component nodes
- Simple, single-line patterns only (no multi-line blocks)

### Phase 2: Keep JSX for Complex Components

**Email and Call templates remain as JSX components because:**
- Multi-line content is complex to parse reliably
- Template literals (backticks) work well for this
- JSX gives clear structure and TypeScript support
- Variables are easy to see: `{firstName}`

### Phase 3: Documentation

**Create content author guide:**
- When to use `[[reps]]` vs JSX
- How to use variables
- Common patterns and examples
- Troubleshooting tips

### Phase 4: Template Files

**Update templates:**
- `templates/act-page.md` - Show full examples
- Include commented-out alternatives
- Provide copy-paste snippets

---

## Why This Approach?

### ✅ Pros
1. **Simple for common cases** - `[[reps]]` is easy to remember
2. **Reliable** - JSX components compile correctly every time
3. **Flexible** - Can handle complex templates with variables
4. **Clear** - Easy to see what variables are available
5. **Type-safe** - TypeScript catches errors in JSX
6. **Maintainable** - Clear what each component does

### ❌ Why Not Full Custom Syntax?

Attempting to parse complex multi-line blocks like:
```
[[email]]
subject: ...
body: ...
[[/email]]
```

**Problems:**
- MDX parser struggles with multi-line custom syntax
- Variable substitution harder to implement reliably
- Error messages less clear when things go wrong
- More maintenance burden for custom parser

**JSX solves this:** Already works, TypeScript support, clear errors.

---

## Migration Path

### Existing Content
- Current contact-congress.mdx already uses JSX approach ✓
- No migration needed

### New Content
- Authors can use `[[reps]]` for representative cards
- Authors use JSX for email/call templates
- Templates provide copy-paste examples

### Future Enhancements
- Could add more shorthands if patterns emerge:
  - `[[call:senators]]` with inline script?
  - `[[email:quick]]` for common templates?
- Wait to see what content authors actually need

---

## Alternative Considered: Code Blocks

**Idea:** Use fenced code blocks with special language tags:

````markdown
```email-template type="senator"
subject: Demand oversight
---
Dear {repName}...
```
````

**Pros:** Familiar to developers, syntax highlighting
**Cons:** More verbose than JSX, requires custom parser, less clear

**Decision:** Stick with JSX for now, code blocks could be added later if needed.

---

## Summary

**Recommended Syntax:**

| Use Case | Syntax | Complexity |
|----------|--------|------------|
| Show all reps | `[[reps]]` | Simple |
| Show senators only | `[[reps:senators]]` | Simple |
| Show house rep only | `[[reps:representative]]` | Simple |
| Email template | `<EmailTemplate ... />` | Complex |
| Call script | `<CallRepButton ... />` | Complex |

**Key Point:** Use the right tool for the job. Simple syntax for simple cases, JSX for complex cases.

---

## Next Steps

1. ✅ RepresentativeCard, EmailTemplate, CallRepButton components working
2. ✅ Geocodio API integration working
3. ✅ Variable substitution working
4. ✅ Copy feedback working
5. ⏭️ Implement `[[reps]]` shorthand in remark plugin
6. ⏭️ Update templates with examples
7. ⏭️ Create content author documentation
8. ⏭️ Test on multiple Act pages

---

**Last Updated:** 2026-02-10
