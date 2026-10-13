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
Write-Host "3. Generating full_database_setup.sql..."
Write-Host "========================================="
$sqlPath = Join-Path $deploymentDir "full_database_setup.sql"
Push-Location (Join-Path $root "services")
try {
    npx prisma migrate diff --from-empty --to-schema-datamodel ./prisma/schema.prisma --script | Out-File -FilePath $sqlPath -Encoding utf8
    Write-Host "full_database_setup.sql generated successfully!"
} catch {
    Write-Warning "Could not automatically generate SQL diff: $_"
} finally {
    Pop-Location
}

Write-Host "`n========================================="
Write-Host "4. Packaging backend-update.zip & backend-deploy.zip..."
Write-Host "========================================="
$backendZipPath = Join-Path $deploymentDir "backend-update.zip"
$backendDeployZipPath = Join-Path $deploymentDir "backend-deploy.zip"
if (Test-Path $backendZipPath) { Remove-Item -Force $backendZipPath }
if (Test-Path $backendDeployZipPath) { Remove-Item -Force $backendDeployZipPath }

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
Copy-Item -Path $backendZipPath -Destination $backendDeployZipPath -Force
Write-Host "backend-update.zip and backend-deploy.zip created successfully!"

Write-Host "`n========================================="
Write-Host "5. Packaging frontend-dist.zip & frontend-deploy.zip..."
Write-Host "========================================="
$frontendZipPath = Join-Path $deploymentDir "frontend-deploy.zip"
$frontendDistZipPath = Join-Path $deploymentDir "frontend-dist.zip"
if (Test-Path $frontendZipPath) { Remove-Item -Force $frontendZipPath }
if (Test-Path $frontendDistZipPath) { Remove-Item -Force $frontendDistZipPath }

$frontendArchive = [System.IO.Compression.ZipFile]::Open($frontendZipPath, [System.IO.Compression.ZipArchiveMode]::Create)
Add-DirectoryToZip $frontendArchive (Join-Path $root "web/dist") ""
$frontendArchive.Dispose()
Copy-Item -Path $frontendZipPath -Destination $frontendDistZipPath -Force
Write-Host "frontend-dist.zip and frontend-deploy.zip created successfully!"

Write-Host "`n========================================="
Write-Host "Deployment packages ready in ./deployment:"
Write-Host "========================================="
Get-ChildItem -Path $deploymentDir | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize
