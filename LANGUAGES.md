# DockerIDE Language Support

This document provides details on all supported programming languages and their development environments.

## Supported Languages for System

### JavaScript / TypeScript

**Language codes**: `javascript`, `js`, `typescript`, `ts`, `nodejs`

**Image**: `dockeride/nodejs:latest`

**Included Tools**:
- Node.js 20.x
- npm, yarn, pnpm
- TypeScript, ts-node
- Express, React, Angular, Vue CLI
- Vite, Webpack
- ESLint, Prettier
- Jest (testing framework)

**VS Code Extensions**:
- ESLint
- Prettier
- TypeScript support
- npm IntelliSense
- Auto Rename Tag
- Auto Close Tag

**Example LTI Parameters**:
```
custom_language=javascript
custom_github_repo=https://github.com/username/js-assignment
custom_vscode_extensions=dbaeumer.vscode-eslint,esbenp.prettier-vscode
```

---

### Python

**Language codes**: `python`

**Image**: `dockeride/python:latest`

**Included Tools**:
- Python 3.x
- pip, virtualenv
- NumPy, Pandas, Matplotlib, SciPy, scikit-learn
- Jupyter Notebook, IPython
- Flask, Django
- pytest, black, flake8, pylint

**VS Code Extensions**:
- Python
- Pylance
- Python Debugger
- Jupyter
- Jupyter Keymap

**Example LTI Parameters**:
```
custom_language=python
custom_github_repo=https://github.com/username/python-assignment
custom_vscode_extensions=ms-python.python,ms-python.vscode-pylance
```

---

### C / C++

**Language codes**: `c`, `cpp`, `c++`

**Image**: `dockeride/cpp:latest`

**Included Tools**:
- GCC, G++, Clang
- GDB (debugger)
- CMake, Make, Ninja
- Valgrind (memory analysis)
- cppcheck (static analysis)
- Google Test, Google Mock
- Boost libraries
- vcpkg, Conan (package managers)

**VS Code Extensions**:
- C/C++ Extension Pack
- CMake Tools
- Better C++ Syntax

**Example LTI Parameters**:
```
custom_language=cpp
custom_github_repo=https://github.com/username/cpp-assignment
custom_vscode_extensions=ms-vscode.cpptools,ms-vscode.cmake-tools
```

---

### Java

**Language codes**: `java`

**Image**: `dockeride/java:latest`

**Included Tools**:
- OpenJDK 17
- Maven, Gradle, Ant
- Spring Boot CLI
- JUnit (built-in)

**VS Code Extensions**:
- Java Extension Pack
- Java Debugger
- Maven for Java
- Java Dependency Viewer

**Example LTI Parameters**:
```
custom_language=java
custom_github_repo=https://github.com/username/java-assignment
custom_vscode_extensions=redhat.java,vscjava.vscode-java-debug
```

---

### SQL & NoSQL (Databases)

**Language codes**: `sql`, `mysql`, `postgresql`, `postgres`, `sqlite`, `mongodb`, `mongo`, `nosql`, `database`

**Image**: `dockeride/sql:latest`

**Included Tools**:
- **SQL Databases**:
  - MySQL client and server
  - PostgreSQL client and server (auto-starts with sample data)
  - SQLite3 (pre-loaded sample database)
- **NoSQL Databases**:
  - MongoDB 7.0 server (auto-starts with sample data)
- **Python Libraries**: PyMySQL, psycopg2, SQLAlchemy, pymongo, motor
- **Development Tools**: sqlfluff (SQL linter), DBeaver (SQL IDE)

**VS Code Extensions**:
- SQLTools (with drivers for MySQL, PostgreSQL, SQLite)
- MongoDB for VS Code
- PostgreSQL formatter

**Pre-configured Databases**:

All databases auto-start when the container launches!

1. **PostgreSQL** (local, port 5432):
   ```bash
   psql -U student student
   ```
   - Database: `student`
   - Tables: `students`, `courses` (with sample data)
   - Pre-configured in VS Code SQLTools

2. **MongoDB** (local, port 27017):
   ```bash
   mongosh studentdb
   ```
   - Database: `studentdb`
   - Collection: `students` (with sample data)
   - Accessible via MongoDB VS Code extension

3. **SQLite** (file-based):
   ```bash
   sqlite3 ~/databases/sqlite/sample.db
   ```
   - Tables: `students`, `courses` (with sample data)
   - Pre-configured in VS Code SQLTools

**Sample Data**:

All databases include the same sample dataset:

**Students Table/Collection**:
| ID | Name | Grade | Major |
|----|------|-------|-------|
| 1 | Alice Johnson | 90 | Computer Science |
| 2 | Bob Smith | 85 | Data Science |
| 3 | Charlie Brown | 92 | Computer Science |
| 4 | Diana Prince | 88 | Information Systems |
| 5 | Eve Adams | 95 | Data Science |

**Courses Table**:
| ID | Name | Credits |
|----|------|---------|
| 1 | Database Systems | 3 |
| 2 | Data Structures | 4 |
| 3 | Web Development | 3 |
| 4 | Machine Learning | 4 |

**Quick Start Queries**:

