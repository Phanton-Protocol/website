$ErrorActionPreference = "Stop"

$env:RELAYER_DRY_RUN = "true"
$env:DEV_BYPASS_VALIDATORS = "true"
$env:DEV_BYPASS_PROOFS = "true"

$backendDir = "phantom-relayer-dashboard/backend"
$backendEntry = "src/index.js"
$backendEntryAbs = Join-Path $backendDir $backendEntry
$port = 5050
$baseUrl = "http://127.0.0.1:$port"

if (!(Test-Path $backendEntryAbs)) {
  throw "Missing backend entrypoint: $backendEntryAbs"
}

$isUp = $false
try {
  $tnc = Test-NetConnection -ComputerName "127.0.0.1" -Port $port -WarningAction SilentlyContinue
  $isUp = $tnc.TcpTestSucceeded
} catch {
  $isUp = $false
}

if (-not $isUp) {
  Start-Process -FilePath "node" -ArgumentList $backendEntry -WorkingDirectory (Resolve-Path $backendDir).Path -NoNewWindow | Out-Null
}

$deadline = (Get-Date).AddSeconds(30)
$healthJson = $null

while ((Get-Date) -lt $deadline -and $healthJson -eq $null) {
  try {
    $healthJson = (Invoke-WebRequest -UseBasicParsing -Method GET ($baseUrl + "/health") -TimeoutSec 3).Content
  } catch {
    Start-Sleep -Milliseconds 500
  }
}

if ($healthJson -eq $null) {
  throw "Backend did not respond at $baseUrl/health within timeout."
}

Write-Host "health response:"
Write-Host $healthJson

$readyJson = $null
try {
  $readyJson = (Invoke-WebRequest -UseBasicParsing -Method GET ($baseUrl + "/ready") -TimeoutSec 5).Content
} catch {
  if ($_.Exception.Response -ne $null) {
    $stream = $_.Exception.Response.GetResponseStream()
    if ($stream -ne $null) {
      $reader = New-Object System.IO.StreamReader($stream)
      $readyJson = $reader.ReadToEnd()
    }
  }
}

if ($readyJson -ne $null) {
  Write-Host "ready response:"
  Write-Host $readyJson
}

Write-Host "done"

