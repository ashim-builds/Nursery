<#
.SYNOPSIS
    KtmBotanica - Production Database Migration PowerShell Script
.DESCRIPTION
    Applies pending Prisma migrations safely to the production database.
#>

$ErrorActionPreference = "Stop"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "🚀 Applying Prisma Migrations to Production Database..." -ForegroundColor Cyan
Write-Host "========================================================"

$ServicesRunning = docker ps --filter "name=nursery_services" --format "{{.Names}}"

if ($ServicesRunning -contains "nursery_services") {
    docker exec nursery_services npx prisma migrate deploy
} else {
    Push-Location (Join-Path $PSScriptRoot "..\services")
    try {
        npx prisma migrate deploy
    } finally {
        Pop-Location
    }
}

Write-Host "✅ Migrations applied successfully!" -ForegroundColor Green
Write-Host "========================================================"
