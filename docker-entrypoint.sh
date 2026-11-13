#!/bin/sh
set -e

echo "Applying database schema…"
# Create/upgrade tables from the Prisma schema (no migration files needed).
npx prisma db push --skip-generate

echo "Seeding (admin always; demo only if SEED_DEMO=1)…"
npx tsx prisma/seed.ts || echo "Seed step skipped/failed (non-fatal)."

echo "Starting Next.js…"
exec node server.js
