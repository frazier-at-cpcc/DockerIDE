# OrbStack Local Testing Guide

This guide helps you test the DockerIDE system locally using OrbStack on macOS.

## Prerequisites

### 1. Install OrbStack
```bash
# Install via Homebrew
brew install orbstack

# Or download from https://orbstack.dev
```

### 2. Verify OrbStack is Running
```bash
# Check Docker is available
docker --version

# Check OrbStack status
orb status
```

## Quick Start Testing

### Option 1: Test Individual Language Containers (Fastest)

This is the quickest way to test each language environment:

#### 1. Build the Base Image
```bash
cd /Users/frazier/Documents/Projects/DockerIDE

# Build base image
docker build -t dockeride/base:latest ./docker-images/base/
```

#### 2. Test Python Environment
```bash
# Build Python image
docker build -t dockeride/python:latest ./docker-images/python/

# Run and test
docker run -it --rm \
  -p 8080:8080 \
  -e STUDENT_ID=test-student \
  -e ASSIGNMENT_ID=python-test \
  -e VSCODE_PASSWORD=test123 \
  -e GITHUB_REPO=https://github.com/microsoft/python-sample-vscode-flask-tutorial \
  dockeride/python:latest

# Open browser to http://localhost:8080
# Password: test123
```

#### 3. Test JavaScript/Node.js Environment
```bash
# Build Node.js image
docker build -t dockeride/nodejs:latest ./docker-images/nodejs/

# Run and test
docker run -it --rm \
  -p 8081:8080 \
  -e STUDENT_ID=test-student \
  -e ASSIGNMENT_ID=js-test \
  -e VSCODE_PASSWORD=test123 \
  -e GITHUB_REPO=https://github.com/microsoft/vscode-extension-samples \
  dockeride/nodejs:latest

# Open browser to http://localhost:8081
# Password: test123
```

#### 4. Test C++ Environment
```bash
# Build C++ image
docker build -t dockeride/cpp:latest ./docker-images/cpp/

# Run and test
docker run -it --rm \
  -p 8082:8080 \
  -e STUDENT_ID=test-student \
  -e ASSIGNMENT_ID=cpp-test \
  -e VSCODE_PASSWORD=test123 \
  dockeride/cpp:latest

# Open browser to http://localhost:8082
# Password: test123
```

#### 5. Test Java Environment
```bash
# Build Java image
docker build -t dockeride/java:latest ./docker-images/java/

# Run and test
docker run -it --rm \
  -p 8083:8080 \
  -e STUDENT_ID=test-student \
  -e ASSIGNMENT_ID=java-test \
  -e VSCODE_PASSWORD=test123 \
  dockeride/java:latest

# Open browser to http://localhost:8083
# Password: test123
```

#### 6. Test Database Environment (SQL + MongoDB)
```bash
# Build SQL/Database image
docker build -t dockeride/sql:latest ./docker-images/sql/

# Run and test (needs more resources)
docker run -it --rm \
  -p 8084:8080 \
  -e STUDENT_ID=test-student \
  -e ASSIGNMENT_ID=db-test \
  -e VSCODE_PASSWORD=test123 \
  dockeride/sql:latest

# Open browser to http://localhost:8084
# Password: test123

# In VS Code terminal, verify databases:
# psql -U student student
# mongosh studentdb
# sqlite3 ~/databases/sqlite/sample.db
```

### Option 2: Test Full System with Docker Compose

#### 1. Create Local Environment File
```bash
cd /Users/frazier/Documents/Projects/DockerIDE

# Copy example environment
cp .env.example .env

# Edit .env and set:
# NODE_ENV=development
# GITHUB_TOKEN=your_github_token_if_needed
```

#### 2. Build All Images
```bash
# Build all language images
docker build -t dockeride/base:latest ./docker-images/base/
docker build -t dockeride/python:latest ./docker-images/python/
docker build -t dockeride/nodejs:latest ./docker-images/nodejs/
docker build -t dockeride/cpp:latest ./docker-images/cpp/
docker build -t dockeride/java:latest ./docker-images/java/
docker build -t dockeride/sql:latest ./docker-images/sql/

# Build service images
docker build -t dockeride/lti-service:latest ./lti-service/
docker build -t dockeride/workspace-manager:latest ./workspace-manager/
docker build -t dockeride/api-gateway:latest ./api-gateway/
```

#### 3. Start Services
```bash
# Start all services
docker-compose -f docker-compose.dev.yaml up -d

# Check status
docker-compose -f docker-compose.dev.yaml ps

# View logs
docker-compose -f docker-compose.dev.yaml logs -f
```

