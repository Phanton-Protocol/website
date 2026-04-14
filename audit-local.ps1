$ErrorActionPreference = "Stop"

$port = 5050
$baseUrl = "http://127.0.0.1:$port"
$backendDir = "phantom-relayer-dashboard/backend"
$backendEntry = Join-Path $backendDir "src/index.js"

if ($env:RELAYER_PRIVATE_KEY -eq $null -or $env:RELAYER_PRIVATE_KEY.Trim() -eq "") {
  $env:RELAYER_PRIVATE_KEY = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
}
$env:RELAYER_DRY_RUN = "true"
$env:DEV_BYPASS_VALIDATORS = "true"
$env:DEV_BYPASS_PROOFS = "true"

function Wait-Http {
  param([string]$Url,[int]$TimeoutSec=30)
  $deadline = (Get-Date).AddSeconds($TimeoutSec)
  while ((Get-Date) -lt $deadline) {
    try {
      return (Invoke-WebRequest -UseBasicParsing -Method GET -Uri $Url -TimeoutSec 3).Content | ConvertFrom-Json
    } catch {
      Start-Sleep -Milliseconds 500
    }
  }
  throw "Timeout waiting for $Url"
}

function Invoke-Json {
  param([string]$Method,[string]$Url,[object]$Body)
  $json = $Body | ConvertTo-Json -Depth 20
  return (Invoke-WebRequest -UseBasicParsing -Method $Method -Uri $Url -ContentType "application/json" -Body $json -TimeoutSec 60).Content | ConvertFrom-Json
}

function Node-Json {
  param([string]$Script)
  $out = node -e $Script
  return $out.Trim()
}

function RepeatStr {
  param([string]$Text,[int]$Count)
  return (-join (1..$Count | ForEach-Object { $Text }))
}

function Node-Encode-EncryptedPayload {
  $a = "0x11"
  $b = "0x22"
  $script = @"
const { ethers } = require('ethers');
const coder = ethers.AbiCoder.defaultAbiCoder();
const enc = coder.encode(['bytes','bytes'], ['0x11','0x22']);
console.log(enc);
"@
  return (Node-Json $script)
}

function Node-SignTypedData {
  param(
    [string]$PrivateKey,
    [object]$Domain,
    [object]$Types,
    [object]$Value
  )

  $domainJson = $Domain | ConvertTo-Json -Depth 20 -Compress
  $typesJson = $Types | ConvertTo-Json -Depth 20 -Compress
  $valueJson = $Value | ConvertTo-Json -Depth 20 -Compress

  $script = @"
const { ethers } = require('ethers');
const pk = process.env.PK;
const domain = JSON.parse(process.env.DOMAIN);
const types = JSON.parse(process.env.TYPES);
const value = JSON.parse(process.env.VALUE);
const wallet = new ethers.Wallet(pk);
(async () => {
  const sig = await wallet.signTypedData(domain, types, value);
  console.log(sig);
})().catch(e => { console.error(e); process.exit(1); });
"@
  $env:PK = $PrivateKey
  $env:DOMAIN = $domainJson
  $env:TYPES = $typesJson
  $env:VALUE = $valueJson
  return (Node-Json $script)
}

$backendUp = $false
try {
  $tnc = Test-NetConnection -ComputerName "127.0.0.1" -Port $port -WarningAction SilentlyContinue
  $backendUp = $tnc.TcpTestSucceeded
} catch {
  $backendUp = $false
}

if (-not $backendUp) {
  if (!(Test-Path $backendEntry)) {
    throw "Missing backend entrypoint: $backendEntry"
  }
  Start-Process -FilePath "node" -ArgumentList $backendEntry -WorkingDirectory (Resolve-Path $backendDir).Path -NoNewWindow | Out-Null
}

$health = Wait-Http ($baseUrl + "/health") 60
$readyText = (Invoke-WebRequest -UseBasicParsing -Method GET -Uri ($baseUrl + "/ready") -TimeoutSec 5).Content
$ready = $readyText | ConvertFrom-Json

$configJson = $null
$configError = $null
try {
  $configText = (Invoke-WebRequest -UseBasicParsing -Method GET -Uri ($baseUrl + "/config") -TimeoutSec 10).Content
  $configJson = $configText | ConvertFrom-Json
} catch {
  $configJson = $null
  $configError = $_.Exception.Message
}

