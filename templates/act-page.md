# Act Page Template

Use this template when creating new action opportunity pages.

## Filename Convention

`content/act/kebab-case-action.mdx`

Example: `content/act/contact-congress.mdx`

---

## Template

```mdx
---
title: "Action Title"
subtitle: "Brief description of what this accomplishes"
type: "act"
tags: ["Tag1", "Tag2", "Tag3"]
lastUpdated: "2026-02-07"
description: "One-sentence description for SEO and previews"
---

<PageHeader type="act" />

<PageContent>

# Action Title

## Quick Summary

**Goal:** What this action accomplishes in one sentence.

[← Learn More: Related Issue](/learn/issue-slug)

<MainContentLayout
  sidebar={
    <ContentSidebar>
      <ul className="space-y-3">
        <li className="font-semibold"><a href="#quick-actions" className="text-orange hover:underline">QUICK ACTIONS</a>
          <ul className="ml-6 mt-2 space-y-1.5 font-normal">
            <li><a href="#call-your-representative" className="text-orange hover:underline">Call Your Representative</a></li>
            <li><a href="#send-an-email" className="text-orange hover:underline">Send an Email</a></li>
          </ul>
        </li>
        <li className="font-semibold"><a href="#sustained-actions" className="text-orange hover:underline">SUSTAINED ACTIONS</a>
          <ul className="ml-6 mt-2 space-y-1.5 font-normal">
            <li><a href="#join-an-organization" className="text-orange hover:underline">Join an Organization</a></li>
            <li><a href="#attend-events" className="text-orange hover:underline">Attend Events</a></li>
          </ul>
        </li>
        <li className="font-semibold"><a href="#resources" className="text-orange hover:underline">RESOURCES</a></li>
      </ul>
    </ContentSidebar>
  }
>

## Quick Actions

These actions take less than 5 minutes.

### Call Your Representative

**Why it works:** Calls are counted and reported to elected officials. Constituent calls influence voting decisions.

**Script:**
<CallScript>
"Hi, my name is [YOUR NAME] and I'm calling from [ZIP CODE]. I'm calling about [SPECIFIC ISSUE].

I urge [REPRESENTATIVE NAME] to [SPECIFIC ACTION YOU WANT].

This is important to me because [PERSONAL REASON, 1-2 sentences].

Thank you for your time."
</CallScript>

**Who to call:**
- Find your Representative: [House.gov](https://www.house.gov/representatives/find-your-representative)
- Find your Senators: [Senate.gov](https://www.senate.gov/senators/senators-contact.htm)

### Send an Email

Use this template to contact your representatives via email:

**Subject:** [Specific, Clear Subject Line]

**Body:**
```
Dear [Representative/Senator] [Last Name],

I am writing as your constituent from [City, State, ZIP] to urge you to [SPECIFIC ACTION].

[1-2 paragraphs explaining why this matters to you personally]

[1 paragraph with factual context from Learn page]

I urge you to [RESTATE SPECIFIC ACTION].

Thank you for your consideration.

Sincerely,
[Your Name]
[Your Address]
[Your Email]
[Your Phone]
```

**Email addresses:**
- Representatives: Available on House.gov member pages
- Senators: Available on Senate.gov member pages

### Share on Social Media

**Sample posts:**

Twitter/X:
```
[Concise statement about issue] #Hashtag

Learn more: [Link to Learn page]
Take action: [Link to this page]
```

Instagram/Facebook:
```
[Longer explanation with personal story]

[Call to action]

