<#
  JMC Vercel ESM repair for a newer local repository.
  Compatible with Windows PowerShell 5.1; safe for unrelated frontend files.

  Usage (from the extracted ZIP):
    powershell -ExecutionPolicy Bypass -File .\INSTALL_FIX_KE_PROYEK_TERBARU.ps1 -ProjectRoot 'D:\JUARAMETA\JUARAMETA CORP\WEB JMC'

  Saves backed-up files to %TEMP%, not into Git. It does NOT commit/push/deploy.
#>
param([string]$ProjectRoot = (Get-Location).Path)
$ErrorActionPreference = 'Stop'
$sourceRoot = $PSScriptRoot
$targetRoot = (Resolve-Path -LiteralPath $ProjectRoot).Path

if ((-not (Test-Path (Join-Path $targetRoot 'package.json'))) -or
    (-not (Test-Path (Join-Path $targetRoot 'server\app.ts'))) -or
    (-not (Test-Path (Join-Path $targetRoot 'api\index.ts')))) {
  throw 'Folder tujuan harus berisi package.json, server/app.ts, dan api/index.ts.'
}
if ($sourceRoot -eq $targetRoot) {
  Write-Host 'Ini adalah folder paket terbaru. File-filenya sudah diperbaiki.' -ForegroundColor Green
  exit 0
}
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupRoot = Join-Path $env:TEMP ('jmc-esm-backup-' + $stamp)
$encoding = New-Object System.Text.UTF8Encoding($false)
$entries = @{
  'server/app.ts' = @('./validation', './cms', './supabase')
  'server/cms.ts' = @('../src/cms/defaultContent', '../src/cms/schema', './supabase')
  'server/supabase.ts' = @('../src/cms/schema')
  'server/index.ts' = @('./app')
  'src/cms/defaultContent.ts' = @('./schema')
}
$modified = New-Object System.Collections.Generic.List[string]
function Backup-File([string]$relative) {
  $src = Join-Path $targetRoot ($relative.Replace('/','\'))
  if (-not (Test-Path -LiteralPath $src)) { return }
  $dst = Join-Path $backupRoot ($relative.Replace('/','\'))
  $folder = Split-Path -Parent $dst
  if (-not (Test-Path $folder)) { New-Item -ItemType Directory -Path $folder -Force | Out-Null }
  Copy-Item -LiteralPath $src -Destination $dst -Force
}

# Patch specific import specifiers, preserving everything else in local source files.
foreach ($name in $entries.Keys) {
  $file = Join-Path $targetRoot ($name.Replace('/','\'))
  if (-not (Test-Path -LiteralPath $file)) { Write-Host "[SKIP] $name not found" -ForegroundColor Yellow; continue }
  $old = [System.IO.File]::ReadAllText($file)
  $new = $old
  foreach ($specifier in $entries[$name]) {
    foreach ($quote in @("'", '"')) {
      $new = $new.Replace(($quote + $specifier + $quote), ($quote + $specifier + '.js' + $quote))
    }
  }
  if ($name -eq 'server/app.ts' -and $new -notmatch "app\.get\('\/api\/ping'") {
    $anchor = "app.get('/api/health',"
    $ping = @'
// Diagnostic endpoint; intentionally independent of Supabase.
app.get('/api/ping', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'juarametacorp-api' });
});

'@
    if ($new.Contains($anchor)) { $new = $new.Replace($anchor, $ping + $anchor) }
  }
  if ($new -ne $old) {
    Backup-File $name
    [System.IO.File]::WriteAllText($file, $new, $encoding)
    $modified.Add($name)
    Write-Host "[UPDATED] $name" -ForegroundColor Green
  } else { Write-Host "[UNCHANGED] $name" -ForegroundColor Cyan }
}

# Replace only the failing Vercel entrypoint. Application logic lives in server/app.ts.
Backup-File 'api/index.ts'
Copy-Item -LiteralPath (Join-Path $sourceRoot 'api\index.ts') -Destination (Join-Path $targetRoot 'api\index.ts') -Force
$modified.Add('api/index.ts')

# Add the standalone import/route diagnostic script, without modifying package.json.
$checkDest = Join-Path $targetRoot 'scripts\check-esm-imports.mjs'
if (-not (Test-Path (Split-Path -Parent $checkDest))) {
  New-Item -ItemType Directory -Path (Split-Path -Parent $checkDest) -Force | Out-Null
}
if (Test-Path $checkDest) { Backup-File 'scripts/check-esm-imports.mjs' }
Copy-Item -LiteralPath (Join-Path $sourceRoot 'scripts\check-esm-imports.mjs') -Destination $checkDest -Force
Write-Host "`nPerubahan: $($modified.Count) file; backup: $backupRoot" -ForegroundColor Green
Write-Host 'Selanjutnya dari ROOT proyek: node scripts/check-esm-imports.mjs; npx tsc --noEmit; npm run build' -ForegroundColor Yellow
Write-Host 'Jangan push bila salah satu tes masih gagal. File frontend terbaru tetap dipertahankan.' -ForegroundColor Yellow
