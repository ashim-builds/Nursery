Add-Type -AssemblyName System.Drawing

function Compress-Jpeg {
    param(
        [string]$InPath,
        [string]$OutPath,
        [long]$Quality = 80,
        [int]$MaxDim = 1200
    )

    $fs = [System.IO.File]::OpenRead($InPath)
    $img = [System.Drawing.Image]::FromStream($fs)
    $w = $img.Width
    $h = $img.Height

    if ($w -gt $MaxDim -or $h -gt $MaxDim) {
        if ($w -gt $h) {
            $h = [int]($h * $MaxDim / $w)
            $w = $MaxDim
        } else {
            $w = [int]($w * $MaxDim / $h)
            $h = $MaxDim
        }
    }

    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($img, 0, 0, $w, $h)
    $img.Dispose()
    $fs.Dispose()

    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $encParams = New-Object System.Drawing.Imaging.EncoderParameters 1
    $encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $Quality)
    
    if (Test-Path $OutPath) { Remove-Item -Force $OutPath }
    $bmp.Save($OutPath, $codec, $encParams)
    $bmp.Dispose()
    $encParams.Dispose()
}

function Compress-Png {
    param(
        [string]$InPath,
        [string]$OutPath,
        [int]$MaxDim = 320
    )

    $fs = [System.IO.File]::OpenRead($InPath)
    $img = [System.Drawing.Image]::FromStream($fs)
    $w = $img.Width
    $h = $img.Height

    if ($w -gt $MaxDim -or $h -gt $MaxDim) {
        if ($w -gt $h) {
            $h = [int]($h * $MaxDim / $w)
            $w = $MaxDim
        } else {
            $w = [int]($w * $MaxDim / $h)
            $h = $MaxDim
        }
    }

    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($img, 0, 0, $w, $h)
    $img.Dispose()
    $fs.Dispose()

    if (Test-Path $OutPath) { Remove-Item -Force $OutPath }
    $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

$root = (Get-Location).Path
$pubDir = Join-Path $root "web/public"

Write-Host "Optimizing hero-plant.jpg..."
$tempPlant = Join-Path $pubDir "hero-plant-opt.jpg"
Compress-Jpeg (Join-Path $pubDir "hero-plant.jpg") $tempPlant 80 1024
Move-Item -Force $tempPlant (Join-Path $pubDir "hero-plant.jpg")

Write-Host "Optimizing hero-flowers-banner.jpg..."
$tempBanner = Join-Path $pubDir "hero-flowers-banner-opt.jpg"
Compress-Jpeg (Join-Path $pubDir "hero-flowers-banner.jpg") $tempBanner 80 1200
Move-Item -Force $tempBanner (Join-Path $pubDir "hero-flowers-banner.jpg")

Write-Host "Optimizing the-bloom-patch-logo.png..."
$tempLogo = Join-Path $pubDir "the-bloom-patch-logo-opt.png"
Compress-Png (Join-Path $pubDir "the-bloom-patch-logo.png") $tempLogo 320
Move-Item -Force $tempLogo (Join-Path $pubDir "the-bloom-patch-logo.png")

# Delete dead weight files
$deadFiles = @(
    "hero-bouquet.jpg",
    "rj-flowers-logo.svg",
    "rj-flowers-icon.svg",
    "the-bloom-patch-logo.svg",
    "the-bloom-patch-icon.png",
    "the-bloom-patch-512.png",
    "the-bloom-patch-192.png",
    "rj-flowers-icon.png"
)

foreach ($f in $deadFiles) {
    $fullPath = Join-Path $pubDir $f
    if (Test-Path $fullPath) {
        Remove-Item -Force $fullPath
        Write-Host "Removed unused file: $f"
    }
}

Write-Host "`nUpdated web/public sizes:"
Get-ChildItem -Path $pubDir | Select-Object Name, @{Name="SizeKB";Expression={[math]::Round($_.Length / 1KB, 1)}} | Sort-Object SizeKB -Descending