Link in bio / [shortened link]
```

### Sign a Petition

Petitions demonstrate public support and can be used in advocacy campaigns.

- [Organization Name Petition](url) - Brief description of what it does

## Sustained Actions

These actions require ongoing time commitment but have greater impact.

### Join an Organization

Organizations provide sustained pressure and coordinate advocacy efforts:

- **[Organization Name](url)** - Mission statement. How to join.
- **[Organization Name](url)** - Mission statement. How to join.
- **[Organization Name](url)** - Mission statement. How to join.

### Attend Events

Public events demonstrate visible support and community engagement:

- **Rallies and Protests** - Check [Organization Name](url) for upcoming events
- **Town Halls** - Attend your representative's town hall meetings
- **Community Meetings** - Join local organizing meetings

### Submit Public Comments

Many federal actions require public comment periods:

**How to submit:**
1. Visit [Regulations.gov](https://www.regulations.gov)
2. Search for [Docket Number or Rule Name]
3. Click "Comment"
4. Provide substantive comments (form letters are less effective)

**Tips for effective comments:**
- Be specific about which rule/docket you're commenting on
- Explain how the rule affects you personally
- Provide factual evidence or expertise if applicable
- Be respectful and professional

### Volunteer

Get directly involved in advocacy and organizing:

- **Phone banking** - Contact voters about issues
- **Canvassing** - Door-to-door outreach
- **Event organizing** - Help organize local actions
- **Content creation** - Help spread awareness

Contact [Organization Name](url) to get involved.

## Resources

### Downloadable Materials

- [Fact Sheet (PDF)](url) - One-page summary for sharing
- [Talking Points (PDF)](url) - Key arguments and responses
- [Social Media Graphics](url) - Ready-to-share images

### Educational Resources

- [Guide Title](url) - Description
- [Toolkit Name](url) - Description

### Related Tools

- [Tool Name](url) - What it does

---

## Related Learn Pages

- [Issue Title](/learn/issue-slug) - Brief description
- [Another Issue](/learn/another-slug) - Brief description

---

**Tags:** `Tag1` `Tag2` `Tag3`

**Last Updated:** Month DD, YYYY

**Verified Working:** Month DD, YYYY

</MainContentLayout>

</PageContent>
```

---

## Guidelines

### Quick Actions

**Criteria:**
- Takes less than 5 minutes
- Can be done immediately without preparation
- Low barrier to entry
- Clear, immediate impact

**Examples:**
- Phone calls with provided scripts
- Pre-written emails or email templates
- Online petition signing
- Social media posts with sample text
- One-click advocacy tools

### Sustained Actions

**Criteria:**
- Requires ongoing commitment
- May need preparation or coordination
- Higher barrier to entry but greater impact
- Builds long-term power

**Examples:**
- Organization membership
- Event attendance (protests, rallies, town halls)
- Public comment submission (requires research)
- Volunteering for campaigns
- Community organizing

### Effectiveness Principles

**Most effective actions:**
1. Personal communication (calls > emails > petitions)
2. Local pressure (district offices > DC offices)
3. Coordinated campaigns (many voices, one message)
4. Specificity (clear asks > vague support)
5. Persistence (sustained > one-off)

**Least effective actions:**
1. Form letters and mass emails
2. Social media likes/shares without personal contact
3. Petitions without follow-up
4. Symbolic actions without material consequences

### Writing Call Scripts

**Structure:**
1. Introduction (name, location)
2. Issue identification (specific, concise)
3. Clear ask (actionable request)
4. Personal reason (why you care)
5. Thank you

**Tips:**
- Keep under 1 minute when spoken
- Use first-person ("I urge" not "we demand")
- Be respectful and professional
- Don't argue with staff - they're just taking notes

### Email Templates

**Best practices:**
- Personalize the template (add your story)
- Use specific bill numbers or policy names
- Include your full address (proves you're a constituent)
- Keep under 3 paragraphs
- Clear subject line
- Professional tone

### Using the New Simple Syntax

The following markdown headings will be automatically styled:

- `## Quick Summary` → Grey box with "QUICK SUMMARY" heading
- `## Quick Actions` → Section with auto-intro "Complete these in under 5 minutes"
- `## Sustained Actions` → Section with auto-intro about time commitment
- `## Resources` → Standard section
- `[→ Take Action: Text](/url)` → Orange "ACT NOW" CTA box (usually for related actions)
- `[← Learn More: Text](/url)` → Teal "LEARN MORE" CTA box (links to Learn pages)

### Tags

Choose tags from established categories:
- **Issue Areas**: Immigration, Healthcare, Press Freedom, Environment, etc.
- **Action Types**: Contact Officials, Join Organization, Public Comment, Legal Action, etc.
- **Timeframe**: Urgent, Ongoing, Deadline-Specific
- **Difficulty**: Quick (< 5min), Moderate, Sustained

---

## Checklist Before Publishing

- [ ] Quick Actions take less than 5 minutes
- [ ] Call scripts are under 1 minute
- [ ] Email templates are personalized
- [ ] All organization links are working
- [ ] Resources are downloadable and accessible
- [ ] Related Learn pages are linked
- [ ] Tags are appropriate and consistent
- [ ] lastUpdated date is current
- [ ] Page has been tested in local development
- [ ] Sidebar navigation matches actual h2/h3 structure
- [ ] "Verified Working" date is current (links tested)
