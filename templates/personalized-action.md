# Personalized Action Templates - Content Guide

## Overview

Personalized action templates make civic engagement easier by automatically customizing email templates and call scripts with user-specific information. Users sign in, complete their civic profile (name, zip code), and get pre-filled templates for contacting their specific federal representatives.

**Benefits:**
- Lower barrier to action (one-click emails)
- Accurate representative contact information
- Professional, personalized messaging
- Increased conversion from page view to action taken

---

## Available Components

### 1. RepresentativeCard - Display User's Representatives

Shows the user's 2 Senators + 1 House Representative with photos, contact info, and links.

**Syntax:**
```jsx
<RepresentativeCard />
```

**When to use:**
- At the top of action pages
- In sidebars or summary sections
- Anywhere you want to show who represents the user

**Example:**
```markdown
## Your Representatives

Sign in to see your specific Senators and Representative.

<RepresentativeCard />
```

---

### 2. EmailTemplate - Pre-filled Email Links

Creates personalized email templates with `mailto:` links. Automatically identifies user's representatives and substitutes variables.

**Single Message Syntax:**
```jsx
<EmailTemplate
  subject="Your email subject here"
  repType="senator"
  body={`Dear {repName},

I am writing as your constituent from {zipCode}...

Sincerely,
{firstName} {lastName}`}
/>
```

**Multiple Messages Syntax (with topic selector):**
```jsx
<EmailTemplate repType="all">
  <EmailMessage
    topic="Budget Concerns"
    subject="Oppose cuts to essential programs"
    body={`Dear {repName},

I am writing as your constituent from {zipCode} to oppose budget cuts...

Sincerely,
{firstName} {lastName}`}
  />
  <EmailMessage
    topic="Constitutional Issues"
    subject="Protect constitutional rights"
    body={`Dear {repName},

I am writing from {zipCode} regarding constitutional concerns...

Sincerely,
{firstName} {lastName}`}
  />
</EmailTemplate>
```

**Parameters:**
- `subject` - Email subject line (supports variables) - single message only
- `body` - Email body text (supports variables) - single message only
- `repType` - Which representatives to target:
  - `senator` - Only US Senators (2 people)
  - `representative` - Only US House Rep (1 person)
  - `all` - All 3 federal representatives (default)

**EmailMessage Component (for multiple messages):**
- `topic` - Short label for the topic selector dropdown (e.g., "Budget Concerns", "Foreign Policy")
- `subject` - Email subject line (supports variables)
- `body` - Email body text (supports variables)

**Available Variables:**
- `{firstName}` → User's first name
- `{lastName}` → User's last name
- `{zipCode}` → User's zip code
- `{repName}` → Representative's name (auto-filled per rep)

**Example - Single Message:**
```jsx
## Email Your Senators

<EmailTemplate
  subject="Demand oversight of DOGE"
  repType="senator"
  body={`Dear Senator {repName},

I am writing as your constituent from {zipCode} to urge you to demand congressional oversight of the Department of Government Efficiency.

[Your policy arguments here]

