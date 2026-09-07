<#
.SYNOPSIS
    KtmBotanica - Production Database Restore PowerShell Script
.DESCRIPTION
    Restores the MySQL database container from a given SQL backup file.
.EXAMPLE
    .\scripts\restore.ps1 -BackupFile ".\backups\ktmbotanica_db_20260907_120000.sql"
#>

param (
    [Parameter(Mandatory=$true)]
    [string]$BackupFile
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupFile)) {
    Write-Error "❌ Backup file '$BackupFile' does not exist."
}

$ContainerName = "nursery_mysql"
$DbUser = if ($env:MYSQL_USER) { $env:MYSQL_USER } else { "nursery_user" }
$DbPass = if ($env:MYSQL_PASSWORD) { $env:MYSQL_PASSWORD } else { "nursery_secure_pass_2026" }
$DbName = if ($env:MYSQL_DATABASE) { $env:MYSQL_DATABASE } else { "nursery_db" }

Write-Host "========================================================" -ForegroundColor Yellow
Write-Host "⚠️  WARNING: You are about to restore database '$DbName'" -ForegroundColor Yellow
Write-Host "Source:    $BackupFile"
Write-Host "Container: $ContainerName"
Write-Host "========================================================"

$Confirm = Read-Host "Are you sure you want to proceed with restore? (y/N)"
if ($Confirm -ne "y" -and $Confirm -ne "Y") {
    Write-Host "❌ Restore cancelled." -ForegroundColor Red
    exit 0
}

Write-Host "🔄 Restoring database..." -ForegroundColor Cyan

Get-Content $BackupFile | docker exec -i $ContainerName mysql -u"$DbUser" -p"$DbPass" "$DbName"

Write-Host "✅ Database restore completed successfully!" -ForegroundColor Green
Write-Host "========================================================"
