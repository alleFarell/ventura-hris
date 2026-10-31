# Ventura HRIS - Start Frontend Dev Server
$ErrorActionPreference = "Stop"

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "   Starting Ventura HRIS Next.js Frontend        " -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$frontendDir = Join-Path $PSScriptRoot "..\frontend"
Set-Location $frontendDir

# Find available port in 310x range (never 8080, 3000, 3001)
$busyPorts = (Get-NetTCPConnection -ErrorAction SilentlyContinue | Select-Object -ExpandProperty LocalPort -Unique)
$targetPort = 3102
if ($targetPort -in $busyPorts) {
    $fallback = (3100..3109) | Where-Object { $_ -notin $busyPorts } | Select-Object -First 1
    if ($fallback) {
        $targetPort = $fallback
    } else {
        $targetPort = (3200..3299) | Where-Object { $_ -notin $busyPorts } | Select-Object -First 1
    }
}

Write-Host "[+] Launching Next.js frontend on http://localhost:$targetPort..." -ForegroundColor Green
npm run dev -- -p $targetPort
