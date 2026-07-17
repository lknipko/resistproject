# Get Updated Railway DATABASE_URL

Since you rebuilt your Railway service, you need to get the new PostgreSQL connection string.

## Option 1: From Railway Web Dashboard (Easiest)

1. Go to https://railway.app
2. Log in and select your **resistproject** project
3. You should see two services:
   - Your **Next.js app** service
   - A **PostgreSQL** database service
4. Click on the **PostgreSQL** service
5. Click the **Variables** tab
6. Look for `DATABASE_URL` in the list
7. Click the copy icon to copy the full URL

The URL will look like:
```
postgresql://postgres:XXXX@YYYY.railway.app:5432/railway
```

## Option 2: From Railway CLI

If you have the Railway CLI installed:

```bash
railway login
railway link
railway variables --json | grep DATABASE_URL
```

## Option 3: Connect Railway PostgreSQL Service

If you don't see a DATABASE_URL variable, you may need to link the PostgreSQL service:

1. In Railway dashboard, go to your **Next.js app** service
2. Click **Settings** → **Service Variables**
3. Click **+ New Variable**
4. Click **Add Reference** → Select **PostgreSQL** service → **DATABASE_URL**
5. Save

## After Getting the URL

Update your local `.env` file:

```bash
# Replace the old DATABASE_URL with the new one
DATABASE_URL="postgresql://postgres:NEW_PASSWORD@new-host.railway.app:5432/railway"
```

Then test the connection:

```bash
cd resist-project
node scripts/setup-env.js
```

It should show: ✓ Database connection successful!

## Common Railway Database URLs

Railway database URLs follow these patterns:

**Old format (proxy):**
```
postgresql://postgres:PASSWORD@gondola.proxy.rlwy.net:56943/railway
```

**New format (direct):**
```
postgresql://postgres:PASSWORD@REGION.railway.app:5432/railway
```

If you see a `rlwy.net` URL, it's from the old service and won't work anymore.

## Need to Create a New PostgreSQL Service?

If the PostgreSQL service was deleted along with your app:

1. In Railway dashboard → Your project
2. Click **+ New Service**
3. Select **Database** → **PostgreSQL**
4. Wait for it to provision (~30 seconds)
5. Click on the new PostgreSQL service
6. Go to **Variables** tab
7. Copy the `DATABASE_URL`

Then in your Next.js app service:
1. Go to **Variables** tab
2. Add variable: `DATABASE_URL` = paste the PostgreSQL URL

## Verify It's Working

Once you have the correct DATABASE_URL:

```bash
# Test connection
npx prisma db pull

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

All three should succeed without errors.
