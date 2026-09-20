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

for ($x = 0; $x -lt $bmp.Width; $x++) {
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        $pixel = $bmp.GetPixel($x, $y)
        # Check if pixel is white or near-white
        if ($pixel.R -gt 235 -and $pixel.G -gt 235 -and $pixel.B -gt 235) {
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 255, 255, 255))
        }
    }
}

$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($outPath2, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($outRoot, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

Write-Host "TRANSPARENT_LOGO_GENERATED_SUCCESSFULLY"
