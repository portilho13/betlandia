<#
.SYNOPSIS
    Betlandia - Full Stack Setup and Run Script
.DESCRIPTION
    Checks prerequisites, generates missing files, builds Docker images,
    and starts the entire Betlandia microservices stack.
#>

param(
    [switch]$Down,
    [switch]$Rebuild,
    [switch]$Logs
)

$ErrorActionPreference = "Continue"
$ProjectRoot = $PSScriptRoot

function Write-Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "    [OK] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "    [!] $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "    [X] $msg" -ForegroundColor Red }

# Handle -Down flag
if ($Down) {
    Write-Step "Stopping all containers..."
    docker compose -f "$ProjectRoot\docker-compose.yaml" down
    exit $LASTEXITCODE
}

# Handle -Logs flag
if ($Logs) {
    docker compose -f "$ProjectRoot\docker-compose.yaml" logs -f
    exit $LASTEXITCODE
}

# 1. Check prerequisites
Write-Step "Checking prerequisites..."

$docker = Get-Command docker -ErrorAction SilentlyContinue
if (-not $docker) {
    Write-Err "Docker is not installed or not in PATH."
    Write-Host "    Install Docker Desktop from https://www.docker.com/products/docker-desktop/"
    exit 1
}
Write-Ok "Docker found"

docker info > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Err "Docker daemon is not running. Please start Docker Desktop."
    exit 1
}
Write-Ok "Docker daemon is running"

docker compose version > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Err "Docker Compose is not available. It should come with Docker Desktop."
    exit 1
}
Write-Ok "Docker Compose found"

# 2. Check port availability
Write-Step "Checking port availability..."

$portMap = @{
    3000 = "betlandia-web (frontend)"
    3001 = "football-api-mock"
    5432 = "PostgreSQL"
    6379 = "Redis"
    8080 = "API Gateway"
    8081 = "Match Ingestor"
    8082 = "Odds Calculator"
    8083 = "Bet Service"
    8089 = "Kafka UI"
    9042 = "Cassandra"
    9092 = "Kafka"
}

$portsInUse = @()
foreach ($port in $portMap.Keys | Sort-Object) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) {
        $portsInUse += $port
        Write-Warn "Port $port ($($portMap[$port])) is already in use"
    }
}

if ($portsInUse.Count -gt 0) {
    Write-Warn "$($portsInUse.Count) port(s) in use. This may cause conflicts."
    Write-Host "    Continue anyway? (y/N): " -NoNewline
    $answer = Read-Host
    if ($answer -ne "y" -and $answer -ne "Y") {
        Write-Host "Aborted."
        exit 0
    }
} else {
    Write-Ok "All required ports are available"
}

# 3. Generate missing package-lock.json for Node projects
Write-Step "Ensuring Node.js lock files exist..."

$nodeProjects = @(
    "$ProjectRoot\cores\betlandia-web",
    "$ProjectRoot\cores\football_api_mock"
)

foreach ($proj in $nodeProjects) {
    $lockFile = Join-Path $proj "package-lock.json"
    $pkgFile  = Join-Path $proj "package.json"
    $projName = Split-Path $proj -Leaf

    if (-not (Test-Path $lockFile)) {
        if (Test-Path $pkgFile) {
            Write-Warn "$projName is missing package-lock.json - generating via Docker..."
            docker run --rm -v "${proj}:/app" -w /app node:20-alpine npm install --package-lock-only 2>$null
            if (Test-Path $lockFile) {
                Write-Ok "Generated package-lock.json for $projName"
            } else {
                Write-Err "Failed to generate package-lock.json for $projName"
                exit 1
            }
        }
    } else {
        Write-Ok "$projName already has package-lock.json"
    }
}

# 4. Build and start everything
Write-Step "Building and starting all services..."
Write-Host "    This will take a few minutes on first run (downloading images + building)." -ForegroundColor DarkGray
Write-Host ""

if ($Rebuild) {
    docker compose -f "$ProjectRoot\docker-compose.yaml" up -d --build --force-recreate --no-cache
} else {
    docker compose -f "$ProjectRoot\docker-compose.yaml" up -d --build
}

if ($LASTEXITCODE -ne 0) {
    Write-Err "Docker Compose failed. Check the output above for errors."
    exit 1
}

# 5. Wait for services to be healthy
Write-Step "Waiting for services to become healthy..."

$healthCheckedServices = @("kafka", "redis", "postgres")
$maxWait = 120
$elapsed = 0

foreach ($svc in $healthCheckedServices) {
    Write-Host "    Waiting for $svc..." -NoNewline
    while ($elapsed -lt $maxWait) {
        $healthResult = $null
        try {
            $healthResult = docker inspect --format "{{.State.Health.Status}}" $svc 2>$null
        } catch {}
        if ($healthResult -eq "healthy") {
            Write-Host " healthy" -ForegroundColor Green
            break
        }
        Start-Sleep -Seconds 3
        $elapsed += 3
        Write-Host "." -NoNewline
    }
    if ($elapsed -ge $maxWait) {
        Write-Warn " timed out after ${maxWait}s (may still be starting)"
    }
}

# 6. Summary
Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  Betlandia is starting up!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Services:" -ForegroundColor White
Write-Host "    Frontend:        http://localhost:3000"
Write-Host "    API Gateway:     http://localhost:8080"
Write-Host "    Match Ingestor:  http://localhost:8081"
Write-Host "    Odds Calculator: http://localhost:8082"
Write-Host "    Bet Service:     http://localhost:8083"
Write-Host "    Football Mock:   http://localhost:3001"
Write-Host "    Kafka UI:        http://localhost:8089"
Write-Host ""
Write-Host "  Infrastructure:" -ForegroundColor White
Write-Host "    PostgreSQL:      localhost:5432  (betlandia/betlandia)" -ForegroundColor DarkGray
Write-Host "    Redis:           localhost:6379" -ForegroundColor DarkGray
Write-Host "    Kafka:           localhost:9092" -ForegroundColor DarkGray
Write-Host "    Cassandra:       localhost:9042" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Commands:" -ForegroundColor White
Write-Host "    .\start.ps1 -Logs      View live logs" -ForegroundColor DarkGray
Write-Host "    .\start.ps1 -Down      Stop everything" -ForegroundColor DarkGray
Write-Host "    .\start.ps1 -Rebuild   Full rebuild (no cache)" -ForegroundColor DarkGray
Write-Host ""
