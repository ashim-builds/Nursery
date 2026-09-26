Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = (Get-Location).Path
$deploymentDir = Join-Path $root "deployment"
if (-not (Test-Path $deploymentDir)) {
    New-Item -ItemType Directory -Path $deploymentDir | Out-Null
}

function Add-FileToZip($zipArchive, $filePath, $entryName) {
    $cleanEntryName = $entryName.Replace("\", "/")
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zipArchive, $filePath, $cleanEntryName) | Out-Null
    Write-Host "  Added: $cleanEntryName"
}

function Add-DirectoryToZip($zipArchive, $dirPath, $baseInZip) {
    $files = Get-ChildItem -Path $dirPath -Recurse -File
    foreach ($file in $files) {
        $relPath = $file.FullName.Substring((Resolve-Path $dirPath).Path.Length + 1)
        $entryName = if ([string]::IsNullOrEmpty($baseInZip)) { $relPath } else { "$baseInZip/$relPath" }
        Add-FileToZip $zipArchive $file.FullName $entryName
    }
}

Write-Host "========================================="
Write-Host "1. Compiling Services (Backend)..."
Write-Host "========================================="
Push-Location (Join-Path $root "services")
try {
    npm run build
} finally {
    Pop-Location
}

Write-Host "`n========================================="
Write-Host "2. Compiling Web (Frontend)..."
Write-Host "========================================="
Push-Location (Join-Path $root "web")
try {
    npm run build
} finally {
    Pop-Location
}

Write-Host "`n========================================="
Write-Host "3. Packaging backend-update.zip..."
Write-Host "========================================="
$backendZipPath = Join-Path $deploymentDir "backend-update.zip"
if (Test-Path $backendZipPath) { Remove-Item -Force $backendZipPath }

$backendArchive = [System.IO.Compression.ZipFile]::Open($backendZipPath, [System.IO.Compression.ZipArchiveMode]::Create)
Add-FileToZip $backendArchive (Join-Path $root "services/dist/server.js") "dist/server.js"
Add-FileToZip $backendArchive (Join-Path $root "services/prisma/schema.prisma") "prisma/schema.prisma"
Add-FileToZip $backendArchive (Join-Path $root "services/app.js") "app.js"
Add-FileToZip $backendArchive (Join-Path $root "services/package.json") "package.json"
Add-FileToZip $backendArchive (Join-Path $root "services/.htaccess") ".htaccess"
if (Test-Path (Join-Path $root "services/.env.example")) {
    Add-FileToZip $backendArchive (Join-Path $root "services/.env.example") ".env.example"
}

# Add tmp/restart.txt to automatically trigger cPanel Passenger restart
$tempRestart = Join-Path $env:TEMP "restart.txt"
Set-Content -Path $tempRestart -Value "Restart triggered at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Add-FileToZip $backendArchive $tempRestart "tmp/restart.txt"
Remove-Item -Force $tempRestart

$backendArchive.Dispose()
Write-Host "backend-update.zip created successfully!"

Write-Host "`n========================================="
Write-Host "4. Packaging frontend-deploy.zip..."
Write-Host "========================================="
$frontendZipPath = Join-Path $deploymentDir "frontend-deploy.zip"
if (Test-Path $frontendZipPath) { Remove-Item -Force $frontendZipPath }

$frontendArchive = [System.IO.Compression.ZipFile]::Open($frontendZipPath, [System.IO.Compression.ZipArchiveMode]::Create)
Add-DirectoryToZip $frontendArchive (Join-Path $root "web/dist") ""
$frontendArchive.Dispose()
Write-Host "frontend-deploy.zip created successfully!"

Write-Host "`n========================================="
Write-Host "Deployment packages ready in ./deployment:"
Write-Host "========================================="
Get-ChildItem -Path $deploymentDir | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize
