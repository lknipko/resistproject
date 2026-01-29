#!/bin/sh
# Startup script for Railway deployment
# Runs database migrations before starting the app

echo "Running database migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
  echo "Migrations completed successfully"
  echo "Starting application..."
  node server.js
else
  echo "Migration failed, exiting..."
  exit 1
fi
