$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$runtime = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies'
$bundledNode = Join-Path $runtime 'node/bin'
if (Test-Path -LiteralPath $bundledNode) { $env:PATH = "$bundledNode;$env:PATH" }
$pnpmCommand = Get-Command pnpm -ErrorAction SilentlyContinue
if ($pnpmCommand) { $packageManager = $pnpmCommand.Source } else { $packageManager = Join-Path $runtime 'bin/fallback/pnpm.cmd' }
if (!(Test-Path -LiteralPath $packageManager)) { throw 'Install Node.js and pnpm, then run pnpm dev in the nexo folder.' }
if (!(Test-Path -LiteralPath '.dev.vars')) { Copy-Item -LiteralPath '.env.example' -Destination '.dev.vars' }
Write-Host 'NEXO: http://localhost:3000' -ForegroundColor Green
Write-Host 'Keep this window open. Stop with Ctrl+C.'
& $packageManager dev --host 127.0.0.1
