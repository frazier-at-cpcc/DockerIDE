# DockerIDE Language Support

This document provides details on all supported programming languages and their development environments.

## Supported Languages

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

### SQL

**Language codes**: `sql`, `mysql`, `postgresql`, `postgres`, `sqlite`

**Image**: `dockeride/sql:latest`

**Included Tools**:
- MySQL client and server
- PostgreSQL client and server
- SQLite3
- Python database libraries (PyMySQL, psycopg2, SQLAlchemy)
- sqlfluff (SQL linter)
- DBeaver (SQL IDE)

**VS Code Extensions**:
- SQLTools
- MySQL driver
- PostgreSQL driver
- SQLite driver
- PostgreSQL formatter

**Pre-configured Databases**:
- PostgreSQL (local): `psql -U student student`
- SQLite sample DB: `~/databases/sqlite/sample.db`
- MySQL client ready for remote connections

**Example LTI Parameters**:
```
custom_language=sql
custom_github_repo=https://github.com/username/sql-assignment
custom_vscode_extensions=mtxr.sqltools,mtxr.sqltools-driver-pg
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

### SQL Project
```bash
# Start local PostgreSQL
~/start-databases.sh

# Connect to PostgreSQL
psql -U student student

# Run SQL file
psql -U student student < assignment.sql

# SQLite
sqlite3 ~/databases/sqlite/sample.db < queries.sql
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

### Database Won't Start (SQL)
```bash
# Check PostgreSQL status
~/start-databases.sh

# Check logs
cat ~/postgres/logfile
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