<#
.SYNOPSIS
    KtmBotanica - Production Database Backup PowerShell Script
.DESCRIPTION
    Creates a compressed point-in-time SQL backup of the MySQL container database.
.EXAMPLE
    .\scripts\backup.ps1
#>

param (
    [string]$OutputFile = ""
)

$ErrorActionPreference = "Stop"

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupDir = Join-Path $PSScriptRoot "..\backups"

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

if ([string]::IsNullOrWhiteSpace($OutputFile)) {
    $OutputFile = Join-Path $BackupDir "ktmbotanica_db_$Timestamp.sql"
}

$ContainerName = "nursery_mysql"
$DbUser = if ($env:MYSQL_USER) { $env:MYSQL_USER } else { "nursery_user" }
$DbPass = if ($env:MYSQL_PASSWORD) { $env:MYSQL_PASSWORD } else { "nursery_secure_pass_2026" }
$DbName = if ($env:MYSQL_DATABASE) { $env:MYSQL_DATABASE } else { "nursery_db" }

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "📦 Initiating KtmBotanica MySQL Database Backup..." -ForegroundColor Cyan
Write-Host "Container: $ContainerName"
Write-Host "Database:  $DbName"
Write-Host "Target:    $OutputFile"
Write-Host "========================================================"

docker exec $ContainerName mysqldump `
    -u"$DbUser" `
    -p"$DbPass" `
    --single-transaction `
    --quick `
    --routines `
    --triggers `
    "$DbName" > $OutputFile

if (Test-Path $OutputFile) {
    $Item = Get-Item $OutputFile
    Write-Host "✅ Backup completed successfully!" -ForegroundColor Green
    Write-Host "📁 File: $OutputFile ($([math]::Round($Item.Length / 1KB, 2)) KB)" -ForegroundColor Green
} else {
    Write-Error "❌ Backup file generation failed."
}
Write-Host "========================================================"
