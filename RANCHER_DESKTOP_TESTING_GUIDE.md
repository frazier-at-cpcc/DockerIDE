# Rancher Desktop Testing Guide for Windows

This guide helps you test DockerIDE locally using Rancher Desktop on Windows.

## Prerequisites

### 1. Install Rancher Desktop
Download and install from: https://rancherdesktop.io/

**Important Settings:**
- Open Rancher Desktop
- Go to **Preferences**
- **Container Engine**: Select **dockerd (moby)** (not containerd)
- **Kubernetes**: Can be disabled for testing (uncheck "Enable Kubernetes")
- **WSL Integration**: Enable integration with your WSL distros if you have WSL2

### 2. Verify Installation
Open PowerShell and verify Docker is working:
```powershell
docker --version
docker ps
```

## Quick Start

### 1. Open PowerShell as Administrator (Recommended)
Right-click PowerShell → "Run as Administrator"

Navigate to project:
```powershell
cd C:\Users\Frazier\Documents\Projects\DockerIDE
```

### 2. Enable Script Execution (First Time Only)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 3. Check Docker is Running
```powershell
.\test-local.ps1 check
```

### 4. Build All Images
```powershell
.\test-local.ps1 build
```

This will take 10-15 minutes on first run.

### 5. Test Individual Environments

#### Test Python (Recommended First)
```powershell
.\test-local.ps1 test-python
```
- Opens on: http://localhost:8080
- Password: `test123`

#### Test Database Environment
```powershell
.\test-local.ps1 test-database
```
- Opens on: http://localhost:8084
- Password: `test123`
- Includes: PostgreSQL, MongoDB, SQLite

#### Test JavaScript/Node.js
```powershell
.\test-local.ps1 test-nodejs
```
- Opens on: http://localhost:8081
- Password: `test123`

#### Test C++
```powershell
.\test-local.ps1 test-cpp
```
- Opens on: http://localhost:8082
- Password: `test123`

#### Test Java
```powershell
.\test-local.ps1 test-java
```
- Opens on: http://localhost:8083
- Password: `test123`

### 6. Test All Environments at Once
```powershell
.\test-local.ps1 test-all
```

### 7. Cleanup
```powershell
.\test-local.ps1 cleanup
```

## What to Test

