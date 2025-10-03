#!/bin/bash

# DockerIDE Local Testing Script for OrbStack
# Usage: ./test-local.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Functions
print_header() {
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if OrbStack is installed
check_orbstack() {
    print_header "Checking OrbStack"

    if ! command -v docker &> /dev/null; then
        print_error "Docker not found. Please install OrbStack: brew install orbstack"
        exit 1
    fi

    print_success "Docker is available"
    docker --version
}

# Build all images
build_all() {
    print_header "Building All Docker Images"

    cd "$PROJECT_ROOT"

    # Build base image first
    print_info "Building base image..."
    docker build -t dockeride/base:latest ./docker-images/base/ || {
        print_error "Failed to build base image"
        exit 1
    }
    print_success "Base image built"

    # Build language images
    for lang in python nodejs cpp java sql; do
        print_info "Building $lang image..."
        docker build -t dockeride/$lang:latest ./docker-images/$lang/ || {
            print_error "Failed to build $lang image"
            exit 1
        }
        print_success "$lang image built"
    done

    print_success "All images built successfully!"
}

# Build specific image
build_image() {
    local image=$1
    print_header "Building $image Image"

    cd "$PROJECT_ROOT"

    if [ "$image" != "base" ]; then
        print_info "Building base image first..."
        docker build -t dockeride/base:latest ./docker-images/base/
    fi

    docker build -t dockeride/$image:latest ./docker-images/$image/ || {
        print_error "Failed to build $image image"
        exit 1
    }

    print_success "$image image built successfully!"
}

# Test single environment
test_env() {
    local lang=$1
    local port=$2
    local repo=$3

    print_header "Testing $lang Environment"

    print_info "Starting container on port $port..."

    local container_id=$(docker run -d \
        -p $port:8080 \
        -e STUDENT_ID=test-student \
        -e ASSIGNMENT_ID=${lang}-test \
        -e VSCODE_PASSWORD=test123 \
        ${repo:+-e GITHUB_REPO=$repo} \
        dockeride/$lang:latest)

    echo "$container_id" > /tmp/dockeride-test-$lang.pid

    print_success "Container started: $container_id"
    print_info "Waiting for VS Code Server to start..."
    sleep 5

    # Check if container is running
    if docker ps | grep -q $container_id; then
        print_success "$lang environment is running!"
        print_info "Access at: http://localhost:$port"
        print_info "Password: test123"
        print_info "Container ID: $container_id"
        echo ""
        print_info "To stop: docker stop $container_id && docker rm $container_id"
    else
        print_error "Container failed to start. Checking logs..."
        docker logs $container_id
        docker rm $container_id
        exit 1
    fi
}

# Test Python
test_python() {
    build_image python
    test_env python 8080 "https://github.com/microsoft/python-sample-vscode-flask-tutorial"
}

# Test Node.js
test_nodejs() {
    build_image nodejs
    test_env nodejs 8081 "https://github.com/microsoft/vscode-extension-samples"
}

# Test C++
test_cpp() {
    build_image cpp
    test_env cpp 8082 ""
}

# Test Java
test_java() {
    build_image java
    test_env java 8083 ""
}

# Test Database
test_database() {
    build_image sql

    print_header "Testing Database Environment"

    print_info "Starting database container on port 8084..."
    print_info "This includes PostgreSQL, MongoDB, and SQLite"

    local container_id=$(docker run -d \
        -p 8084:8080 \
        -p 5432:5432 \
        -p 27017:27017 \
        -e STUDENT_ID=test-student \
        -e ASSIGNMENT_ID=db-test \
        -e VSCODE_PASSWORD=test123 \
        dockeride/sql:latest)

    echo "$container_id" > /tmp/dockeride-test-sql.pid

    print_success "Container started: $container_id"
    print_info "Waiting for databases to start..."
    sleep 10

    # Check if container is running
    if docker ps | grep -q $container_id; then
        print_success "Database environment is running!"
        echo ""
        print_info "VS Code Server: http://localhost:8084 (password: test123)"
        print_info "PostgreSQL: localhost:5432 (user: student, db: student)"
        print_info "MongoDB: localhost:27017 (db: studentdb)"
        print_info "SQLite: ~/databases/sqlite/sample.db"
        echo ""
        print_info "To test databases, open VS Code and run:"
        print_info "  psql -U student student"
        print_info "  mongosh studentdb"
        print_info "  sqlite3 ~/databases/sqlite/sample.db"
        echo ""
        print_info "To stop: docker stop $container_id && docker rm $container_id"
    else
        print_error "Container failed to start. Checking logs..."
        docker logs $container_id
        docker rm $container_id
        exit 1
    fi
}

# Test all environments
test_all() {
    print_header "Testing All Environments"

    build_all

    print_info "Starting all environments on different ports..."

    test_env python 8080 "https://github.com/microsoft/python-sample-vscode-flask-tutorial"
    echo ""
    test_env nodejs 8081 "https://github.com/microsoft/vscode-extension-samples"
    echo ""
    test_env cpp 8082 ""
    echo ""
    test_env java 8083 ""
    echo ""
    test_env sql 8084 ""

    print_header "All Environments Running"
    echo ""
    echo "Python:   http://localhost:8080 (password: test123)"
    echo "Node.js:  http://localhost:8081 (password: test123)"
    echo "C++:      http://localhost:8082 (password: test123)"
    echo "Java:     http://localhost:8083 (password: test123)"
    echo "Database: http://localhost:8084 (password: test123)"
    echo ""
    print_info "Run './test-local.sh cleanup' to stop all containers"
}

# Cleanup all test containers
cleanup() {
    print_header "Cleaning Up Test Containers"

    # Stop and remove all DockerIDE containers
    print_info "Stopping containers..."
    docker ps -a | grep dockeride | awk '{print $1}' | xargs -r docker stop 2>/dev/null || true
    docker ps -a | grep dockeride | awk '{print $1}' | xargs -r docker rm 2>/dev/null || true

    # Remove PID files
    rm -f /tmp/dockeride-test-*.pid

    print_success "Cleanup complete!"
}

# Start docker-compose services
start_services() {
    print_header "Starting Full System with Docker Compose"

    cd "$PROJECT_ROOT"

    # Check if .env exists
    if [ ! -f .env ]; then
        print_info "Creating .env file from .env.example..."
        cp .env.example .env
    fi

    # Build service images
    print_info "Building service images..."
    docker build -t dockeride/lti-service:latest ./lti-service/
    docker build -t dockeride/workspace-manager:latest ./workspace-manager/
    docker build -t dockeride/api-gateway:latest ./api-gateway/

    # Start services
    print_info "Starting services..."
    docker-compose -f docker-compose.dev.yaml up -d

    print_success "Services started!"
    echo ""
    print_info "Check status: docker-compose -f docker-compose.dev.yaml ps"
    print_info "View logs: docker-compose -f docker-compose.dev.yaml logs -f"
    print_info "Stop services: docker-compose -f docker-compose.dev.yaml down"
}

# Stop docker-compose services
stop_services() {
    print_header "Stopping Docker Compose Services"

    cd "$PROJECT_ROOT"
    docker-compose -f docker-compose.dev.yaml down

    print_success "Services stopped!"
}

# Show help
show_help() {
    cat << EOF
DockerIDE Local Testing Script

Usage: ./test-local.sh [command]

Commands:
  check              Check if OrbStack is installed and working
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
  ./test-local.sh build                  # Build all images
  ./test-local.sh test-python            # Test Python environment
  ./test-local.sh test-database          # Test database environment
  ./test-local.sh test-all               # Test all environments
  ./test-local.sh cleanup                # Clean up all test containers

EOF
}

# Main script
main() {
    case "${1:-help}" in
        check)
            check_orbstack
            ;;
        build)
            check_orbstack
            build_all
            ;;
        build-image)
            if [ -z "$2" ]; then
                print_error "Please specify image name: base, python, nodejs, cpp, java, or sql"
                exit 1
            fi
            check_orbstack
            build_image "$2"
            ;;
        test-python)
            check_orbstack
            test_python
            ;;
        test-nodejs)
            check_orbstack
            test_nodejs
            ;;
        test-cpp)
            check_orbstack
            test_cpp
            ;;
        test-java)
            check_orbstack
            test_java
            ;;
        test-database)
            check_orbstack
            test_database
            ;;
        test-all)
            check_orbstack
            test_all
            ;;
        services-start)
            check_orbstack
            start_services
            ;;
        services-stop)
            stop_services
            ;;
        cleanup)
            cleanup
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"