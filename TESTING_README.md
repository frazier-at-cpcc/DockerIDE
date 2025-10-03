# Quick Testing Guide

## Using the Automated Test Script

The easiest way to test DockerIDE locally with OrbStack:

### 1. Quick Start
```bash
# Make script executable (already done)
chmod +x test-local.sh

# Check OrbStack is working
./test-local.sh check

# Build all images
./test-local.sh build
```

### 2. Test Individual Environments

#### Test Python (Recommended First)
```bash
./test-local.sh test-python
# Opens on http://localhost:8080
# Password: test123
```

#### Test Database Environment
```bash
./test-local.sh test-database
# Opens on http://localhost:8084
# Password: test123
# Includes PostgreSQL, MongoDB, SQLite
```

#### Test JavaScript/Node.js
```bash
./test-local.sh test-nodejs
# Opens on http://localhost:8081
# Password: test123
```

#### Test C++
```bash
./test-local.sh test-cpp
# Opens on http://localhost:8082
# Password: test123
```

#### Test Java
```bash
./test-local.sh test-java
# Opens on http://localhost:8083
# Password: test123
```

### 3. Test All Environments at Once
```bash
./test-local.sh test-all
# Starts all environments on different ports
```

### 4. Cleanup
```bash
./test-local.sh cleanup
# Stops and removes all test containers
```

## What to Test

### Python Environment (Port 8080)
1. ✅ VS Code opens in browser
2. ✅ GitHub repo is cloned (Flask tutorial)
3. ✅ Python extensions are installed
4. ✅ Open terminal and run:
   ```bash
   python3 --version
   pip list | grep pandas
   jupyter --version
   ```
5. ✅ Create and run a Python file

### Database Environment (Port 8084) - IMPORTANT!
1. ✅ VS Code opens in browser
2. ✅ Wait 10-15 seconds for databases to start
3. ✅ Open terminal and test PostgreSQL:
   ```bash
   psql -U student student
   SELECT * FROM students;
   \q
   ```
4. ✅ Test MongoDB:
   ```bash
   mongosh studentdb
   db.students.find().pretty()
   exit
   ```
5. ✅ Test SQLite:
   ```bash
   sqlite3 ~/databases/sqlite/sample.db
   SELECT * FROM students;
   .quit
   ```
6. ✅ Test VS Code SQLTools:
   - Click Database icon in sidebar
   - Connect to "Local PostgreSQL"
   - Browse tables and run query
7. ✅ Test MongoDB VS Code Extension:
   - Click MongoDB icon in sidebar
   - Connect to `mongodb://localhost:27017`
   - Browse `studentdb` database

### Node.js Environment (Port 8081)
1. ✅ VS Code opens in browser
2. ✅ GitHub repo is cloned (VS Code samples)
3. ✅ JavaScript extensions are installed
4. ✅ Open terminal and run:
   ```bash
   node --version
   npm --version
   npx create-react-app --version
   ```

### C++ Environment (Port 8082)
1. ✅ VS Code opens in browser
2. ✅ C++ extensions are installed
3. ✅ Open terminal and run:
   ```bash
   g++ --version
   cmake --version
   gdb --version
   valgrind --version
   ```
4. ✅ Create a simple C++ file and compile

### Java Environment (Port 8083)
1. ✅ VS Code opens in browser
2. ✅ Java extensions are installed
3. ✅ Open terminal and run:
   ```bash
   java --version
   mvn --version
   gradle --version
   ```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs <container-id>

# Or rebuild without cache
./test-local.sh build
```

### Database won't connect
```bash
# Wait longer (databases take 10-15 seconds to start)
# Or check startup script ran
docker exec <container-id> cat /tmp/databases-started
```

### Port already in use
```bash
# Find what's using the port
lsof -i :8080

# Or use cleanup first
./test-local.sh cleanup
```

### Can't access VS Code
```bash
# Make sure container is running
docker ps

# Check you're using the right port
# Python: 8080, Node.js: 8081, C++: 8082, Java: 8083, DB: 8084
```

## Advanced Testing

### Test with Custom GitHub Repo
```bash
docker run -d \
  -p 8080:8080 \
  -e STUDENT_ID=test-student \
  -e VSCODE_PASSWORD=test123 \
  -e GITHUB_REPO=https://github.com/your-org/your-repo \
  dockeride/python:latest
```

### Test Full System with Services
```bash
./test-local.sh services-start
# Starts LTI service, workspace manager, API gateway

# Check status
docker-compose -f docker-compose.dev.yaml ps

# View logs
docker-compose -f docker-compose.dev.yaml logs -f

# Stop
./test-local.sh services-stop
```

### Test Database Queries

**PostgreSQL**:
```sql
-- In VS Code terminal: psql -U student student
SELECT name, grade, major FROM students WHERE grade > 85;
SELECT major, AVG(grade) as avg_grade FROM students GROUP BY major;
```

**MongoDB**:
```javascript
// In VS Code terminal: mongosh studentdb
db.students.find({ grade: { $gt: 85 } })
db.students.aggregate([
  { $group: { _id: "$major", avgGrade: { $avg: "$grade" } } }
])
```

**SQLite**:
```sql
-- In VS Code terminal: sqlite3 ~/databases/sqlite/sample.db
SELECT * FROM students ORDER BY grade DESC;
```

## Expected Results

✅ **All environments should**:
- Build without errors
- Start within 10 seconds (databases may take 15 seconds)
- Be accessible via browser
- Have VS Code Server running
- Have correct extensions installed
- Have terminal access with all tools available

✅ **Database environment specifically should**:
- Auto-start PostgreSQL, MongoDB, SQLite
- Have sample data in all databases
- Allow queries from terminal
- Allow queries from VS Code extensions
- Show connection info on terminal startup

## Quick Command Reference

```bash
# Build and test Python
./test-local.sh build-image python && ./test-local.sh test-python

# Build and test Database
./test-local.sh build-image sql && ./test-local.sh test-database

# Test everything
./test-local.sh build && ./test-local.sh test-all

# Clean up everything
./test-local.sh cleanup
docker system prune -af
```

## Success Criteria

Your testing is successful if:

1. ✅ All images build without errors
2. ✅ All containers start and stay running
3. ✅ VS Code Server is accessible on all ports
4. ✅ GitHub repos clone automatically (when specified)
5. ✅ All databases start and contain sample data
6. ✅ VS Code extensions are installed
7. ✅ All language runtimes/compilers are available
8. ✅ Database queries work from terminal and VS Code

## Next Steps After Testing

1. **Verify all works locally** ✓
2. **Test with real LMS** - Configure LTI in Canvas/Moodle
3. **Deploy to staging** - Use Kubernetes configs
4. **Scale test** - Test with multiple simultaneous users
5. **Production deployment** - Deploy to production cluster

## Need Help?

- Check [ORBSTACK_TESTING_GUIDE.md](ORBSTACK_TESTING_GUIDE.md) for detailed instructions
- Check [DATABASE_QUICKSTART.md](DATABASE_QUICKSTART.md) for database-specific help
- Check [LANGUAGES.md](LANGUAGES.md) for language-specific information
- Run `./test-local.sh help` for all available commands