$ErrorActionPreference = "Stop"
$repo = "B-Divyesh/sf-local-model-residency"
$release = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/releases/latest" -Headers @{ Accept = "application/vnd.github+json" }
$asset = $release.assets | Where-Object { $_.name -match '\.(msi|exe)$' } | Select-Object -First 1
if (-not $asset) { throw "The Windows download is not published yet." }
$destination = Join-Path ([Environment]::GetFolderPath("UserProfile")) "Downloads\$($asset.name)"
$sums = Invoke-WebRequest -UseBasicParsing -Uri "https://github.com/$repo/releases/download/$($release.tag_name)/SHA256SUMS?release=$($release.tag_name)"
Invoke-WebRequest -UseBasicParsing -Uri $asset.browser_download_url -OutFile $destination
$line = ($sums.Content -split "`n" | Where-Object { $_ -match [regex]::Escape($asset.name) } | Select-Object -First 1)
if (-not $line) { Remove-Item $destination; throw "No checksum was published for $($asset.name)." }
$expected = ($line -split '\s+')[0].ToLowerInvariant()
$actual = (Get-FileHash -Algorithm SHA256 $destination).Hash.ToLowerInvariant()
if ($actual -ne $expected) { Remove-Item $destination; throw "Checksum failed. The download was removed." }
Write-Output "Verified and saved $destination"
Write-Output "Open that file to install Local Model Residency."