#### 4. Test LTI Service
```bash
# Check LTI service health
curl http://localhost:3000/health

# Check workspace manager health
curl http://localhost:4000/health

# Check API gateway health
curl http://localhost/health
```

#### 5. Launch a Test Workspace
```bash
# Create a workspace via workspace manager API
curl -X POST http://localhost:4000/workspace/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-internal-api-key" \
  -d '{
    "sessionId": "test-session-123",
    "user": {
      "id": "student-1",
      "name": "Test Student",
      "email": "test@example.com"
    },
    "context": {
      "courseId": "CS101",
      "assignmentId": "assignment-1",
      "language": "python",
      "githubRepo": "https://github.com/microsoft/python-sample-vscode-flask-tutorial"
    },
    "token": "test-token"
  }'

# Response will include workspaceUrl and password
```

## Testing Database Environment

### 1. Start Database Container
```bash
docker run -d \
  --name test-db-env \
  -p 8085:8080 \
  -p 5432:5432 \
  -p 27017:27017 \
  -e STUDENT_ID=test-student \
  -e VSCODE_PASSWORD=test123 \
  dockeride/sql:latest
```

### 2. Access VS Code
Open browser to http://localhost:8085 (password: test123)

### 3. Test PostgreSQL
In VS Code terminal:
```bash
# Check if PostgreSQL is running
ps aux | grep postgres

# Connect to PostgreSQL
psql -U student student

# Run sample query
SELECT * FROM students WHERE grade > 85;

# Exit
\q
```

### 4. Test MongoDB
In VS Code terminal:
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Connect to MongoDB
mongosh studentdb

# Run sample query
db.students.find({ grade: { $gt: 85 } }).pretty()

# Exit
exit
```

### 5. Test SQLite
In VS Code terminal:
```bash
# Connect to SQLite
sqlite3 ~/databases/sqlite/sample.db

# Run sample query
SELECT * FROM students;

# Exit
.quit
```

### 6. Test VS Code Database Extensions

**SQLTools**:
1. Click Database icon in left sidebar
2. See "Local PostgreSQL" and "Sample SQLite DB" connections
3. Click to connect
4. Browse tables and run queries

**MongoDB Extension**:
1. Click MongoDB icon in left sidebar
2. Add connection: `mongodb://localhost:27017`
3. Explore `studentdb` database

### 7. Cleanup
```bash
docker stop test-db-env
docker rm test-db-env
```

## Testing LTI Integration (Mock)

### Create Mock LTI 1.1 Launch

#### 1. Create Test Script
```bash
cat > test-lti-launch.sh << 'EOF'
#!/bin/bash

# LTI 1.1 Mock Launch
curl -X POST http://localhost:3000/lti/launch \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "lti_message_type=basic-lti-launch-request" \
  -d "lti_version=LTI-1p0" \
  -d "resource_link_id=test-assignment-123" \
  -d "resource_link_title=Test Assignment" \
  -d "user_id=student-1" \
  -d "lis_person_name_full=Test Student" \
  -d "lis_person_contact_email_primary=test@example.com" \
  -d "roles=Learner" \
  -d "context_id=CS101" \
  -d "context_title=Computer Science 101" \
  -d "custom_language=python" \
  -d "custom_github_repo=https://github.com/test/repo" \
  -d "oauth_consumer_key=dockeride-key" \
  -d "oauth_signature_method=HMAC-SHA1" \
  -d "oauth_timestamp=$(date +%s)" \
  -d "oauth_nonce=$(openssl rand -hex 16)" \
  -d "oauth_version=1.0" \
  -d "oauth_signature=dummy"

EOF

chmod +x test-lti-launch.sh
```

#### 2. Run Test
```bash
./test-lti-launch.sh
```

Note: This will fail signature validation in production but helps test the flow.

## OrbStack-Specific Features

### 1. Use OrbStack Kubernetes (Optional)
```bash
# Enable Kubernetes in OrbStack
orb settings kubernetes enable

# Deploy to local Kubernetes
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/deployments/

# Check deployments
kubectl get pods -n dockeride
kubectl get services -n dockeride
```

### 2. Access Containers via OrbStack UI
- Open OrbStack app
- View running containers
- Access container logs
- Open terminal in containers

### 3. Monitor Resources
```bash
# OrbStack resource usage
orb stats

# Container resource usage
docker stats
```

### 4. Network Access
OrbStack automatically makes containers accessible via:
- `http://localhost:PORT` for exposed ports
- Container names as hostnames (e.g., `mysql`, `redis`)

## Troubleshooting

