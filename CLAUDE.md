# Civic Action Wiki - Project Context

## Project Overview

This is a civic engagement platform designed to help citizens understand government actions and take meaningful, concrete action. The platform uses a wiki-based structure to provide verified facts with primary sources and actionable opportunities for civic participation.

**Primary Goals:**
- Empower citizens with fact-based information about government actions
- Provide concrete, low-barrier action opportunities (not just symbolic demonstrations)
- Enable community contribution while maintaining high credibility standards
- Focus on material resistance and consequences, not just awareness

**Target Audience:**
- Citizens who oppose current government actions but don't know how to act effectively
- People who want to go beyond symbolic protests to material action
- Community members seeking verified, primary-source information
- Activists looking for coordinated, effective resistance strategies

## Technology Stack

**Core Platform:**
- **Wiki.js** - Main application framework
- **Docker & Docker Compose** - Containerization and deployment
- **PostgreSQL** - Database (production)
- **Node.js** - Runtime environment
- **Markdown** - Primary content format

**Development Environment:**
- Arch Linux
- Git for version control
- VS Code (recommended editor)

**Future Additions:**
- Custom Node.js service for trending/analytics
- Integration with external services (5 Calls, Resistbot, etc.)

## Project Structure

### Content Organization

The wiki has two main sections:

#### **LEARN Section**
Information organized by issue areas, with sub-pages for specific events/topics.

Each LEARN page contains:
```
├── FACTS Section (top of page)
│   ├── Timeline of events with dates
│   ├── Primary sources (direct links to government documents)
│   ├── Direct quotes from source materials
│   └── Clear, unfiltered factual information
│
├── ANALYSIS Section (below facts)
│   ├── What this means (interpretation)
│   ├── Who's affected
│   ├── Legal/policy context
│   ├── Expert perspectives (attributed)
│   └── Unbiased but accessible explanations
│
└── RELATED ACTIONS (cross-links to ACT pages)
```

**Critical: FACTS and ANALYSIS must be clearly separated**
- FACTS = objective, verifiable, primary-sourced
- ANALYSIS = interpretation, context, explanation

#### **ACT Section**
Action opportunities organized by issue or action type.

Each ACT page contains:
```
├── QUICK ACTIONS (<5 minutes, one-click when possible)
│   ├── Email templates with pre-filled forms
│   ├── Call scripts with tap-to-call functionality
│   ├── Social media templates
│   └── Petition links
│
├── SUSTAINED ACTIONS (ongoing, >5 minutes)
│   ├── Organization memberships
│   ├── Event/protest attendance
│   ├── Public comment submission guides
│   └── Volunteer opportunities
│
├── RESOURCES
│   ├── Downloadable posters/flyers (PDF)
│   ├── Social media graphics
│   └── Talking points documents
│
└── IMPACT TRACKER
    └── Metrics on action completion (manual for now)
```

### Cross-Linking
- LEARN pages link to relevant ACT pages
- ACT pages link back to LEARN pages for context
- Use clear visual indicators (icons/colors) to distinguish link types

## Content Standards

### Primary Sources Priority
Always prioritize:
1. Federal Register notices
2. Executive orders (WhiteHouse.gov)
3. Court filings and decisions
4. Congressional bills (Congress.gov)
5. Official agency statements (.gov domains)
6. Inspector General reports

Avoid:
- News media as primary sources (use for context only)
- Opinion pieces or editorials
- Social media posts
- Unverified claims

### Verification Requirements
Every factual claim must have:
- Direct link to primary source
- Date of the action/event
- Specific attribution (which agency, official, document)

### Tagging System
Use multi-dimensional tags:
- **Issue Categories:** Immigration, Press Freedom, Environment, Healthcare, etc.
- **Rights Affected:** First Amendment, Due Process, Equal Protection, etc.
- **Government Agencies:** DOJ, EPA, DHS, etc.
- **Status:** Ongoing, Resolved, Under Litigation, Historical

## User Permissions & Moderation

**Tiered Access Model:**
1. **Public (read-only)** - Anyone can view all content
2. **Contributors** - Can submit content for review (email verified)
3. **Moderators** - Can approve/edit submissions (trusted volunteers)
4. **Administrators** - Platform management (project maintainer)