I urge you to:
- [Specific ask #1]
- [Specific ask #2]

Thank you for your attention to this urgent matter.

Sincerely,
{firstName} {lastName}
{zipCode}`}
/>
```

**Example - Multiple Messages:**
```jsx
## Email Your Representatives

<EmailTemplate repType="all">
  <EmailMessage
    topic="DOGE Oversight"
    subject="Demand DOGE oversight"
    body={`Dear {repName},

I am writing from {zipCode} to demand oversight of DOGE...

Sincerely,
{firstName} {lastName}`}
  />
  <EmailMessage
    topic="Budget Transparency"
    subject="Ensure budget transparency"
    body={`Dear {repName},

I am writing from {zipCode} regarding budget transparency...

Sincerely,
{firstName} {lastName}`}
  />
</EmailTemplate>
```

---

### 3. CallRepButton - Click-to-Call with Scripts

Creates click-to-call buttons with optional call scripts. On mobile, opens phone dialer. On desktop, shows phone number.

**Single Script Syntax:**
```jsx
<CallRepButton
  repType="all"
  script={`Hello, my name is {firstName} {lastName} and I'm calling from {zipCode}.

I'm urging {repName} to [specific ask].

Thank you for your time.`}
/>
```

**Multiple Scripts Syntax (with topic selector):**
```jsx
<CallRepButton repType="all">
  <CallScript
    topic="Budget Concerns"
    script={`Hello, I'm {firstName} {lastName} from {zipCode}.

I'm calling about budget cuts affecting my community...

Thank you.`}
  />
  <CallScript
    topic="Healthcare Access"
    script={`Hi, my name is {firstName} {lastName} and I'm a constituent from {zipCode}.

I'm calling to urge {repName} to protect healthcare access...

Thank you.`}
  />
</CallRepButton>
```

**Parameters:**
- `repType` - Which representatives to target (same as EmailTemplate)
- `script` - Call script text (supports variables) - single script only

**CallScript Component (for multiple scripts):**
- `topic` - Short label for the topic selector dropdown
- `script` - Call script text (supports variables)

**Example - Single Script:**
```jsx
## Call Your Representative

<CallRepButton
  repType="representative"
  script={`Hello, my name is {firstName} {lastName} and I'm calling from {zipCode}.

I'm urging Representative {repName} to support the Clean Energy Act.

Thank you for your time.`}
/>
```

**Example - Multiple Scripts:**
```jsx
## Call Your Senators

<CallRepButton repType="senator">
  <CallScript
    topic="Climate Action"
    script={`Hi, I'm {firstName} {lastName} from {zipCode}.

I'm calling to urge Senator {repName} to support climate legislation.

Thank you.`}
  />
  <CallScript
    topic="EPA Funding"
    script={`Hello, my name is {firstName} {lastName} and I'm a constituent from {zipCode}.

I'm calling to ask Senator {repName} to restore EPA funding.

Thank you.`}
  />
</CallRepButton>
```

---

## Best Practices

### Email Templates

**Subject Lines:**
- Clear and specific (under 60 characters)
- Action-oriented: "Demand", "Support", "Oppose"
- Include issue name: "Demand DOGE oversight"

**Body Structure:**
1. **Opening:** State you're a constituent with zip code
2. **Context:** 2-3 sentences on the issue
3. **Ask:** Bulleted list of specific actions
4. **Closing:** Thank you + signature with name and zip

**Tone:**
- Professional and respectful
- Firm but not angry
- Specific asks, not vague requests

**Length:**
- Aim for 150-250 words
- Busy staffers scan quickly
- Make your ask clear and early

### Call Scripts

**Structure:**
1. **Greeting:** Name and zip code
2. **Purpose:** One-sentence issue summary
3. **Ask:** Specific action requested
4. **Closing:** Thank you

**Length:**
- Target 30-45 seconds when read aloud
- Under 100 words total
- Keep it conversational

**Tone:**
- Polite and brief
- State facts, not opinions
- One clear ask per call

### Variable Usage

**Always include:**
- `{zipCode}` in email body (proves you're a constituent)
- `{firstName} {lastName}` in email signature
- `{repName}` when addressing representative

**Optional:**
- `{firstName}` in call scripts for natural flow
- Variables in subject lines (keep them readable)

---

## Common Patterns

### Pattern 1: Email + Call for Same Issue

```jsx
## Contact Your Senators About [Issue]

### Send an Email

<EmailTemplate
  subject="[Issue] - Urge action"
  repType="senator"
  body={`Dear Senator {repName},

[Full email template]

Sincerely,
{firstName} {lastName}`}
/>

### Make a Call

<CallRepButton
  repType="senator"
  script={`Hello, I'm {firstName} {lastName} from {zipCode}.

[Brief call script - 30 seconds]

Thank you.`}
/>
```

### Pattern 2: Senators vs. House Rep

Some issues require targeting different chambers:

```jsx
## Email Your Senators (Senate Bill)

<EmailTemplate
  subject="Support S.1234"
  repType="senator"
  body={`Dear Senator {repName},

[Senate-specific content]

Sincerely,
{firstName} {lastName}`}
/>

## Email Your Representative (House Bill)

<EmailTemplate
  subject="Support H.R.5678"
  repType="representative"
  body={`Dear Representative {repName},

[House-specific content]

Sincerely,
{firstName} {lastName}`}
/>
```

### Pattern 3: Multiple Topics on One Page

```jsx
## Quick Summary

<RepresentativeCard />

---

## Call Your Representatives

<CallRepButton repType="all">
  <CallScript
    topic="DOGE Oversight"
    script={`Hello, I'm {firstName} {lastName} from {zipCode}.

I'm calling to urge {repName} to demand DOGE oversight.

Thank you.`}
  />
  <CallScript
    topic="ICE Accountability"
    script={`Hi, my name is {firstName} {lastName} from {zipCode}.

I'm calling about ICE accountability...

Thank you.`}
  />
</CallRepButton>

---

## Email Your Representatives

<EmailTemplate repType="all">
  <EmailMessage
    topic="Budget Concerns"
    subject="Oppose harmful budget cuts"
    body={`Dear {repName},

[Email content]

Sincerely,
{firstName} {lastName}`}
  />
  <EmailMessage
    topic="Healthcare Access"
    subject="Protect healthcare access"
    body={`Dear {repName},

[Email content]

Sincerely,
{firstName} {lastName}`}
  />
</EmailTemplate>
```

---

## User Experience Flow

### Not Signed In
- Component shows "Sign in" prompt with link to `/auth/signin`
- Fallback content (if provided) displays instead

### Signed In, Profile Incomplete
- Component shows "Complete your profile" prompt
- Links to `/profile/settings`
- Explains why data is needed (identify representatives)

### Profile Complete, Loading
- Shows loading skeleton
- Smooth transition to content

### Success State
- Displays representative cards with:
  - Name, office, party, photo
  - Pre-filled email/call buttons
  - Collapsible email preview
  - Collapsible call script

### Error State
- Shows error message
- Links to profile settings to verify zip code
- Suggests trying again later

---

## Privacy & Data

**What we collect:**
- First name, last name, zip code, phone number
- Stored in database (encrypted at rest)
- Used ONLY for identifying representatives and templates

**What we DON'T collect:**
- No tracking of which actions users take
- No PII in analytics (see Phase 6 for aggregate tracking)
- No email content sent through our servers (`mailto:` links open user's email client)

**User control:**
- Users can edit profile data anytime
- Can delete account (when implemented)
- Clear privacy messaging on settings page

---

## Technical Details

### Representative Lookup

- Uses **Google Civic Information API**
- Fetches 2 Senators + 1 House Rep based on zip code
- Cached for 24 hours (Next.js route cache + sessionStorage)
- Free tier: 25,000 requests/day

### Email Delivery

- Uses `mailto:` links (opens user's email client)
- No in-app email sending
- No tracking of email sends
- User can edit email before sending

### Call Functionality

- Uses `tel:` links for click-to-call
- Mobile: Opens phone dialer with number pre-filled
- Desktop: Shows phone number, click-to-call if system supports
- No call tracking (see Phase 6 for optional aggregate analytics)

---

## Testing

### Test Cases

1. **Not signed in:**
   - Visit page with `[[reps]]` → Should show sign-in prompt
   - Click sign in → Redirects to auth page

2. **Signed in, profile incomplete:**
   - Visit page → Should show "Complete profile" prompt
   - Click link → Goes to `/profile/settings`
   - Fill out form → Save → Return to page
   - Should now show personalized templates

3. **Profile complete:**
   - Visit page → Should show representatives
   - Check names, offices, photos display correctly
   - Click "Send Email" → Opens email client with pre-filled content
   - Click "Call Now" → Opens dialer (mobile) or shows number (desktop)

4. **Invalid zip code:**
   - Set zip code to "00000" in profile
   - Visit page → Should show error message
   - Link to settings should work

### Development Tips

- Use test zip codes for different regions:
  - `02134` - Massachusetts (Elizabeth Warren, Ed Markey)
  - `10001` - New York (Schumer, Gillibrand)
  - `94102` - California (Feinstein, Padilla)
- Test on mobile AND desktop
- Test with long names, short names, missing photos
- Test email preview and call script collapsibles

---

## Examples

### Example 1: Simple Call Script

```jsx
<CallRepButton
  repType="all"
  script={`Hi, I'm {firstName} {lastName} from {zipCode}.

I'm calling to urge {repName} to support the John Lewis Voting Rights Act.

Thank you.`}
/>
```

### Example 2: Detailed Email Template

```jsx
<EmailTemplate
  subject="Support H.R. 1234 - Voting Rights Act"
  repType="representative"
  body={`Dear Representative {repName},

I am writing as your constituent from {zipCode} to urge you to co-sponsor and support H.R. 1234, the John Lewis Voting Rights Advancement Act.

Since the Supreme Court's 2013 Shelby County decision, 29 states have passed laws making it harder to vote. Voter purges have removed millions of eligible voters. Polling places have been closed in minority communities.

The Voting Rights Act is essential to protecting every citizen's constitutional right to vote.

I urge you to:
- Co-sponsor H.R. 1234
- Support bringing it to a floor vote
- Oppose any attempts to weaken voting protections

Thank you for standing up for voting rights.

Sincerely,
{firstName} {lastName}
{zipCode}`}
/>
```

### Example 3: All Three Components

```jsx
## Contact Congress About Climate Action

### Your Representatives

<RepresentativeCard />

### Email Your Senators

<EmailTemplate
  subject="Restore climate protections and EPA funding"
  repType="senator"
  body={`Dear Senator {repName},

I am writing from {zipCode} to urge you to restore climate protections.

[Policy details]

I urge you to:
- Restore EPA funding
- Rejoin the Paris Climate Agreement
- Support the Clean Energy Act

Sincerely,
{firstName} {lastName}`}
/>

### Call Your Representative

<CallRepButton
  repType="representative"
  script={`Hi, I'm {firstName} {lastName} calling from {zipCode}.

I'm urging Representative {repName} to support the Clean Energy Act and restore EPA funding.

Thank you.`}
/>
```

### Example 4: Multiple Topics (Most Common Pattern)

```jsx
## Call Your Representatives

<CallRepButton repType="all">
  <CallScript
    topic="Climate Action"
    script={`Hello, I'm {firstName} {lastName} from {zipCode}.

I'm calling to urge {repName} to support climate legislation and restore EPA funding.

Thank you.`}
  />
  <CallScript
    topic="Clean Energy Act"
    script={`Hi, my name is {firstName} {lastName} and I'm a constituent from {zipCode}.

I'm calling to ask {repName} to co-sponsor the Clean Energy Act.

Thank you.`}
  />
  <CallScript
    topic="Paris Agreement"
    script={`Hello, this is {firstName} {lastName} calling from {zipCode}.

I'm urging {repName} to support rejoining the Paris Climate Agreement.

Thank you.`}
  />
</CallRepButton>

## Email Your Representatives

<EmailTemplate repType="all">
  <EmailMessage
    topic="EPA Funding"
    subject="Restore EPA funding"
    body={`Dear {repName},

I am writing from {zipCode} to urge you to restore EPA funding...

Sincerely,
{firstName} {lastName}`}
  />
  <EmailMessage
    topic="Clean Energy"
    subject="Support Clean Energy Act"
    body={`Dear {repName},

I am writing as your constituent from {zipCode} to support the Clean Energy Act...

Sincerely,
{firstName} {lastName}`}
  />
</EmailTemplate>
```

---

## Troubleshooting

**Component not rendering:**
- Check JSX syntax: closing tags match opening tags
- Ensure `body={`backticks`}` and `script={`backticks`}` use backticks for multi-line strings
- Check MDX compilation output in console
- Verify components are registered in `src/components/mdx-components.tsx`

**Multiple messages not showing topic selector:**
- Ensure you're using `EmailMessage` or `CallScript` children, not props
- Check that each child has a `topic` prop
- Must have 2+ messages/scripts to show topic selector

**Variables not substituting:**
- Verify user profile is complete
- Check variable syntax: `{firstName}` not `{{firstName}}`
- Inspect console for API errors
- Variables only work for signed-in users with complete profiles

**Representative lookup failing:**
- Check Google Civic API key is set
- Verify zip code is valid (5 digits or 5+4 format)
- Check API quota (25K requests/day free tier)
- Look for error messages in browser console

**Email/call links not working:**
- Email: Check `mailto:` links are properly encoded
- Call: Check `tel:` links strip non-digits
- Test on mobile AND desktop
- Some browsers may block `tel:` links

**Copy button not working (no email):**
- Copy button only appears when representative has no email address
- Requires navigator.clipboard API (HTTPS only)
- Check browser console for clipboard errors

---

## Future Enhancements

**Phase 6 - Aggregate Tracking (Optional):**
- Track aggregate action counts (no PII)
- "1,234 emails sent this week" on page
- Heatmap of most-contacted issues

**Phase 7+:**
- In-app email sending (avoid `mailto:` limits)
- Real-time call connection (Twilio integration)
- State/local representative lookup
- Multi-language support
- Email template library (user-submitted)

---

**Last Updated:** February 10, 2026
**Status:** Phase 5 - Production Ready