### Issue: Ports Already in Use
```bash
# Find what's using the port
lsof -i :8080

# Or use different ports
docker run -p 8090:8080 ...
```

### Issue: Build Fails
```bash
# Clear Docker cache
docker builder prune -af

# Rebuild with no cache
docker build --no-cache -t dockeride/python:latest ./docker-images/python/
```

### Issue: Container Won't Start
```bash
# Check logs
docker logs <container-id>

# Run in foreground to see errors
docker run -it dockeride/python:latest
```

### Issue: Database Won't Start
```bash
# Give more memory to container
docker run -m 4g -p 8080:8080 dockeride/sql:latest

# Check startup logs
docker logs <container-id> | grep -i error
```

### Issue: VS Code Extensions Won't Install
```bash
# Run container with internet access
docker run --network bridge ...

# Check extension installation logs in VS Code
# Terminal > Output > Extensions
```

## Testing Checklist

### Language Environments
- [ ] Python environment loads
- [ ] Python extensions install
- [ ] GitHub repo clones
- [ ] Python packages available (pip list)
- [ ] Jupyter works

- [ ] Node.js environment loads
- [ ] npm/yarn available
- [ ] JavaScript extensions install
- [ ] Can create React app

- [ ] C++ environment loads
- [ ] GCC/Clang available
- [ ] CMake works
- [ ] Can compile and debug

- [ ] Java environment loads
- [ ] Maven/Gradle available
- [ ] Can compile Java code

### Database Environment
- [ ] PostgreSQL starts automatically
- [ ] PostgreSQL has sample data
- [ ] Can query PostgreSQL from terminal
- [ ] Can query PostgreSQL from VS Code SQLTools

- [ ] MongoDB starts automatically
- [ ] MongoDB has sample data
- [ ] Can query MongoDB from terminal
- [ ] Can query MongoDB from VS Code extension

- [ ] SQLite database exists
- [ ] SQLite has sample data
- [ ] Can query from terminal
- [ ] Can query from VS Code SQLTools

### LTI Integration
- [ ] LTI service responds to health check
- [ ] Can create workspace via API
- [ ] Workspace URL is accessible
- [ ] Password authentication works

## Quick Test Commands

### Test All Language Images
```bash
# Build all
for img in base python nodejs cpp java sql; do
  docker build -t dockeride/$img:latest ./docker-images/$img/
done

# Test all (on different ports)
docker run -d -p 8080:8080 -e VSCODE_PASSWORD=test123 dockeride/python:latest
docker run -d -p 8081:8080 -e VSCODE_PASSWORD=test123 dockeride/nodejs:latest
docker run -d -p 8082:8080 -e VSCODE_PASSWORD=test123 dockeride/cpp:latest
docker run -d -p 8083:8080 -e VSCODE_PASSWORD=test123 dockeride/java:latest
docker run -d -p 8084:8080 -e VSCODE_PASSWORD=test123 dockeride/sql:latest

# Open browsers to test
open http://localhost:8080  # Python
open http://localhost:8081  # Node.js
open http://localhost:8082  # C++
open http://localhost:8083  # Java
open http://localhost:8084  # Database
```

### Cleanup All Test Containers
```bash
# Stop all DockerIDE containers
docker ps -a | grep dockeride | awk '{print $1}' | xargs docker stop
docker ps -a | grep dockeride | awk '{print $1}' | xargs docker rm

# Or use docker-compose
docker-compose -f docker-compose.dev.yaml down -v
```

## Performance Tips for OrbStack

### 1. Increase Resources
```bash
# In OrbStack settings, increase:
# - CPUs: 4+
# - Memory: 8GB+
# - Disk: 50GB+
```

### 2. Use BuildKit
```bash
# Enable BuildKit for faster builds
export DOCKER_BUILDKIT=1
docker build ...
```

### 3. Use Layer Caching
```bash
# Build incrementally
docker build -t dockeride/base:latest ./docker-images/base/
# Then build dependent images
```

### 4. Prune Regularly
```bash
# Clean up unused resources
docker system prune -af
docker volume prune -f
```

## Next Steps

After local testing:

1. **Verify Core Functionality**: Each language environment works
2. **Test Database Features**: All databases start and are queryable
3. **Test GitHub Integration**: Repositories clone correctly
4. **Test VS Code Extensions**: Extensions install and work
5. **Deploy to Production**: Use Kubernetes configs
6. **Configure LMS Integration**: Set up real LTI in Canvas/Moodle

## Support

For issues:
- Check container logs: `docker logs <container-id>`
- Check OrbStack logs: OrbStack app > Logs
- Verify network: `docker network ls`
- Check images: `docker images | grep dockeride`