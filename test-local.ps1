# DockerIDE Local Testing Script for Rancher Desktop (Windows)
# Usage: .\test-local.ps1 [command]

param(
    [Parameter(Position=0)]
    [string]$Command = "help",

    [Parameter(Position=1)]
    [string]$ImageName = ""
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Project root
$ProjectRoot = $PSScriptRoot

# Colors for output
function Write-Header {
    param([string]$Message)
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host "  $Message" -ForegroundColor Blue
    Write-Host "========================================" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Yellow
}

# Check if Docker (Rancher Desktop) is installed
function Test-Docker {
    Write-Header "Checking Docker (Rancher Desktop)"

    try {
        $dockerVersion = docker --version
        Write-Success "Docker is available"
        Write-Host $dockerVersion
        return $true
    }
    catch {
        Write-Error "Docker not found. Please ensure Rancher Desktop is running."
        Write-Info "Download from: https://rancherdesktop.io/"
        exit 1
    }
}

# Build all images
function Build-AllImages {
    Write-Header "Building All Docker Images"

    Set-Location $ProjectRoot

    # Build base image first
    Write-Info "Building base image..."
    docker build -t dockeride/base:latest .\docker-images\base\
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to build base image"
        exit 1
    }
    Write-Success "Base image built"

    # Build language images
    $languages = @("python", "nodejs", "cpp", "java", "sql")
    foreach ($lang in $languages) {
        Write-Info "Building $lang image..."
        docker build -t dockeride/${lang}:latest .\docker-images\$lang\
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to build $lang image"
            exit 1
        }
        Write-Success "$lang image built"
    }

    Write-Success "All images built successfully!"
}

# Build specific image
function Build-Image {
    param([string]$Image)

    Write-Header "Building $Image Image"

    Set-Location $ProjectRoot

    if ($Image -ne "base") {
        Write-Info "Building base image first..."
        docker build -t dockeride/base:latest .\docker-images\base\
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to build base image"
            exit 1
        }
    }

    docker build -t dockeride/${Image}:latest .\docker-images\$Image\
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to build $Image image"
        exit 1
    }

    Write-Success "$Image image built successfully!"
}

# Test single environment
function Test-Environment {
    param(
        [string]$Language,
        [int]$Port,
        [string]$Repo = ""
    )

    Write-Header "Testing $Language Environment"

    Write-Info "Starting container on port $Port..."

    $dockerArgs = @(
        "run", "-d",
        "-p", "${Port}:8080",
        "-e", "STUDENT_ID=test-student",
        "-e", "ASSIGNMENT_ID=${Language}-test",
        "-e", "VSCODE_PASSWORD=test123"
    )

    if ($Repo) {
        $dockerArgs += "-e"
        $dockerArgs += "GITHUB_REPO=$Repo"
    }

    $dockerArgs += "dockeride/${Language}:latest"

    $containerId = & docker $dockerArgs

    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to start container"
        exit 1
    }

    # Store container ID for cleanup
    $containerId | Out-File -FilePath "$env:TEMP\dockeride-test-${Language}.txt" -Encoding UTF8

    Write-Success "Container started: $containerId"
    Write-Info "Waiting for VS Code Server to start..."
    Start-Sleep -Seconds 5

    # Check if container is running
    $runningContainers = docker ps --format "{{.ID}}"
    if ($runningContainers -contains $containerId.Substring(0, 12)) {
        Write-Success "$Language environment is running!"
        Write-Info "Access at: http://localhost:$Port"
        Write-Info "Password: test123"
        Write-Info "Container ID: $containerId"
        Write-Host ""
        Write-Info "To stop: docker stop $containerId; docker rm $containerId"
    }
    else {
        Write-Error "Container failed to start. Checking logs..."
        docker logs $containerId
        docker rm $containerId
        exit 1
    }
}

# Test Python
function Test-Python {
    Build-Image -Image "python"
    Test-Environment -Language "python" -Port 8080 -Repo "https://github.com/microsoft/python-sample-vscode-flask-tutorial"
}

# Test Node.js
function Test-NodeJs {
    Build-Image -Image "nodejs"
    Test-Environment -Language "nodejs" -Port 8081 -Repo "https://github.com/microsoft/vscode-extension-samples"
}

