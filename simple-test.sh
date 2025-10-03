#!/bin/bash

# Simple test script for DockerIDE
# This runs containers in foreground so you can see what's happening

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}DockerIDE Simple Test${NC}"
echo ""

# Check what to test
case "${1:-base}" in
  base)
    echo -e "${YELLOW}Testing Base Image${NC}"
    echo ""

    # Build base image
    echo "Building base image..."
    docker build -t dockeride/base:latest ./docker-images/base/

    echo ""
    echo "Starting container (will show logs)..."
    echo "Press Ctrl+C to stop"
    echo ""

    # Run in foreground
    docker run --rm -it \
      -p 8080:8080 \
      -e VSCODE_PASSWORD=test123 \
      -e STUDENT_ID=test \
      dockeride/base:latest
    ;;

  python)
    echo -e "${YELLOW}Testing Python Image${NC}"
    echo ""

    # Build images
    echo "Building base image..."
    docker build -q -t dockeride/base:latest ./docker-images/base/

    echo "Building Python image..."
    docker build -t dockeride/python:latest ./docker-images/python/

    echo ""
    echo "Starting container (will show logs)..."
    echo "Open http://localhost:8080 (password: test123)"
    echo "Press Ctrl+C to stop"
    echo ""

    # Run in foreground
    docker run --rm -it \
      -p 8080:8080 \
      -e VSCODE_PASSWORD=test123 \
      -e STUDENT_ID=test \
      -e GITHUB_REPO=https://github.com/microsoft/python-sample-vscode-flask-tutorial \
      dockeride/python:latest
    ;;

  database)
    echo -e "${YELLOW}Testing Database Image${NC}"
    echo ""

    # Build images
    echo "Building base image..."
    docker build -q -t dockeride/base:latest ./docker-images/base/

    echo "Building SQL/Database image..."
    docker build -t dockeride/sql:latest ./docker-images/sql/

    echo ""
    echo "Starting container (will show logs)..."
    echo "Open http://localhost:8080 (password: test123)"
    echo "Wait for 'Databases started successfully!' message"
    echo "Press Ctrl+C to stop"
    echo ""

    # Run in foreground with more resources
    docker run --rm -it \
      -p 8080:8080 \
      -p 5432:5432 \
      -p 27017:27017 \
      -e VSCODE_PASSWORD=test123 \
      -e STUDENT_ID=test \
      -m 2g \
      dockeride/sql:latest
    ;;

  *)
    echo -e "${YELLOW}Usage: $0 [base|python|database]${NC}"
    echo ""
    echo "Examples:"
    echo "  $0 base      # Test base image only"
    echo "  $0 python    # Test Python environment"
    echo "  $0 database  # Test database environment"
    exit 1
    ;;
esac