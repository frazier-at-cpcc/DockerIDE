# DockerIDE Changelog

## Recent Updates

### LTI Support Enhancement
✅ **Added LTI 1.1 Support** (Backward Compatibility)
- System now supports both LTI 1.1 and LTI 1.3
- Automatic version detection based on launch parameters
- OAuth 1.0 signature validation for LTI 1.1
- Basic Outcomes service for grade passback (LTI 1.1)
- Configuration via environment variables:
  - `LTI_CONSUMER_KEY` - Consumer key for LTI 1.1
  - `LTI_CONSUMER_SECRET` - Shared secret for LTI 1.1

### Language Support Expansion

✅ **C++ Development Environment** (`dockeride/cpp:latest`)
- GCC, G++, Clang compilers
- CMake, Make, Ninja build systems
- GDB debugger
- Valgrind memory analysis
- Google Test/Mock frameworks
- Boost libraries
- vcpkg and Conan package managers
- VS Code C++ extensions pre-installed

✅ **SQL/NoSQL Database Environment** (`dockeride/sql:latest`)
- **SQL Databases**:
  - PostgreSQL 15 (auto-starts with sample data)
  - MySQL server and client
  - SQLite3 (pre-loaded sample database)
- **NoSQL Databases**:
  - MongoDB 7.0 (auto-starts with sample data)
- **Python Libraries**: PyMySQL, psycopg2, SQLAlchemy, pymongo, motor
- **VS Code Integration**:
  - SQLTools with drivers for PostgreSQL, MySQL, SQLite
  - MongoDB for VS Code extension
  - Pre-configured connections in workspace settings
- **Sample Data**: All databases include queryable student/course data
- **Auto-start**: All databases automatically start on container launch

### Language Code Mappings

New language parameter options:
- **JavaScript/TypeScript**: `javascript`, `js`, `typescript`, `ts`, `nodejs`
- **Python**: `python`
- **C/C++**: `c`, `cpp`, `c++`
- **Java**: `java`
- **SQL**: `sql`, `mysql`, `postgresql`, `postgres`, `sqlite`
- **MongoDB/NoSQL**: `mongodb`, `mongo`, `nosql`
- **General Database**: `database`
- **Base**: `base`

### Database Features

✅ **Pre-configured Sample Databases**
- **Students table/collection**: 5 sample records with name, grade, major
- **Courses table**: 4 sample courses with credits
- **PostgreSQL**: Database `student` with relational tables
- **MongoDB**: Database `studentdb` with document collection
- **SQLite**: File-based database at `~/databases/sqlite/sample.db`

✅ **VS Code Database Integration**
- SQLTools connections pre-configured for PostgreSQL and SQLite
- MongoDB extension support
- One-click query execution
- Visual database exploration
- Query result export (CSV, JSON)

✅ **Auto-start Script**
- `~/start-databases.sh` - Starts all databases
- Auto-populates sample data if missing
- Runs automatically on container startup
- Logs startup status and connection info

### Documentation Updates

✅ **New Documentation Files**
- `DATABASE_QUICKSTART.md` - Quick reference for database environment
- `LANGUAGES.md` - Comprehensive language support guide
- `LTI_SETUP_GUIDE.md` - Detailed LTI configuration for instructors
- `.env.example` - Environment variable configuration template

✅ **Updated Documentation**
- `README.md` - Updated with LTI 1.1/1.3 support and new languages
- Installation instructions for all language environments
- Database setup and usage instructions

## Supported Platforms

### LMS Compatibility

**LTI 1.1** (Legacy):
- Canvas (older versions)
- Blackboard Learn 9.x
- Moodle < 3.10
- Sakai
- Other legacy LMS platforms

**LTI 1.3** (Modern):
- Canvas (current)
- Blackboard Learn Ultra/SaaS
- Moodle 3.10+
- Brightspace (D2L)
- Schoology

## Language Environments

| Language | Image | Key Tools |
|----------|-------|-----------|
| JavaScript/TypeScript | `dockeride/nodejs:latest` | Node.js 20, npm, yarn, TypeScript, React, Vue, Angular |
| Python | `dockeride/python:latest` | Python 3, Jupyter, NumPy, Pandas, Flask, Django |
| C/C++ | `dockeride/cpp:latest` | GCC, Clang, CMake, GDB, Valgrind, Google Test |
| Java | `dockeride/java:latest` | OpenJDK 17, Maven, Gradle, Spring Boot |
| SQL/NoSQL | `dockeride/sql:latest` | PostgreSQL, MySQL, SQLite, MongoDB |
| Base | `dockeride/base:latest` | VS Code Server, Git, basic tools |

## Database Environment Details

### PostgreSQL
- Version: 15
- Port: 5432
- User: student
- Database: student
- Tables: students, courses
- Auto-starts on container launch

### MongoDB
- Version: 7.0
- Port: 27017
- Database: studentdb
- Collection: students
- Auto-starts on container launch

### SQLite
- Version: 3
- Location: `~/databases/sqlite/sample.db`
- Tables: students, courses
- File-based, always available

## Configuration Examples

### LTI 1.1 Custom Parameters
```
custom_language=python
custom_github_repo=https://github.com/course/assignment
custom_vscode_extensions=ms-python.python
```

### LTI 1.3 Custom Parameters
```
language=sql
assignment_id=$Canvas.assignment.id
github_repo=https://github.com/course/database-assignment
vscode_extensions=mtxr.sqltools,mongodb.mongodb-vscode
```

### Database Assignment Example
```
language=mongodb
github_repo=https://github.com/course/nosql-assignment
vscode_extensions=mongodb.mongodb-vscode
```

## Environment Variables

### New Variables
- `LTI_CONSUMER_KEY` - LTI 1.1 consumer key
- `LTI_CONSUMER_SECRET` - LTI 1.1 shared secret

### Database Variables (Per Container)
- `STUDENT_ID` - Student identifier
- `COURSE_ID` - Course identifier
- `ASSIGNMENT_ID` - Assignment identifier
- `GITHUB_REPO` - Repository to clone
- `VSCODE_EXTENSIONS` - Extensions to install
- `VSCODE_PASSWORD` - Auto-generated access password

## Breaking Changes

None. All changes are backward compatible.

## Migration Guide

### From LTI 1.3 Only to LTI 1.1/1.3
1. Set environment variables `LTI_CONSUMER_KEY` and `LTI_CONSUMER_SECRET`
2. Configure LMS with these credentials
3. System auto-detects LTI version from launch parameters

### Adding New Languages
1. Build the new language Docker image
2. Update `getDockerImage()` function in workspace manager
3. Update documentation

## Known Issues

None at this time.

## Upcoming Features

- [ ] R language environment
- [ ] Go language environment
- [ ] Redis support in database image
- [ ] Custom resource limits per language
- [ ] Assignment templates library
- [ ] Student progress tracking
- [ ] Code execution time limits
- [ ] Automated testing integration

## Support

For issues and questions:
- Check documentation in repository
- Contact your DockerIDE administrator
- Submit issues on GitHub

## Credits

Built with:
- VS Code Server (code-server)
- Docker/Kubernetes
- LTI Libraries (ltijs, oauth)
- PostgreSQL, MongoDB, SQLite
- Node.js, Python, Java, C++ toolchains