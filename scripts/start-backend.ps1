# Ventura HRIS - Start Backend Server
$ErrorActionPreference = "Stop"

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "   Starting Ventura HRIS Spring Boot Backend     " -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$backendDir = Join-Path $PSScriptRoot "..\backend"
$jarPath = Join-Path $backendDir "target\ventura-hris-backend-0.1.0-SNAPSHOT.jar"

# Check if JAR exists
if (-not (Test-Path $jarPath)) {
    Write-Host "[!] Executable JAR not found at $jarPath" -ForegroundColor Yellow
    Write-Host "[*] Building JAR via Docker Maven..." -ForegroundColor Yellow
    docker run --rm -v "C:\Users\YX0CFT6A\.m2:/root/.m2" -v "${backendDir}:/app" -w /app maven:3.9-eclipse-temurin-21 mvn clean package -DskipTests
}

# Determine Java executable
$javaExec = "C:\Program Files\Eclipse Adoptium\jdk-25.0.3.9-hotspot\bin\java.exe"
if (-not (Test-Path $javaExec)) {
    $javaExec = "java"
}

# Find available port in 517x range (never 8080, 3000, 3001)
$busyPorts = (Get-NetTCPConnection -ErrorAction SilentlyContinue | Select-Object -ExpandProperty LocalPort -Unique)
$targetPort = 5174
if ($targetPort -in $busyPorts) {
    $fallback = (5170..5179) | Where-Object { $_ -notin $busyPorts } | Select-Object -First 1
    if ($fallback) {
        $targetPort = $fallback
    } else {
        $targetPort = (5200..5299) | Where-Object { $_ -notin $busyPorts } | Select-Object -First 1
    }
}

Write-Host "[+] Launching backend on http://localhost:$targetPort..." -ForegroundColor Green
& $javaExec "-Dserver.port=$targetPort" -jar $jarPath
