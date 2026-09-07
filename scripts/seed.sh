#!/bin/bash
# ==============================================================================
# KtmBotanica — Botanical Catalog Seeding Script
# Seeds default categories, plants, care guides, delivery zones & admin user.
# ==============================================================================

set -e

echo "========================================================"
echo "🌱 Seeding KtmBotanica Initial Catalog & Core Data..."
echo "========================================================"

if docker ps | grep -q "nursery_services"; then
  docker exec nursery_services npx tsx prisma/seed.ts
else
  cd services && npx tsx prisma/seed.ts && cd ..
fi

echo "✅ Database seeding completed successfully!"
echo "========================================================"
