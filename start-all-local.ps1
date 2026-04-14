$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$env:PHANTOM_CONFIG_PATH = Join-Path $RepoRoot "config\bscTestnet.json"
$env:PORT = "5050"
$env:VITE_API_URL = "http://localhost:5050"

$ports = @(5050, 5173, 5174)
foreach ($port in $ports) {
  try {
    $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($conns) {
      $pids = $conns.OwningProcess | Select-Object -Unique
      foreach ($pid in $pids) {
        if ($pid -and $pid -gt 0) {
          Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
      }
    }
  } catch { }
}

$env:RELAYER_DRY_RUN = "false"
$env:DEV_BYPASS_VALIDATORS = "true"
$env:DEV_BYPASS_PROOFS = "false"
$env:RELAYER_PRIVATE_KEY = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
$env:VITE_API_URL = "http://localhost:5050"
$env:QUOTE_MODE = "dex"

function Ensure-NpmInstall {
  param([string]$dir)
  $pkg = Join-Path $dir "package.json"
  if (!(Test-Path $pkg)) { throw "Missing package.json in $dir" }
  $nodeModules = Join-Path $dir "node_modules"
  if (!(Test-Path $nodeModules)) {
    Write-Host "Running npm install in $dir..."
    Push-Location $dir
    try { npm install } finally { Pop-Location }
  }
}

Ensure-NpmInstall -dir "phantom-relayer-dashboard/backend"
Ensure-NpmInstall -dir "."
Ensure-NpmInstall -dir "phantom-relayer-dashboard"

Write-Host "Starting backend on 5050..."
$backendDir = "phantom-relayer-dashboard/backend"
$backendEntry = "src/index.js"
if (!(Test-Path (Join-Path $backendDir $backendEntry))) { throw "Missing backend entry: $backendEntry" }
$pBackend = Start-Process -FilePath "node" -ArgumentList $backendEntry -WorkingDirectory (Resolve-Path $backendDir).Path -NoNewWindow -PassThru

Write-Host "Starting user frontend on 5173..."
$pUser = Start-Process -FilePath "npm.cmd" -ArgumentList @("run", "dev", "--", "--host", "0.0.0.0", "--port", "5173") -WorkingDirectory (Resolve-Path ".").Path -NoNewWindow -PassThru

Write-Host "Starting operator dashboard on 5174..."
$dashDir = "phantom-relayer-dashboard"
$pDash = Start-Process -FilePath "npm.cmd" -ArgumentList @("run", "dev", "--", "--host", "0.0.0.0", "--port", "5174") -WorkingDirectory (Resolve-Path $dashDir).Path -NoNewWindow -PassThru

$baseUrl = "http://127.0.0.1:5050"
$deadline = (Get-Date).AddSeconds(45)
$health = $null
while ((Get-Date) -lt $deadline -and $health -eq $null) {
  try {
    $health = (Invoke-WebRequest -UseBasicParsing -Method GET -Uri ($baseUrl + "/health") -TimeoutSec 3).Content | ConvertFrom-Json
  } catch {
    Start-Sleep -Milliseconds 500
  }
}

Write-Host "Backend:"
if ($health -ne $null) {
  Write-Host "  GET /health ok"
  try {
    $ready = (Invoke-WebRequest -UseBasicParsing -Method GET -Uri ($baseUrl + "/ready") -TimeoutSec 3).Content | ConvertFrom-Json
    Write-Host "  GET /ready ok: $($ready.ok)"
  } catch { Write-Host "  GET /ready check failed" }
} else {
  Write-Host "  GET /health failed (backend may still be starting or crashed)"
}

Write-Host "Started processes:"
Write-Host "  backend pid: $($pBackend.Id)"
Write-Host "  user pid: $($pUser.Id)"
Write-Host "  dash pid: $($pDash.Id)"
Write-Host "URLs:"
Write-Host "  http://localhost:5050/health"
Write-Host "  http://localhost:5050/ready"
Write-Host "  http://localhost:5173/#/user"
Write-Host "  http://localhost:5174/"

