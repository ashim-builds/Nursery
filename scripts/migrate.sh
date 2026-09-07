#!/bin/bash
# ==============================================================================
# KtmBotanica — Safe Production Migration Script
# Applies all pending Prisma migrations without modifying existing data.
# ==============================================================================

set -e

echo "========================================================"
echo "🚀 Applying Prisma Migrations to Production Database..."
echo "========================================================"

# Run migration inside services container or locally
if docker ps | grep -q "nursery_services"; then
  docker exec nursery_services npx prisma migrate deploy
else
  cd services && npx prisma migrate deploy && cd ..
fi

echo "✅ Migrations applied successfully!"
echo "========================================================"
