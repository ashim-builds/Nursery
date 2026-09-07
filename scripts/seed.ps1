<#
.SYNOPSIS
    KtmBotanica - Botanical Catalog Seeding PowerShell Script
.DESCRIPTION
    Seeds initial botanical categories, plant variants, and delivery zones.
#>

$ErrorActionPreference = "Stop"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "🌱 Seeding KtmBotanica Initial Catalog & Core Data..." -ForegroundColor Cyan
Write-Host "========================================================"

$ServicesRunning = docker ps --filter "name=nursery_services" --format "{{.Names}}"

if ($ServicesRunning -contains "nursery_services") {
    docker exec nursery_services npx tsx prisma/seed.ts
} else {
    Push-Location (Join-Path $PSScriptRoot "..\services")
    try {
        npx tsx prisma/seed.ts
    } finally {
        Pop-Location
    }
}

Write-Host "✅ Database seeding completed successfully!" -ForegroundColor Green
Write-Host "========================================================"
