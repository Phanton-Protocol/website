param(
  [switch]$Live,
  [switch]$NoKillPorts,
  [switch]$SkipFrontend,
  [switch]$SkipDashboard,
  [int]$Port = 5050
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RepoRoot

if ($NoKillPorts -and $Port -eq 5050) {
  $Port = 5059
}
$env:PORT = "$Port"
$baseUrl = "http://127.0.0.1:$Port"
$env:VITE_API_URL = $baseUrl

$ports = @($Port, 5173, 5174)
if (-not $NoKillPorts) {
  foreach ($port in $ports) {
    try {
      $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
      if ($conns) {
        $conns.OwningProcess | Select-Object -Unique | ForEach-Object {
          if ($_ -and $_ -gt 0) { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
        }
      }
    } catch { }
  }
}

$configPath = Join-Path $RepoRoot "config\bscTestnet.json"
if (-not (Test-Path $configPath)) { throw "Missing $configPath" }
$cfg = Get-Content $configPath -Raw | ConvertFrom-Json

$wasmPath = Join-Path $RepoRoot "phantom-relayer-dashboard\circuits\joinsplit_js\joinsplit.wasm"
$zkeyPath = Join-Path $RepoRoot "phantom-relayer-dashboard\circuits\joinsplit_0001.zkey"
$hasCircuits = (Test-Path $wasmPath) -and (Test-Path $zkeyPath)

$env:PHANTOM_CONFIG_PATH = $configPath
$env:CHAIN_ID = "$($cfg.chainId)"
$env:RPC_URL = $cfg.rpcUrl
if ($cfg.addresses.shieldedPool) { $env:SHIELDED_POOL_ADDRESS = $cfg.addresses.shieldedPool }
if ($cfg.addresses.swapAdaptor) { $env:SWAP_ADAPTOR_ADDRESS = $cfg.addresses.swapAdaptor }
if ($cfg.addresses.relayerStaking) { $env:RELAYER_STAKING_ADDRESS = $cfg.addresses.relayerStaking }

$env:DEV_BYPASS_VALIDATORS = "true"
$env:RELAYER_PRIVATE_KEY = if ($env:RELAYER_PRIVATE_KEY) { $env:RELAYER_PRIVATE_KEY } else { "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" }
$env:QUOTE_MODE = "dex"
$env:NODE_ENV = "development"

if ($Live -and $hasCircuits) {
  $env:RELAYER_DRY_RUN = "false"
  $env:DEV_BYPASS_PROOFS = "false"
  Write-Host "Mode: LIVE (on-chain txs, real proofs). Set RELAYER_PRIVATE_KEY to a funded key." -ForegroundColor Yellow
} elseif ($Live -and -not $hasCircuits) {
  Write-Host "Live requested but joinsplit.wasm / joinsplit_0001.zkey missing. Falling back to DRY RUN + proof bypass." -ForegroundColor Red
  $env:RELAYER_DRY_RUN = "true"
  $env:DEV_BYPASS_PROOFS = "true"
} elseif (-not $hasCircuits) {
  $env:RELAYER_DRY_RUN = "true"
  $env:DEV_BYPASS_PROOFS = "true"
  Write-Host "Mode: DRY RUN (no circuit artifacts). Swaps simulate. Build or drop wasm+zkey into phantom-relayer-dashboard\circuits\ then use -Live." -ForegroundColor Cyan
} else {
  $env:RELAYER_DRY_RUN = "true"
  $env:DEV_BYPASS_PROOFS = "true"
  Write-Host "Mode: DRY RUN (circuits present). Use -Live for on-chain." -ForegroundColor Cyan
}

Write-Host "Config: chain $($cfg.chainId) pool $($cfg.addresses.shieldedPool)"
Write-Host "Circuits: $(if ($hasCircuits) { 'OK' } else { 'MISSING' })"

function Ensure-NpmInstall {
  param([string]$dir)
  $pkg = Join-Path $dir "package.json"
  if (-not (Test-Path $pkg)) { throw "Missing package.json in $dir" }
  $nm = Join-Path $dir "node_modules"
  if (-not (Test-Path $nm)) {
    Write-Host "npm install in $dir..."
    Push-Location $dir
    try { npm install } finally { Pop-Location }
  }
}

Ensure-NpmInstall -dir "phantom-relayer-dashboard\backend"
Ensure-NpmInstall -dir "."
Ensure-NpmInstall -dir "phantom-relayer-dashboard"

$backendDir = Join-Path $RepoRoot "phantom-relayer-dashboard\backend"
Write-Host "Starting backend :$Port..."
$pBackend = Start-Process -FilePath "node" -ArgumentList "src/index.js" -WorkingDirectory $backendDir -NoNewWindow -PassThru

$pUser = $null
if (-not $SkipFrontend) {
  Write-Host "Starting Vite :5173..."
  $pUser = Start-Process -FilePath "npm.cmd" -ArgumentList @("run", "dev", "--", "--host", "0.0.0.0", "--port", "5173") -WorkingDirectory $RepoRoot -NoNewWindow -PassThru
}

$pDash = $null
if (-not $SkipDashboard) {
  Write-Host "Starting operator dashboard :5174..."
  $pDash = Start-Process -FilePath "npm.cmd" -ArgumentList @("run", "dev", "--", "--host", "0.0.0.0", "--port", "5174") -WorkingDirectory (Join-Path $RepoRoot "phantom-relayer-dashboard") -NoNewWindow -PassThru
}

$deadline = (Get-Date).AddSeconds(60)
$health = $null
while ((Get-Date) -lt $deadline -and $null -eq $health) {
  try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -TimeoutSec 3 -Method Get
  } catch { Start-Sleep -Milliseconds 400 }
}

if ($null -eq $health) { throw "Backend did not become healthy at $baseUrl/health" }

Write-Host ""
Write-Host "BACKEND UP" -ForegroundColor Green
Write-Host "  GET $baseUrl/health"
try {
  $ready = Invoke-RestMethod -Uri "$baseUrl/ready" -TimeoutSec 5
  Write-Host "  GET $baseUrl/ready ok=$($ready.ok)"
} catch { Write-Host "  /ready: $_" }

try {
  $conf = Invoke-RestMethod -Uri "$baseUrl/config" -TimeoutSec 5
  Write-Host "  mode=$($conf.mode) chainId=$($conf.chainId) dryRun=$($conf.features.dryRun) bypassProofs=$($conf.features.bypassProofs)"
} catch { }

Write-Host ""
Write-Host "NEXT (what to do now):" -ForegroundColor Green
Write-Host "  1. If you skipped the site, run in another terminal:  npm run dev:site"
Write-Host "  2. Open trade UI:   http://localhost:5173/#/trade"
Write-Host "  3. Open full dapp:  http://localhost:5173/#/user"
Write-Host "  4. Relayer API:     $baseUrl/health"
if (-not $SkipDashboard) { Write-Host "  5. Operator dash:   http://localhost:5174/" }
Write-Host ""
Write-Host "URLs:"
Write-Host "  Site:    http://localhost:5173/#/trade"
Write-Host "  Console: http://localhost:5173/#/user"
Write-Host "  API:     $baseUrl  (match this in the dapp Relayer API field if not 5050)"
if (-not $SkipDashboard) { Write-Host "  Ops UI:  http://localhost:5174/" }
Write-Host ""
Write-Host "PIDs: backend=$($pBackend.Id) user=$($pUser.Id) dash=$($pDash.Id)"
Write-Host "Stop: Stop-Process -Id $($pBackend.Id) $($pUser.Id) $($pDash.Id) -Force"