PostgreSQL:
```sql
-- In VS Code terminal or SQLTools
SELECT * FROM students WHERE grade > 85;
SELECT major, AVG(grade) as avg_grade FROM students GROUP BY major;
```

MongoDB:
```javascript
// In mongosh or MongoDB extension
db.students.find({ grade: { $gt: 85 } })
db.students.aggregate([
  { $group: { _id: "$major", avgGrade: { $avg: "$grade" } } }
])
```

SQLite:
```sql
-- In VS Code terminal or SQLTools
SELECT * FROM students JOIN courses;
```

**Example LTI Parameters**:
```
custom_language=sql
custom_github_repo=https://github.com/username/database-assignment
custom_vscode_extensions=mtxr.sqltools,mongodb.mongodb-vscode
```

**For MongoDB-focused assignments**:
```
custom_language=mongodb
custom_github_repo=https://github.com/username/nosql-assignment
custom_vscode_extensions=mongodb.mongodb-vscode
```

---

## Base Environment

**Language code**: `base`

**Image**: `dockeride/base:latest`

**Included Tools**:
- VS Code Server
- Git
- Basic development tools (curl, wget, nano, vim)
- Node.js (for VS Code extensions)

**Use Cases**:
- Custom assignments
- Multi-language projects
- Assignments requiring manual setup

**Example LTI Parameters**:
```
custom_language=base
custom_github_repo=https://github.com/username/custom-assignment
```

---

## Environment Variables per Language

Each container receives these environment variables:

```bash
STUDENT_ID          # Student's unique identifier
STUDENT_NAME        # Student's full name
COURSE_ID           # Course identifier
ASSIGNMENT_ID       # Assignment identifier
GITHUB_REPO         # Repository URL to clone
GITHUB_TOKEN        # GitHub access token (if configured)
VSCODE_EXTENSIONS   # Comma-separated list of extensions
VSCODE_PASSWORD     # Auto-generated access password
SESSION_TOKEN       # JWT token for workspace access
```

---

## Adding Custom Extensions

You can specify additional VS Code extensions through LTI parameters:

### LTI 1.1
```
custom_vscode_extensions=publisher.extension1,publisher.extension2
```

### LTI 1.3
```
vscode_extensions=publisher.extension1,publisher.extension2
```

### Finding Extension IDs

1. Visit [VS Code Marketplace](https://marketplace.visualstudio.com/vscode)
2. Search for the extension
3. The ID is in the URL: `marketplace.visualstudio.com/items?itemName=PUBLISHER.EXTENSION`
4. Use format: `publisher.extension`

---

## Language-Specific Workflows

### JavaScript/TypeScript Project
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Python Project
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run script
python main.py

# Run tests
pytest
```

### C++ Project
```bash
# Configure with CMake
cmake -B build -G Ninja

# Build
cmake --build build

# Run tests
ctest --test-dir build

# Debug with GDB
gdb ./build/my_program
```

### Java Project (Maven)
```bash
# Compile
mvn compile

# Run tests
mvn test

# Package
mvn package

# Run
java -jar target/myapp.jar
```

### SQL/NoSQL Project
```bash
# Databases auto-start on container launch
# Or manually start: ~/start-databases.sh

# PostgreSQL
psql -U student student
psql -U student student < assignment.sql

# MongoDB
mongosh studentdb
mongosh studentdb < queries.js

# SQLite
sqlite3 ~/databases/sqlite/sample.db
sqlite3 ~/databases/sqlite/sample.db < queries.sql

# Using VS Code Extensions
# 1. SQLTools: Click database icon in sidebar, run queries
# 2. MongoDB: Connect to mongodb://localhost:27017
```

---

## Customizing Images

To create a custom image for a specific course:

1. Start with a base language image:
```dockerfile
FROM dockeride/python:latest

USER root

# Install additional tools
RUN pip install custom-package-1 custom-package-2

# Add custom configuration
COPY config.json /workspace/config.json

USER student
```

2. Build and push:
```bash
docker build -t dockeride/python-cs101:latest .
docker push dockeride/python-cs101:latest
```

3. Update workspace manager mapping:
```javascript
'python-cs101': 'dockeride/python-cs101:latest'
```

---

## Troubleshooting

### Extension Won't Install
- Check extension ID format: `publisher.extension-name`
- Verify extension exists in VS Code Marketplace
- Check container logs for installation errors

### Database Won't Start (SQL/NoSQL)
```bash
# Restart all databases
~/start-databases.sh

# Check PostgreSQL logs
cat ~/postgres/logfile

# Check MongoDB logs
cat ~/mongodb/logs/mongodb.log

# Manual starts
pg_ctl -D ~/postgres start
mongod --dbpath ~/mongodb/data --fork --logpath ~/mongodb/logs/mongodb.log
```

### Package Installation Fails
```bash
# Python: Clear cache
pip cache purge

# Node.js: Clear cache
npm cache clean --force

# C++: Update package lists
vcpkg update
```

---

## Best Practices

1. **Keep images updated**: Regularly rebuild images with latest package versions
2. **Pin versions**: For production, pin specific versions of tools and libraries
3. **Minimize image size**: Use multi-stage builds and clean up package caches
4. **Security**: Regularly scan images for vulnerabilities
5. **Documentation**: Document custom extensions and packages in assignment README