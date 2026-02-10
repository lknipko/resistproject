# Security Policy

## Security Measures

### Authentication & Authorization
- **NextAuth.js v5** with database-backed sessions (30-day expiry)
- **Dual authentication providers**: Google OAuth and passwordless email (Resend)
- **Email account linking disabled** to prevent account takeover
- **Tier-based permissions** (5 levels) with granular access control
- **Session validation** on all protected routes

### Input Validation
- **Comprehensive edit validation** using `validation.ts`:
  - Profanity filtering with `bad-words` library
  - Suspicious URL detection (URL shorteners, malicious patterns)
  - Markdown syntax validation
  - HTML tag filtering (prevent XSS)
  - Edit size limits (prevent vandalism)
  - Source quality checks (.gov, .edu prioritization)
- **Edit summary validation** (10-500 characters)
- **Spam detection** (pattern matching for common spam phrases)

### Rate Limiting
**Tier-based daily limits:**
- **Tier 1**: 3 edits/day, 20 votes/day
- **Tier 2**: 10 edits/day, 50 votes/day
- **Tier 3**: 50 edits/day, 100 votes/day
- **Tier 4**: 100 edits/day, 200 votes/day
- **Tier 5**: Unlimited (admins)

**Automatic reset:** Daily at midnight UTC
**Account suspension:** Automatic for abusive behavior

### SQL Injection Protection
- **Prisma ORM** - All database queries parameterized
- **No raw SQL** in user-facing code
- **Type-safe queries** with TypeScript

### XSS (Cross-Site Scripting) Protection
- **React automatic escaping** - All user content escaped by default
- **MDX compilation** - Sandboxed and safe
- **Content Security Policy headers**:
  - `script-src 'self'` - Only scripts from same origin
  - `frame-ancestors 'none'` - Prevent clickjacking
  - `X-Frame-Options: DENY` - Legacy clickjacking protection
  - `X-Content-Type-Options: nosniff` - Prevent MIME sniffing
- **No `dangerouslySetInnerHTML`** anywhere in codebase

### CSRF Protection
- **Next.js built-in CSRF protection** for server actions
- **Database-backed sessions** with secure cookies
- **SameSite cookie policy**

### Security Headers
**Configured in `next.config.mjs`:**
- **Content-Security-Policy**: Strict CSP preventing XSS
- **Strict-Transport-Security**: Force HTTPS (HSTS)
- **X-Frame-Options**: Prevent clickjacking
- **X-Content-Type-Options**: Prevent MIME sniffing
- **Referrer-Policy**: Privacy-friendly referrer handling
- **Permissions-Policy**: Disable camera, microphone, geolocation

### Privacy Protection
- **Zero user tracking** in analytics system
- **No IP addresses stored**
- **No session fingerprinting**
- **No cookies** for analytics
- **Aggregate data only** (impossible to trace actions to individuals)
- **Password hashing** via NextAuth (bcrypt)

### Audit Logging
**All critical actions logged:**
- Edit submissions and approvals
- Vote casting
- Permission changes
- Account suspensions
- Tier promotions

**Audit log includes:**
- Action type and category
- Actor ID (user who performed action)
- Target (what was affected)
- Timestamp
- Old/new values (for reversibility)
- Security flags for suspicious activity

### Account Security
- **Email verification required** for all accounts
- **Account suspension system** for violations
- **Failed login tracking** (future: rate limiting)
- **IP hash logging** (hashed, not stored raw)
- **Session management** (view/revoke sessions via profile)

### Deployment Security
- **HTTPS enforced** via Railway and Cloudflare
- **Environment variables** never exposed to client
- **Secrets management** via Railway/Vercel environment variables
- **Database connection** over SSL
- **No debug endpoints** in production

---

## Reporting a Vulnerability

If you discover a security vulnerability, please email:

**security@resistproject.com** (if configured)

Or open a **private security advisory** on GitHub.

**Please do NOT open public issues for security vulnerabilities.**

### What to include:
1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if you have one)

We will respond within 48 hours and provide a timeline for fixes.

---

## Security Best Practices for Contributors

### When submitting code:
1. **Never commit secrets** (.env files, API keys, passwords)
2. **Validate all user input** before processing
3. **Use Prisma for database queries** (never raw SQL)
4. **Sanitize output** (though React does this automatically)
5. **Follow principle of least privilege** (minimal permissions)
6. **Test authentication/authorization** on new routes
7. **Use TypeScript** for type safety

### When reviewing code:
1. Check for exposed secrets
2. Verify permission checks on protected routes
3. Look for SQL injection vectors
4. Check for XSS vulnerabilities
5. Verify rate limiting is respected
6. Ensure audit logging for sensitive actions

---

## Dependencies

### Security-critical dependencies:
- **next-auth** (v5.0.0-beta.30) - Authentication
- **@prisma/client** - Database ORM
- **bcrypt** (via NextAuth) - Password hashing
- **bad-words** - Profanity filtering

### Regular updates:
We regularly update dependencies to patch known vulnerabilities.

Run `npm audit` before deploying to check for known issues.

---

## Known Limitations

1. **Tier 1 users have no CAPTCHA** - Future enhancement to prevent bot spam
2. **No 2FA/MFA** - Could be added for high-tier users
3. **Basic profanity filter** - More sophisticated NLP could improve this
4. **No real-time abuse detection** - Currently relies on daily rate limits

---

## Security Compliance

This project follows:
- **OWASP Top 10** security best practices
- **GDPR principles** (minimal data collection, user privacy)
- **NextAuth.js security guidelines**
- **Next.js security recommendations**

Last updated: February 10, 2026