# Test C++
function Test-Cpp {
    Build-Image -Image "cpp"
    Test-Environment -Language "cpp" -Port 8082
}

# Test Java
function Test-Java {
    Build-Image -Image "java"
    Test-Environment -Language "java" -Port 8083
}

# Test Database
function Test-Database {
    Build-Image -Image "sql"

    Write-Header "Testing Database Environment"

    Write-Info "Starting database container on port 8084..."
    Write-Info "This includes PostgreSQL, MongoDB, and SQLite"

    $containerId = docker run -d `
        -p 8084:8080 `
        -p 5432:5432 `
        -p 27017:27017 `
        -e STUDENT_ID=test-student `
        -e ASSIGNMENT_ID=db-test `
        -e VSCODE_PASSWORD=test123 `
        dockeride/sql:latest

    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to start database container"
        exit 1
    }

    $containerId | Out-File -FilePath "$env:TEMP\dockeride-test-sql.txt" -Encoding UTF8

    Write-Success "Container started: $containerId"
    Write-Info "Waiting for databases to start..."
    Start-Sleep -Seconds 10

    # Check if container is running
    $runningContainers = docker ps --format "{{.ID}}"
    if ($runningContainers -contains $containerId.Substring(0, 12)) {
        Write-Success "Database environment is running!"
        Write-Host ""
        Write-Info "VS Code Server: http://localhost:8084 (password: test123)"
        Write-Info "PostgreSQL: localhost:5432 (user: student, db: student)"
        Write-Info "MongoDB: localhost:27017 (db: studentdb)"
        Write-Info "SQLite: ~/databases/sqlite/sample.db"
        Write-Host ""
        Write-Info "To test databases, open VS Code and run:"
        Write-Info "  psql -U student student"
        Write-Info "  mongosh studentdb"
        Write-Info "  sqlite3 ~/databases/sqlite/sample.db"
        Write-Host ""
        Write-Info "To stop: docker stop $containerId; docker rm $containerId"
    }
    else {
        Write-Error "Container failed to start. Checking logs..."
        docker logs $containerId
        docker rm $containerId
        exit 1
    }
}

# Test all environments
function Test-AllEnvironments {
    Write-Header "Testing All Environments"

    Build-AllImages

    Write-Info "Starting all environments on different ports..."

    Test-Environment -Language "python" -Port 8080 -Repo "https://github.com/microsoft/python-sample-vscode-flask-tutorial"
    Write-Host ""
    Test-Environment -Language "nodejs" -Port 8081 -Repo "https://github.com/microsoft/vscode-extension-samples"
    Write-Host ""
    Test-Environment -Language "cpp" -Port 8082
    Write-Host ""
    Test-Environment -Language "java" -Port 8083
    Write-Host ""
    Test-Environment -Language "sql" -Port 8084

    Write-Header "All Environments Running"
    Write-Host ""
    Write-Host "Python:   http://localhost:8080 (password: test123)"
    Write-Host "Node.js:  http://localhost:8081 (password: test123)"
    Write-Host "C++:      http://localhost:8082 (password: test123)"
    Write-Host "Java:     http://localhost:8083 (password: test123)"
    Write-Host "Database: http://localhost:8084 (password: test123)"
    Write-Host ""
    Write-Info "Run '.\test-local.ps1 cleanup' to stop all containers"
}

# Cleanup all test containers
function Invoke-Cleanup {
    Write-Header "Cleaning Up Test Containers"

    Write-Info "Stopping and removing DockerIDE containers..."

    $containers = docker ps -a --filter "ancestor=dockeride/python:latest" --format "{{.ID}}"
    $containers += docker ps -a --filter "ancestor=dockeride/nodejs:latest" --format "{{.ID}}"
    $containers += docker ps -a --filter "ancestor=dockeride/cpp:latest" --format "{{.ID}}"
    $containers += docker ps -a --filter "ancestor=dockeride/java:latest" --format "{{.ID}}"
    $containers += docker ps -a --filter "ancestor=dockeride/sql:latest" --format "{{.ID}}"

    if ($containers) {
        $containers | ForEach-Object {
            if ($_) {
                docker stop $_ 2>$null
                docker rm $_ 2>$null
            }
        }
    }

    # Remove PID files
    Remove-Item -Path "$env:TEMP\dockeride-test-*.txt" -ErrorAction SilentlyContinue

    Write-Success "Cleanup complete!"
}

# Start docker-compose services
function Start-Services {
    Write-Header "Starting Full System with Docker Compose"

    Set-Location $ProjectRoot

    # Check if .env exists
    if (-not (Test-Path .env)) {
        if (Test-Path .env.example) {
            Write-Info "Creating .env file from .env.example..."
            Copy-Item .env.example .env
        }
        else {
            Write-Info "No .env file found. Creating basic .env..."
            @"
GITHUB_TOKEN=your_github_token_here
NODE_ENV=development
"@ | Out-File -FilePath .env -Encoding UTF8
        }
    }

    # Build service images
    Write-Info "Building service images..."
    docker build -t dockeride/lti-service:latest .\lti-service\
    docker build -t dockeride/workspace-manager:latest .\workspace-manager\
    docker build -t dockeride/api-gateway:latest .\api-gateway\

    # Start services
    Write-Info "Starting services..."
    docker-compose -f docker-compose.dev.yaml up -d

    Write-Success "Services started!"
    Write-Host ""
    Write-Info "Check status: docker-compose -f docker-compose.dev.yaml ps"
    Write-Info "View logs: docker-compose -f docker-compose.dev.yaml logs -f"
    Write-Info "Stop services: docker-compose -f docker-compose.dev.yaml down"
}

# Stop docker-compose services
function Stop-Services {
    Write-Header "Stopping Docker Compose Services"

    Set-Location $ProjectRoot
    docker-compose -f docker-compose.dev.yaml down

    Write-Success "Services stopped!"
}

# Show help
function Show-Help {
    @"
DockerIDE Local Testing Script for Rancher Desktop (Windows)

Usage: .\test-local.ps1 [command]

Commands:
  check              Check if Docker (Rancher Desktop) is installed and working
  build              Build all Docker images
  build-image <name> Build specific image (base, python, nodejs, cpp, java, sql)

  test-python        Test Python environment
  test-nodejs        Test Node.js environment
  test-cpp           Test C++ environment
  test-java          Test Java environment
  test-database      Test database environment (PostgreSQL, MongoDB, SQLite)
  test-all           Test all environments

  services-start     Start full system with docker-compose
  services-stop      Stop docker-compose services

  cleanup            Stop and remove all test containers
  help               Show this help message

Examples:
  .\test-local.ps1 check                      # Check Docker is running
  .\test-local.ps1 build                      # Build all images
  .\test-local.ps1 build-image python         # Build Python image only
  .\test-local.ps1 test-python                # Test Python environment
  .\test-local.ps1 test-database              # Test database environment
  .\test-local.ps1 test-all                   # Test all environments
  .\test-local.ps1 cleanup                    # Clean up all test containers

"@
}

# Main script execution
try {
    switch ($Command.ToLower()) {
        "check" {
            Test-Docker
        }
        "build" {
            Test-Docker
            Build-AllImages
        }
        "build-image" {
            if (-not $ImageName) {
                Write-Error "Please specify image name: base, python, nodejs, cpp, java, or sql"
                Write-Host ""
                Write-Host "Usage: .\test-local.ps1 build-image <name>"
                Write-Host "Example: .\test-local.ps1 build-image python"
                exit 1
            }
            Test-Docker
            Build-Image -Image $ImageName
        }
        "test-python" {
            Test-Docker
            Test-Python
        }
        "test-nodejs" {
            Test-Docker
            Test-NodeJs
        }
        "test-cpp" {
            Test-Docker
            Test-Cpp
        }
        "test-java" {
            Test-Docker
            Test-Java
        }
        "test-database" {
            Test-Docker
            Test-Database
        }
        "test-all" {
            Test-Docker
            Test-AllEnvironments
        }
        "services-start" {
            Test-Docker
            Start-Services
        }
        "services-stop" {
            Stop-Services
        }
        "cleanup" {
            Invoke-Cleanup
        }
        "help" {
            Show-Help
        }
        default {
            Write-Error "Unknown command: $Command"
            Write-Host ""
            Show-Help
            exit 1
        }
    }
}
catch {
    Write-Error "An error occurred: $_"
    exit 1
}
