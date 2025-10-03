#!/bin/bash

# DockerIDE Quick Start Script
# The fastest way to test DockerIDE locally

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
cat << "EOF"
╔══════════════════════════════════════════╗
║         DockerIDE Quick Start            ║
║   Educational Development Environments   ║
╚══════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo -e "${YELLOW}This script will:${NC}"
echo "1. Check OrbStack is installed"
echo "2. Build the base and database images"
echo "3. Launch a database environment for testing"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."

# Check Docker
echo ""
echo -e "${BLUE}[1/4] Checking OrbStack...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker not found. Please install OrbStack first:${NC}"
    echo "  brew install orbstack"
    exit 1
fi
echo -e "${GREEN}✓ OrbStack is installed${NC}"

# Build base image
echo ""
echo -e "${BLUE}[2/4] Building base image (this may take a few minutes)...${NC}"
docker build -t dockeride/base:latest ./docker-images/base/
echo -e "${GREEN}✓ Base image built${NC}"

# Build database image
echo ""
echo -e "${BLUE}[3/4] Building database image (PostgreSQL + MongoDB + SQLite)...${NC}"
docker build -t dockeride/sql:latest ./docker-images/sql/
echo -e "${GREEN}✓ Database image built${NC}"

# Run database container
echo ""
echo -e "${BLUE}[4/4] Starting database environment...${NC}"
CONTAINER_ID=$(docker run -d \
    -p 8080:8080 \
    -p 5432:5432 \
    -p 27017:27017 \
    -e STUDENT_ID=demo-student \
    -e ASSIGNMENT_ID=database-demo \
    -e VSCODE_PASSWORD=demo123 \
    dockeride/sql:latest)

echo -e "${GREEN}✓ Database environment started!${NC}"
echo ""
echo -e "${YELLOW}Container ID: ${CONTAINER_ID:0:12}${NC}"
echo ""
echo "⏳ Waiting for databases to start (15 seconds)..."
sleep 15

# Final instructions
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          🎉 Ready to Test!               ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 VS Code Server:${NC}"
echo "   URL:      http://localhost:8080"
echo "   Password: demo123"
echo ""
echo -e "${BLUE}🗄️  Databases Running:${NC}"
echo "   PostgreSQL → localhost:5432 (user: student, db: student)"
echo "   MongoDB    → localhost:27017 (db: studentdb)"
echo "   SQLite     → ~/databases/sqlite/sample.db"
echo ""
echo -e "${BLUE}📝 Quick Test Commands (run in VS Code terminal):${NC}"
echo ""
echo "   ${YELLOW}# Test PostgreSQL${NC}"
echo "   psql -U student student -c \"SELECT * FROM students;\""
echo ""
echo "   ${YELLOW}# Test MongoDB${NC}"
echo "   mongosh studentdb --eval \"db.students.find().pretty()\""
echo ""
echo "   ${YELLOW}# Test SQLite${NC}"
echo "   sqlite3 ~/databases/sqlite/sample.db \"SELECT * FROM students;\""
echo ""
echo -e "${BLUE}🛑 To Stop:${NC}"
echo "   docker stop ${CONTAINER_ID:0:12} && docker rm ${CONTAINER_ID:0:12}"
echo ""
echo -e "${BLUE}📚 Next Steps:${NC}"
echo "   • Open http://localhost:8080 in your browser"
echo "   • Try the database test commands above"
echo "   • Use VS Code SQLTools and MongoDB extensions"
echo "   • See TESTING_README.md for more test options"
echo ""
echo -e "${GREEN}Happy Testing! 🚀${NC}"
echo ""

# Open browser (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    read -p "Open browser now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open http://localhost:8080
    fi
fi