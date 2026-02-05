# Get Railway External Database URL

Your `.env` currently has the internal Railway URL which won't work from localhost:
```
DATABASE_URL=postgresql://postgres:...@postgres-2tue.railway.internal:5432/railway
```

## How to Get the External URL:

1. Go to https://railway.app
2. Click on your **resistproject** project
3. Click on the **PostgreSQL** service (not the web service)
4. Click on the **Variables** tab
5. Find and copy the **DATABASE_URL_EXTERNAL** or **DATABASE_URL** that contains a public host like:
   ```
   postgresql://postgres:...@viaduct.proxy.rlwy.net:12345/railway
   ```
   (It will have `rlwy.net` or similar external domain, not `.internal`)

6. Update your `.env` file:
   ```
   DATABASE_URL="postgresql://postgres:...@viaduct.proxy.rlwy.net:12345/railway"
   ```

7. Restart the dev server

This will allow your local development to connect to the Railway PostgreSQL database.
