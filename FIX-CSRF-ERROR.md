# Fix: MissingCSRF Error

## The Problem

You're seeing:
```
[auth][error] MissingCSRF: CSRF token was missing during an action signin
```

This is a NextAuth v5 issue with server-side form submissions.

## The Solution

I've updated the code to use client-side authentication (the recommended NextAuth v5 approach):

1. **Updated sign-in page** to use `'use client'` with `next-auth/react`
2. **Added `trustHost: true`** to NextAuth config
3. **Added `AUTH_SECRET`** environment variable (NextAuth v5 prefers this)

## What You Need to Do

Add one more environment variable to Railway:

```
AUTH_SECRET=<same value as NEXTAUTH_SECRET>
```

### Step-by-Step

1. Go to Railway dashboard
2. Click your **Next.js service**
3. Click **Variables** tab
4. Click **+ New Variable**
5. Name: `AUTH_SECRET`
6. Value: Copy the same value as `NEXTAUTH_SECRET`
7. Click **Add**

The service will redeploy automatically.

## Complete Railway Variables

You should now have:

```
AUTH_SECRET=<your secret>
AUTH_TRUST_HOST=true
DATABASE_URL=<reference to PostgreSQL>
EMAIL_FROM=noreply@resistproject.com
NEXTAUTH_SECRET=<your secret> (same as AUTH_SECRET)
NEXTAUTH_URL=https://resistproject.com
RESEND_API_KEY=<your key>
```

## Why Both NEXTAUTH_SECRET and AUTH_SECRET?

NextAuth v5 (Auth.js) is transitioning to use `AUTH_SECRET` instead of `NEXTAUTH_SECRET`. Having both ensures compatibility during the transition.

## Changes Made

### 1. Updated auth.ts
Added `trustHost: true` directly in the config:
```typescript
export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,  // Added this
  // ... rest of config
})
```

### 2. Updated signin page
Changed from server action to client-side:
```typescript
'use client'  // Now a client component

import { signIn } from 'next-auth/react'  // Use client-side signIn

// Form now uses client-side submit handler
const handleSubmit = async (e) => {
  e.preventDefault()
  await signIn('resend', { email, redirect: false })
}
```

This properly handles CSRF tokens automatically.

## After Deploy

Test authentication:
1. Visit https://resistproject.com/auth/signin
2. Enter your email
3. Click "Send sign-in link"
4. Check your email
5. Click the magic link
6. You should be signed in!

If you still see errors:
- Check Railway deploy logs
- Make sure AUTH_SECRET is set
- Make sure AUTH_TRUST_HOST=true is set
- Verify all other environment variables are correct