### Python Environment (Port 8080)
1. ✅ Open http://localhost:8080 in browser
2. ✅ Enter password: `test123`
3. ✅ VS Code opens in browser
4. ✅ GitHub repo is cloned (Flask tutorial)
5. ✅ Open terminal (Ctrl+`) and run:
   ```bash
   python3 --version
   pip list | grep pandas
   jupyter --version
   ```
6. ✅ Create and run a Python file

### Database Environment (Port 8084) - IMPORTANT!
1. ✅ Open http://localhost:8084 in browser
2. ✅ Enter password: `test123`
3. ✅ Wait 10-15 seconds for databases to start
4. ✅ Open terminal and test PostgreSQL:
   ```bash
   psql -U student student
   SELECT * FROM students;
   \q
   ```
5. ✅ Test MongoDB:
   ```bash
   mongosh studentdb
   db.students.find().pretty()
   exit
   ```
6. ✅ Test SQLite:
   ```bash
   sqlite3 ~/databases/sqlite/sample.db
   SELECT * FROM students;
   .quit
   ```
7. ✅ Test VS Code SQLTools extension
8. ✅ Test MongoDB VS Code extension

### Node.js Environment (Port 8081)
1. ✅ VS Code opens in browser
2. ✅ GitHub repo cloned
3. ✅ Open terminal and run:
   ```bash
   node --version
   npm --version
   ```

### C++ Environment (Port 8082)
1. ✅ VS Code opens in browser
2. ✅ Open terminal and run:
   ```bash
   g++ --version
   cmake --version
   gdb --version
   ```

### Java Environment (Port 8083)
1. ✅ VS Code opens in browser
2. ✅ Open terminal and run:
   ```bash
   java --version
   mvn --version
   gradle --version
   ```

## Troubleshooting

### "execution of scripts is disabled on this system"
Run PowerShell as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "docker: command not found" or "Docker not found"
1. Ensure Rancher Desktop is running (check system tray)
2. Open Rancher Desktop → Preferences → WSL
3. Enable WSL integration if using WSL2
4. Restart PowerShell/Terminal
5. Try: `& 'C:\Program Files\Rancher Desktop\resources\resources\win32\bin\docker.exe' ps`

### Container won't start
```powershell
# Check logs
docker logs <container-id>

# Rebuild without cache
docker build --no-cache -t dockeride/base:latest .\docker-images\base\
.\test-local.ps1 build
```

### Port already in use
```powershell
# Find what's using the port (PowerShell)
Get-NetTCPConnection -LocalPort 8080 | Select-Object -Property OwningProcess
Get-Process -Id <process-id>

# Or use cleanup first
.\test-local.ps1 cleanup
```

### Can't access VS Code in browser
1. Check container is running:
   ```powershell
   docker ps
   ```
2. Check correct port:
   - Python: 8080
   - Node.js: 8081
   - C++: 8082
   - Java: 8083
   - Database: 8084
3. Try: `http://localhost:8080` (not 127.0.0.1)
4. Check Windows Firewall isn't blocking

### Database won't connect
```bash
# Wait longer (databases take 10-15 seconds)
# Check startup completed
docker exec <container-id> cat /tmp/databases-started
```

### Rancher Desktop specific issues

**Container Engine not dockerd:**
- Rancher Desktop → Preferences → Container Engine
- Select "dockerd (moby)"
- Restart Rancher Desktop

**WSL2 integration issues:**
- Ensure WSL2 is installed: `wsl --list --verbose`
- Rancher Desktop → Preferences → WSL
- Enable integration with your distro
- Restart Rancher Desktop

**Performance is slow:**
- Rancher Desktop → Preferences → Resources
- Increase Memory to at least 8GB
- Increase CPUs to at least 4

## Alternative: Using WSL2

If you have WSL2 installed, you can use the bash script instead:

```bash
# In WSL2 terminal
cd /mnt/c/Users/Frazier/Documents/Projects/DockerIDE
chmod +x test-local.sh
./test-local.sh check
./test-local.sh build
./test-local.sh test-python
```

## Advanced Testing

### Build Single Image
```powershell
.\test-local.ps1 build-image python
```

### Test with Custom GitHub Repo
```powershell
docker run -d `
  -p 8080:8080 `
  -e STUDENT_ID=test-student `
  -e VSCODE_PASSWORD=test123 `
  -e GITHUB_REPO=https://github.com/your-org/your-repo `
  dockeride/python:latest
```

### View Container Logs
```powershell
# List running containers
docker ps

# View logs
docker logs <container-id>

# Follow logs
docker logs -f <container-id>
```

### Access Container Shell
```powershell
docker exec -it <container-id> bash
```

### Check Images
```powershell
# List all DockerIDE images
docker images | Select-String "dockeride"

# Remove old images
docker rmi dockeride/python:latest
```

## Complete Testing Workflow

```powershell
# 1. Start fresh
.\test-local.ps1 cleanup

# 2. Build all images (takes 10-15 minutes first time)
.\test-local.ps1 build

# 3. Test Python (recommended first test)
.\test-local.ps1 test-python
# Open http://localhost:8080, password: test123
# Verify GitHub repo cloned, extensions work, Python runs

# 4. Test Database (most complex)
.\test-local.ps1 cleanup  # Stop Python first
.\test-local.ps1 test-database
# Open http://localhost:8084, password: test123
# Wait 15 seconds, test all 3 databases

# 5. Test others as needed
.\test-local.ps1 cleanup
.\test-local.ps1 test-nodejs
# etc.

# 6. Clean up when done
.\test-local.ps1 cleanup
```

## Success Criteria

Your testing is successful if:

1. ✅ All images build without errors
2. ✅ Containers start and stay running
3. ✅ VS Code Server accessible on all ports
4. ✅ GitHub repos clone automatically
5. ✅ All databases start with sample data
6. ✅ VS Code extensions installed
7. ✅ All language runtimes available
8. ✅ Database queries work

## Next Steps After Testing

1. ✅ **Verify all works locally**
2. **Configure for production** - Set up on cloud provider
3. **Test with real LMS** - Configure LTI in Canvas/Moodle
4. **Deploy to staging** - Use Kubernetes configs
5. **Scale test** - Test with multiple simultaneous users

## Common Commands Reference

```powershell
# Check everything is working
.\test-local.ps1 check

# Build everything
.\test-local.ps1 build

# Build one image
.\test-local.ps1 build-image python

# Test environments
.\test-local.ps1 test-python
.\test-local.ps1 test-database
.\test-local.ps1 test-all

# Clean up
.\test-local.ps1 cleanup

# Docker commands
docker ps                    # List running containers
docker ps -a                 # List all containers
docker images                # List images
docker logs <container-id>   # View logs
docker stop <container-id>   # Stop container
docker rm <container-id>     # Remove container
docker system prune -af      # Remove all unused containers/images
```

## Need Help?

- Check [TESTING_README.md](TESTING_README.md) for detailed test instructions
- Check [README.md](README.md) for project overview
- Open an issue on GitHub

## Differences from OrbStack/macOS

- Uses PowerShell instead of Bash
- Different path separators (`\` vs `/`)
- Different temp directory (`$env:TEMP` vs `/tmp`)
- May need to run PowerShell as Administrator
- Docker socket path handled automatically by Rancher Desktop
- Network host access uses `localhost` (same as OrbStack)
