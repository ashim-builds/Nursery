Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = (Get-Location).Path
$deploymentDir = Join-Path $root "deployment"
if (-not (Test-Path $deploymentDir)) {
    New-Item -ItemType Directory -Path $deploymentDir | Out-Null
}

function Add-FileToZip($zipArchive, $filePath, $entryName) {
    # Ensure entry name strictly uses POSIX forward slashes
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

# 1. Package backend-update.zip
$backendZipPath = Join-Path $deploymentDir "backend-update.zip"
if (Test-Path $backendZipPath) { Remove-Item -Force $backendZipPath }

Write-Host "Creating backend-update.zip..."
$backendArchive = [System.IO.Compression.ZipFile]::Open($backendZipPath, [System.IO.Compression.ZipArchiveMode]::Create)
Add-FileToZip $backendArchive (Join-Path $root "services/dist/server.js") "dist/server.js"
Add-FileToZip $backendArchive (Join-Path $root "services/prisma/schema.prisma") "prisma/schema.prisma"
Add-FileToZip $backendArchive (Join-Path $root "services/app.js") "app.js"
Add-FileToZip $backendArchive (Join-Path $root "services/package.json") "package.json"
Add-FileToZip $backendArchive (Join-Path $root "services/.htaccess") ".htaccess"
$backendArchive.Dispose()
Write-Host "backend-update.zip created successfully!"

# 2. Package frontend-deploy.zip
$frontendZipPath = Join-Path $deploymentDir "frontend-deploy.zip"
if (Test-Path $frontendZipPath) { Remove-Item -Force $frontendZipPath }

Write-Host "Creating frontend-deploy.zip..."
$frontendArchive = [System.IO.Compression.ZipFile]::Open($frontendZipPath, [System.IO.Compression.ZipArchiveMode]::Create)
Add-DirectoryToZip $frontendArchive (Join-Path $root "web/dist") ""
$frontendArchive.Dispose()
Write-Host "frontend-deploy.zip created successfully!"

Write-Host "`nSummary:"
Get-ChildItem -Path $deploymentDir | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize
