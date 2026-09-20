Add-Type -AssemblyName System.Drawing

$imgPath = "c:\Willy Code & Data\Project Willy Web, Apps & AI\Sembako Nusantara Jepang\public\LOGO PUTIH SN.jpeg"
$outPath = "c:\Willy Code & Data\Project Willy Web, Apps & AI\Sembako Nusantara Jepang\public\LOGO PUTIH SN.png"
$outPath2 = "c:\Willy Code & Data\Project Willy Web, Apps & AI\Sembako Nusantara Jepang\public\logo-transparent.png"
$outRoot = "c:\Willy Code & Data\Project Willy Web, Apps & AI\Sembako Nusantara Jepang\LOGO PUTIH SN.png"

$src = [System.Drawing.Image]::FromFile($imgPath)
$bmp = New-Object System.Drawing.Bitmap($src.Width, $src.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($src, 0, 0, $src.Width, $src.Height)
$g.Dispose()
$src.Dispose()

$rect = New-Object System.Drawing.Rectangle(0, 0, $bmp.Width, $bmp.Height)
$bmpData = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$bytes = [Math]::Abs($bmpData.Stride) * $bmp.Height
$rgbValues = New-Object byte[] $bytes
[System.Runtime.InteropServices.Marshal]::Copy($bmpData.Scan0, $rgbValues, 0, $bytes)

# Format32bppArgb in Windows memory is BGRA (B=0, G=1, R=2, A=3)
for ($counter = 0; $counter -lt $bytes; $counter += 4) {
    $b = $rgbValues[$counter]
    $gVal = $rgbValues[$counter + 1]
    $r = $rgbValues[$counter + 2]
    
    # If pixel is near white
    if ($r -ge 235 -and $gVal -ge 235 -and $b -ge 235) {
        $rgbValues[$counter + 3] = 0 # Alpha = 0 (Transparent)
    }
}

[System.Runtime.InteropServices.Marshal]::Copy($rgbValues, 0, $bmpData.Scan0, $bytes)
$bmp.UnlockBits($bmpData)

$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($outPath2, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($outRoot, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

Write-Host "FAST_TRANSPARENT_SAVED_SUCCESS"