$results = [ordered]@{
  baseUrl = $baseUrl
  health = $health
  ready = $ready
  config = $configJson
  configError = $configError
  configWarningCount = if ($configJson.configWarnings) { $configJson.configWarnings.Count } else { $null }
}

try {
  $results.fheHealth = (Wait-Http ($baseUrl + "/fhe/health") 30)
} catch {
  $results.fheHealthError = $_.Exception.Message
}

try {
  $order1 = @{
    inputAssetID = 1
    outputAssetID = 2
    fheEncryptedInputAmount = "0xaaaabbbb"
    fheEncryptedMinOutput = "0xccccdddd"
  }
  $order2 = @{
    inputAssetID = 2
    outputAssetID = 1
    fheEncryptedInputAmount = "0x11112222"
    fheEncryptedMinOutput = "0x33334444"
  }
  $results.internalMatchViaFhe = (Invoke-Json -Method "POST" -Url ($baseUrl + "/fhe/match") -Body @{ order1 = $order1; order2 = $order2 })
} catch {
  $results.internalMatchViaFheError = $_.Exception.Message
}

try {
  $results.relayer = (Invoke-WebRequest -UseBasicParsing -Method GET -Uri ($baseUrl + "/relayer") -TimeoutSec 10).Content | ConvertFrom-Json
} catch {
  try {
    $results.relayer = (Invoke-WebRequest -UseBasicParsing -Method GET -Uri ($baseUrl + "/relayer") -TimeoutSec 10).Content | ConvertFrom-Json
  } catch {
    $results.relayerError = $_.Exception.Message
  }
}

try {
  $results.relayerNetwork = (Invoke-WebRequest -UseBasicParsing -Method GET -Uri ($baseUrl + "/relayer/network") -TimeoutSec 10).Content | ConvertFrom-Json
} catch {
  $results.relayerNetworkError = $_.Exception.Message
}

try {
  $results.proofStats = (Invoke-WebRequest -UseBasicParsing -Method GET -Uri ($baseUrl + "/relayer/proof-stats") -TimeoutSec 10).Content | ConvertFrom-Json
} catch {
  $results.proofStatsError = $_.Exception.Message
}

$walletPk = $env:RELAYER_PRIVATE_KEY
$env:PK = $walletPk
$walletAddress = (node -e "const { ethers }=require('ethers'); const pk=process.env.PK; const w=new ethers.Wallet(pk); console.log(w.address);" ).Trim()

$intentDomainResponse = $null
$intentTypes = $null
$tokenIn = "0xae13d989dac2f0debff460ac112a837c89baa7cd"
$tokenOut = "0xae13d989dac2f0debff460ac112a837c89baa7cd"

try {
  $results.quote = (Invoke-Json -Method "POST" -Url ($baseUrl + "/quote") -Body @{
    tokenIn = $tokenIn
    tokenOut = $tokenOut
    amountIn = "1000000000000000000"
    tokenInDecimals = 18
    tokenOutDecimals = 18
    slippageBps = 500
    chainSlug = "bsc-testnet"
  })
} catch {
  $results.quoteError = $_.Exception.Message
}

$encryptedPayload = Node-Encode-EncryptedPayload

