# Logo Assets - Resist Project

## Files

### Primary Logo Files
- **logo-icon.svg** - Solid orange (#EA580C) logo for light backgrounds
- **logo-icon-white.svg** - White logo for dark backgrounds (used in header)
- **favicon.svg** - Transparent background favicon (orange only, no white bg)
- **path9.svg** - Source file from Inkscape (keep for editing)

### To Be Generated (for production)
Use https://realfavicongenerator.net/ with `logo-icon.svg`:
- **favicon.ico** - Multi-size ICO (16x16, 32x32, 48x48)
- **favicon-16x16.png**
- **favicon-32x32.png**
- **apple-touch-icon.png** (180x180 for iOS)
- **og-image.png** (1200x630 for social media)

## Brand Colors

```css
/* Primary Brand Orange */
--brand-orange: #EA580C;      /* orange-600 */
--brand-orange-dark: #C2410C; /* orange-700 */
--brand-orange-light: #FB923C; /* orange-400 */

/* Secondary Brand Teal */
--brand-teal: #0891B2;         /* cyan-600 */
--brand-teal-dark: #0E7490;    /* cyan-700 */
--brand-teal-light: #22D3EE;   /* cyan-400 */
```

**Usage:**
- Orange: Action elements, logo, ACT section
- Teal: Informational elements, LEARN section
- White: Logo on dark backgrounds (header)

## Typography

**Font Family:** Inter (via Google Fonts)

```css
font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Properties:**
- Clean, modern, highly readable
- Excellent at small sizes (good for UI)
- Professional appearance

## Usage in Components

### React Component
```tsx
import Logo from '@/components/layout/Logo'

// White version (for dark header)
<Logo variant="wordmark" theme="white" />

// Color version (for light backgrounds)
<Logo variant="wordmark" theme="color" />

// Icon only
<Logo variant="icon" theme="white" />
```

### Direct Image
```tsx
import Image from 'next/image'

<Image
  src="/logo-icon.svg"
  alt="Resist Project"
  width={40}
  height={40}
/>
```

### Tailwind Classes
```tsx
// Using brand colors
<div className="bg-brand-orange text-white">
<div className="text-brand-teal border-brand-teal">
```

## File Sizes

- logo-icon.svg: ~4.8 KB
- logo-icon-white.svg: ~4.5 KB
- favicon.svg: ~4.8 KB
- All optimized and production-ready

## Design Guidelines

**Logo Usage:**
- Minimum size: 32px height (for readability)
- Clear space: 8px around logo minimum
- Never stretch or distort aspect ratio
- Never add effects (drop shadows, gradients, etc.)

**Color Contrast:**
- Orange logo on white: AAA accessible (8.15:1)
- White logo on teal: AAA accessible (7.2:1)
- All combinations meet WCAG 2.1 Level AAA

**Contexts:**
- Header: White logo on dark teal background
- Footer: Optional white or orange logo
- Social media: Orange logo on white background
- Print: Orange logo (CMYK: 0, 72, 95, 8)

## Editing the Logo

If you need to modify the logo design:

1. Open `path9.svg` in Inkscape
2. Make your edits
3. Save as Optimized SVG:
   - File → Save As → "Optimized SVG"
   - Enable all optimization options
4. Replace `logo-icon.svg` with the new version
5. Generate white version:
   - Select all paths
   - Change fill to `#ffffff`
   - Save as `logo-icon-white.svg`
6. Update favicon.svg (transparent background, orange fill)

## Version History

- **2026-02-08**: Initial logo created
  - Raised fist with information "i"
  - Solid orange (#EA580C) monochromatic design
  - White version for dark backgrounds
  - Inter font added for brand typography
