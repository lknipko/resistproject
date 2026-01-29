# Fix: UntrustedHost Error

## The Problem

You're seeing this error:
```
[auth][error] UntrustedHost: Host must be trusted. URL was: https://0.0.0.0:3000/api/auth/signin
```

This is a NextAuth v5 security feature. Railway is proxying requests correctly, but NextAuth needs to be explicitly told to trust the forwarded host headers.

## The Solution

Add this environment variable to Railway:

```
AUTH_TRUST_HOST=true
```

### Step-by-Step

1. Go to Railway dashboard
2. Click your **resistproject Next.js service**
3. Click **Variables** tab
4. Click **+ New Variable**
5. Enter:
   - Name: `AUTH_TRUST_HOST`
   - Value: `true`
6. Click **Add**
7. The service will automatically redeploy

### Wait for Redeploy

The service will restart automatically. Wait about 1-2 minutes, then check the deploy logs again. You should see:

```
✓ Ready in XXXms
```

And NO `UntrustedHost` errors.

### Test Again

1. Visit https://resistproject.com/auth/signin
2. Enter your email
3. Submit the form

Should work now!

## Why This Happens

NextAuth v5 (Auth.js) has strict host validation for security. When running behind a reverse proxy like Railway:

- External request: `https://resistproject.com/auth/signin`
- Railway forwards to: `http://0.0.0.0:3000/api/auth/signin`
- Railway sets `X-Forwarded-Host: resistproject.com`
- NextAuth needs `AUTH_TRUST_HOST=true` to trust that header

This is normal for production deployments behind proxies.

## Alternative Fix (Code-Based)

If you prefer not to use the environment variable, you can add this to your NextAuth config:

```typescript
// src/lib/auth.ts
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true, // Add this line
  providers: [
    // ... rest of config
  ],
})
```

But using `AUTH_TRUST_HOST=true` is cleaner and recommended for production.

## Complete Environment Variable List

Your Railway variables should now be:

```
AUTH_TRUST_HOST=true
DATABASE_URL=<reference to PostgreSQL>
EMAIL_FROM=noreply@resistproject.com
NEXTAUTH_SECRET=<your secret>
NEXTAUTH_URL=https://resistproject.com
RESEND_API_KEY=<your key>
```

## After This Works

Once authentication is working, you can:

1. Sign in with your email
2. Check Prisma Studio to see your user record
3. Set yourself to tier 5 (admin):
   ```sql
   UPDATE users_extended SET user_tier = 5 WHERE email = 'your@email.com';
   ```
4. Start building collaborative editing features!