function New-IntentAndSign {
  param([int]$inputAssetID,[int]$outputAssetIDSwap)

  $deadline = [int]([Math]::Floor((Get-Date).ToUniversalTime().Subtract([datetime]'1970-01-01').TotalSeconds) + 600)

  $intentPayload = @{
    userAddress = $walletAddress
    nullifier = "0x" + (node -e "const { randomBytes }=require('crypto'); console.log(randomBytes(32).toString('hex'));").Trim()
    minOutputAmount = "0"
    protocolFee = "0"
    gasRefund = "0"
    deadline = $deadline
  }

  $intentResp = Invoke-Json -Method "POST" -Url ($baseUrl + "/intent") -Body $intentPayload

  $domain = $intentResp.domain
  $types = $intentResp.types
  $intentValue = $intentResp.intent

  $sig = Node-SignTypedData -PrivateKey $walletPk -Domain $domain -Types $types -Value $intentValue

  $swapReq = @{
    intentId = $intentResp.intentId
    intent = $intentValue
    intentSig = $sig
    swapData = @{
      proof = @{ a = "0x"; b = "0x"; c = "0x" }
      publicInputs = @{
        inputAssetID = $inputAssetID
        outputAssetIDSwap = $outputAssetIDSwap
        nullifier = $intentValue.nullifier
        inputCommitment = "0x" + (RepeatStr -Text "00" -Count 32)
        outputCommitmentSwap = "0x" + (RepeatStr -Text "11" -Count 32)
        outputCommitmentChange = "0x" + (RepeatStr -Text "22" -Count 32)
        merkleRoot = "0x" + (RepeatStr -Text "33" -Count 32)
        inputAmount = "0"
        swapAmount = "0"
        changeAmount = "0"
        outputAmountSwap = "0"
        protocolFee = "0"
        gasRefund = "0"
        outputAssetIDChange = 0
      }
      encryptedPayload = $encryptedPayload
    }
  }

  $swapResp = Invoke-Json -Method "POST" -Url ($baseUrl + "/swap") -Body $swapReq
  return @{ intentResp = $intentResp; swapResp = $swapResp }
}

try {
  $results.swapInternalOrder1 = (New-IntentAndSign -inputAssetID 1 -outputAssetIDSwap 2)
  $results.swapInternalOrder2 = (New-IntentAndSign -inputAssetID 2 -outputAssetIDSwap 1)
} catch {
  $results.swapFlowError = $_.Exception.Message
}

try {
  $results.withdraw = (Invoke-Json -Method "POST" -Url ($baseUrl + "/withdraw") -Body @{
    withdrawData = @{
      proof = @{ a = "0x"; b = "0x"; c = "0x" }
      publicInputs = @{}
      recipient = "0x000000000000000000000000000000000000dEaD"
      encryptedPayload = "0x"
    }
  })
} catch {
  $results.withdrawError = $_.Exception.Message
}

try {
  $chainId = 97
  $verifyingContract = $env:SHIELDED_POOL_ADDRESS
  if ($verifyingContract -eq $null -or $verifyingContract.Trim() -eq "") {
    $verifyingContract = "0xC6bdf5858e8D4C2fad09d0CA3cE356B2ace0ec99"
  }

  $deadlineDep = [int]([Math]::Floor((Get-Date).ToUniversalTime().Subtract([datetime]'1970-01-01').TotalSeconds) + 600)
  $token = "0x0000000000000000000000000000000000000000"
  $amount = "1"
  $commitment = "0x" + (node -e "const { randomBytes }=require('crypto'); console.log(randomBytes(32).toString('hex'));").Trim()

  $depositDomain = @{
    name = "ShadowDeFiRelayer"
    version = "1"
    chainId = $chainId
    verifyingContract = $verifyingContract
  }

  $depositTypes = @{
    Deposit = @(
      @{ name = "depositor"; type = "address" },
      @{ name = "token"; type = "address" },
      @{ name = "amount"; type = "uint256" },
      @{ name = "commitment"; type = "bytes32" },
      @{ name = "assetID"; type = "uint256" },
      @{ name = "deadline"; type = "uint256" }
    )
  }

  $depositValue = @{
    depositor = $walletAddress
    token = $token
    amount = $amount
    commitment = $commitment
    assetID = 0
    deadline = $deadlineDep
  }

  $depositSig = Node-SignTypedData -PrivateKey $walletPk -Domain $depositDomain -Types $depositTypes -Value $depositValue

  $results.shadowAddress = (Invoke-Json -Method "POST" -Url ($baseUrl + "/shadow-address") -Body @{
    depositor = $walletAddress
    token = $depositValue.token
    amount = $depositValue.amount
    commitment = $depositValue.commitment
    assetID = $depositValue.assetID
    deadline = $depositValue.deadline
    signature = $depositSig
  })
} catch {
  $results.shadowAddressError = $_.Exception.Message
}

$outPath = "audit-results.json"
$results | ConvertTo-Json -Depth 20 | Set-Content -Path $outPath -Encoding UTF8

Write-Host "Audit complete. Wrote $outPath"
Write-Host (ConvertTo-Json $results -Depth 10)

