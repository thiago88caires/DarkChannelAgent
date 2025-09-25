Param(
  [string]$EnvPath = ".env",
  [int]$YearsValid = 10
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Base64UrlEncode([byte[]]$bytes) {
  $b64 = [System.Convert]::ToBase64String($bytes)
  $b64 = $b64.TrimEnd('=')
  $b64 = $b64.Replace('+','-').Replace('/','_')
  return $b64
}

function SignHS256([string]$data, [string]$secret) {
  [byte[]]$key = [System.Text.Encoding]::UTF8.GetBytes($secret)
  [byte[]]$payloadBytes = [System.Text.Encoding]::UTF8.GetBytes($data)
  $hmac = [System.Security.Cryptography.HMACSHA256]::new($key)
  [byte[]]$sig = $hmac.ComputeHash($payloadBytes)
  return (Base64UrlEncode $sig)
}

function MakeJwt([hashtable]$payload, [string]$secret) {
  $header = @{ alg = 'HS256'; typ = 'JWT' }
  $headerJson = ($header | ConvertTo-Json -Compress)
  $payloadJson = ($payload | ConvertTo-Json -Compress)
  $seg1 = Base64UrlEncode([System.Text.Encoding]::UTF8.GetBytes($headerJson))
  $seg2 = Base64UrlEncode([System.Text.Encoding]::UTF8.GetBytes($payloadJson))
  $data = "$seg1.$seg2"
  $sig = SignHS256 $data $secret
  return "$data.$sig"
}

# Load .env
if (Test-Path $EnvPath) {
  $envContent = Get-Content $EnvPath -Raw
} else {
  $envContent = ""
}

$secret = $null
if ($envContent -match "(?m)^\s*JWT_SECRET\s*=\s*(.+)\s*$") { $secret = $Matches[1].Trim() }
if (-not $secret -or $secret -eq '') { $secret = "super-secret-jwt" }

$now = [int][math]::Floor(([DateTimeOffset]::UtcNow.ToUnixTimeSeconds()))
$exp = [int][math]::Floor(([DateTimeOffset]::UtcNow.AddYears($YearsValid).ToUnixTimeSeconds()))

$anonPayload = @{ role = 'anon'; iss = 'supabase'; iat = $now; exp = $exp }
$servicePayload = @{ role = 'service_role'; iss = 'supabase'; iat = $now; exp = $exp }

$anon = MakeJwt $anonPayload $secret
$service = MakeJwt $servicePayload $secret

# Update or insert lines in .env
function UpsertEnvLine([string]$content, [string]$key, [string]$value) {
  $line = "$key=$value"
  if ($content -match "(?m)^\s*$([regex]::Escape($key))\s*=.*$") {
    return ([regex]::Replace($content, "(?m)^\s*$([regex]::Escape($key))\s*=.*$", [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $line }))
  }
  if ($content -and -not $content.EndsWith("`n")) { $content += "`n" }
  return $content + $line + "`n"
}

$envContent = UpsertEnvLine $envContent 'SUPABASE_ANON_KEY' $anon
$envContent = UpsertEnvLine $envContent 'SUPABASE_SERVICE_ROLE_KEY' $service
if ($envContent -notmatch "(?m)^\s*SUPABASE_URL_PUBLIC\s*=") {
  $envContent = UpsertEnvLine $envContent 'SUPABASE_URL_PUBLIC' 'http://localhost:54321'
}

Set-Content -Path $EnvPath -Value $envContent -NoNewline:$false -Encoding UTF8

Write-Output "Generated keys and updated $EnvPath"
Write-Output "SUPABASE_ANON_KEY=... (len=$($anon.Length))"
Write-Output "SUPABASE_SERVICE_ROLE_KEY=... (len=$($service.Length))"