**Moderation Workflow:**
- All new content goes through approval
- Edit history maintained (like Wikipedia)
- Flag system for disputed content
- Transparent changelog

## Design Philosophy

### Visual Design
- **LEARN content:** Blue color scheme/accents
- **ACT content:** Orange/Red color scheme (action colors)
- Clean, accessible, mobile-first design
- High contrast for readability, simple and concise language
- Icon-based navigation where appropriate

### Content Principles
- **Clarity over cleverness** - Plain language, accessible explanations
- **Facts first** - Lead with verifiable information
- **Action-oriented** - Every issue should have actionable responses
- **Non-partisan framing** - Focus on rights and principles, not party politics
- **Credibility is paramount** - One bad source undermines everything

### User Experience
- Progressive disclosure (don't overwhelm with information)
- Mobile-optimized (many users will access via phone)
- Accessibility (screen reader compatible, keyboard navigation)

## Development Guidelines

### For Adding Features
1. **Start simple** - Use Wiki.js built-in features when possible
2. **Test thoroughly** - Every feature must work on mobile
3. **Document everything** - Future maintainers need to understand decisions
4. **Preserve data** - Never delete, only archive
5. **Plan for scale** - Assume this will grow larger than expected

### For Custom Code
- Keep custom code minimal initially
- Use standard npm packages when available
- Comment thoroughly
- Follow existing Wiki.js patterns
- Security first - validate all inputs

### For Content Templates
Create standardized Markdown templates for:
- LEARN pages (with FACTS/ANALYSIS structure)
- ACT pages (with Quick/Sustained actions)
- Event listings
- Organization profiles
- Resource collections

## Deployment Strategy

### Phase 1: Local Development
- Docker Compose setup on local machine
- SQLite database (lightweight for dev)
- Test all features locally

### Phase 2: Production Deployment
**Recommended hosting:**
- DigitalOcean App Platform ($5-15/month)
- Railway.app (good free tier option)

**Requirements:**
- PostgreSQL database
- SSL certificate (Let's Encrypt)
- Domain name
- Automated backups
- Version control (Git)

### Phase 3: Scaling
When traffic grows:
- CDN for static assets
- Database optimization
- Caching layer
- Load balancing (if needed)

## Developer Context

**Project Maintainer Profile:**
- Engineering background (R&D Engineer, biomedical devices)
- Strong technical skills, newer to web development
- Fast learner, comfortable with technical documentation


## Security Considerations

1. **User Authentication:**
   - Email verification for contributors
   - Strong password requirements
   - Rate limiting on login attempts

2. **Content Security:**
   - Sanitize all user inputs
   - Validate external links
   - Monitor for spam/abuse

3. **Data Protection:**
   - Regular backups (automated)
   - Secure database credentials
   - HTTPS only (enforce SSL)

4. **Privacy:**
   - Minimal user data collection
   - Clear privacy policy
   - No tracking without consent
   - GDPR compliance considerations

## Future Features (Roadmap)

**Short-term:**
- [ ] Basic Wiki.js setup
- [ ] Custom page templates
- [ ] Content tagging system
- [ ] User contribution workflow
- [ ] 5-10 complete issue pages

**Medium-term:**
- [ ] Custom trending algorithm
- [ ] Analytics dashboard
- [ ] Email newsletter integration
- [ ] Mobile PWA features
- [ ] Advanced search

**Long-term:**
- [ ] Integrated email/call tools
- [ ] Mobile app (native)
- [ ] Multi-language support
- [ ] API for third-party tools
- [ ] Community forums

## Critical Success Factors

1. **Credibility** - Maintain rigorous source standards
2. **Usability** - People must be able to find what they need quickly
3. **Actionability** - Every issue needs concrete next steps
4. **Sustainability** - Plan for ongoing maintenance and moderation
5. **Community** - Build trusted moderator team early


## Notes on Scope

**In Scope:**
- Documented government actions since January 2025
- Federal-level policies and executive orders
- Active litigation and legal challenges
- Current action opportunities with clear deadlines
- Verified information with primary sources

