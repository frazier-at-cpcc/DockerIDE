# SQL and NoSQL development environment
ARG BASE_IMAGE=dockeride/base:latest
FROM ${BASE_IMAGE}

USER root

# Install database clients and tools
RUN apt-get update && apt-get install -y \
    mysql-client \
    postgresql-client \
    sqlite3 \
    gnupg \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install MongoDB
RUN wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add - && \
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list && \
    apt-get update && \
    apt-get install -y mongodb-org && \
    rm -rf /var/lib/apt/lists/*

# Install database servers for local development
RUN apt-get update && apt-get install -y \
    mysql-server \
    postgresql \
    && rm -rf /var/lib/apt/lists/*

# Install Python database libraries (SQL and NoSQL)
RUN pip3 install --no-cache-dir \
    pymysql \
    psycopg2-binary \
    sqlalchemy \
    pandas \
    ipython-sql \
    mysql-connector-python \
    pyodbc \
    pymongo \
    motor

# Install DBeaver SQL IDE (headless mode for scripting)
RUN wget -O /tmp/dbeaver.deb https://dbeaver.io/files/dbeaver-ce_latest_amd64.deb && \
    apt-get update && \
    apt-get install -y /tmp/dbeaver.deb && \
    rm /tmp/dbeaver.deb && \
    rm -rf /var/lib/apt/lists/*

# Install sqlfluff (SQL linter)
RUN pip3 install --no-cache-dir sqlfluff

# Install VS Code SQL and MongoDB extensions
ENV VSCODE_EXTENSIONS="mtxr.sqltools,mtxr.sqltools-driver-mysql,mtxr.sqltools-driver-pg,mtxr.sqltools-driver-sqlite,mongodb.mongodb-vscode,bradymholt.pgformatter"

# Create database directories
RUN mkdir -p /var/lib/mysql /var/lib/postgresql/data /home/student/databases /home/student/mongodb && \
    chown -R student:student /home/student/databases /home/student/mongodb

# Initialize PostgreSQL
RUN mkdir -p /home/student/postgres && \
    chown -R student:student /home/student/postgres

# Initialize SQLite sample database
RUN mkdir -p /home/student/databases/sqlite

# Initialize MongoDB data directory
RUN mkdir -p /home/student/mongodb/data /home/student/mongodb/logs && \
    chown -R student:student /home/student/mongodb

# Create MySQL configuration
RUN mkdir -p /home/student/.my.cnf.d && \
    echo '[client]\n\
host=localhost\n\
user=student\n\
password=student' > /home/student/.my.cnf && \
    chown -R student:student /home/student/.my.cnf.d /home/student/.my.cnf && \
    chmod 600 /home/student/.my.cnf

# Switch back to student user
USER student

# Initialize PostgreSQL for student
RUN initdb -D /home/student/postgres 2>/dev/null || true

# Create sample SQLite database with queryable data
RUN sqlite3 /home/student/databases/sqlite/sample.db "CREATE TABLE IF NOT EXISTS students (id INTEGER PRIMARY KEY, name TEXT, grade INTEGER, major TEXT);" && \
    sqlite3 /home/student/databases/sqlite/sample.db "INSERT INTO students (name, grade, major) VALUES \
    ('Alice Johnson', 90, 'Computer Science'), \
    ('Bob Smith', 85, 'Data Science'), \
    ('Charlie Brown', 92, 'Computer Science'), \
    ('Diana Prince', 88, 'Information Systems'), \
    ('Eve Adams', 95, 'Data Science');" && \
    sqlite3 /home/student/databases/sqlite/sample.db "CREATE TABLE IF NOT EXISTS courses (id INTEGER PRIMARY KEY, name TEXT, credits INTEGER);" && \
    sqlite3 /home/student/databases/sqlite/sample.db "INSERT INTO courses (name, credits) VALUES \
    ('Database Systems', 3), \
    ('Data Structures', 4), \
    ('Web Development', 3), \
    ('Machine Learning', 4);"

# Create startup script for databases
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
echo "Starting databases..."\n\
\n\
# Start PostgreSQL\n\
pg_ctl -D /home/student/postgres -l /home/student/postgres/logfile start 2>/dev/null || true\n\
sleep 2\n\
\n\
# Create student database and populate with sample data\n\
if ! psql -U student -lqt | cut -d \\| -f 1 | grep -qw student; then\n\
    createdb student\n\
    psql -U student -d student <<EOF\n\
CREATE TABLE IF NOT EXISTS students (\n\
    id SERIAL PRIMARY KEY,\n\
    name VARCHAR(100),\n\
    grade INTEGER,\n\
    major VARCHAR(100)\n\
);\n\
\n\
INSERT INTO students (name, grade, major) VALUES\n\
    ('"'Alice Johnson'"', 90, '"'Computer Science'"'),\n\
    ('"'Bob Smith'"', 85, '"'Data Science'"'),\n\
    ('"'Charlie Brown'"', 92, '"'Computer Science'"'),\n\
    ('"'Diana Prince'"', 88, '"'Information Systems'"'),\n\
    ('"'Eve Adams'"', 95, '"'Data Science'"');\n\
\n\
CREATE TABLE IF NOT EXISTS courses (\n\
    id SERIAL PRIMARY KEY,\n\
    name VARCHAR(100),\n\
    credits INTEGER\n\
);\n\
\n\
INSERT INTO courses (name, credits) VALUES\n\
    ('"'Database Systems'"', 3),\n\
    ('"'Data Structures'"', 4),\n\
    ('"'Web Development'"', 3),\n\
    ('"'Machine Learning'"', 4);\n\
EOF\n\
fi\n\
\n\
# Start MongoDB\n\
mongod --dbpath /home/student/mongodb/data --logpath /home/student/mongodb/logs/mongodb.log --fork --bind_ip 127.0.0.1 2>/dev/null || true\n\
sleep 2\n\
\n\
# Populate MongoDB with sample data\n\
mongosh --quiet --eval '"'"'\n\
use studentdb;\n\
if (db.students.countDocuments() === 0) {\n\
    db.students.insertMany([\n\
        { name: "Alice Johnson", grade: 90, major: "Computer Science", courses: ["Database Systems", "Data Structures"] },\n\
        { name: "Bob Smith", grade: 85, major: "Data Science", courses: ["Machine Learning", "Database Systems"] },\n\
        { name: "Charlie Brown", grade: 92, major: "Computer Science", courses: ["Data Structures", "Web Development"] },\n\
        { name: "Diana Prince", grade: 88, major: "Information Systems", courses: ["Database Systems", "Web Development"] },\n\
        { name: "Eve Adams", grade: 95, major: "Data Science", courses: ["Machine Learning", "Data Structures"] }\n\
    ]);\n\
    print("Sample data loaded into MongoDB");\n\
} else {\n\
    print("MongoDB already has data");\n\
}\n\
'"'"' 2>/dev/null || true\n\
\n\
echo ""\n\
echo "✓ Databases started successfully!"\n\
echo "  PostgreSQL: psql -U student student"\n\
echo "  MongoDB: mongosh studentdb"\n\
echo "  SQLite: sqlite3 ~/databases/sqlite/sample.db"\n\
' > /home/student/start-databases.sh && \
    chmod +x /home/student/start-databases.sh

# Create VS Code workspace settings for SQLTools
RUN mkdir -p /home/student/.vscode && \
    echo '{\n\
  "sqltools.connections": [\n\
    {\n\
      "previewLimit": 50,\n\
      "driver": "PostgreSQL",\n\
      "name": "Local PostgreSQL",\n\
      "database": "student",\n\
      "username": "student",\n\
      "server": "localhost",\n\
      "port": 5432\n\
    },\n\
    {\n\
      "previewLimit": 50,\n\
      "driver": "SQLite",\n\
      "name": "Sample SQLite DB",\n\
      "database": "/home/student/databases/sqlite/sample.db"\n\
    }\n\
  ]\n\
}' > /home/student/.vscode/settings.json && \
    chown -R student:student /home/student/.vscode

# Add database info to bashrc
RUN echo '\n\
# Database Information\n\
echo "╔════════════════════════════════════════════╗"\n\
echo "║     Database Development Environment      ║"\n\
echo "╚════════════════════════════════════════════╝"\n\
echo ""\n\
echo "Available Databases:"\n\
echo "  📊 PostgreSQL: psql -U student student"\n\
echo "  🍃 MongoDB:    mongosh studentdb"\n\
echo "  💾 SQLite:     sqlite3 ~/databases/sqlite/sample.db"\n\
echo ""\n\
echo "To start all databases: ~/start-databases.sh"\n\
echo ""\n\
# Auto-start databases\n\
if [ ! -f /tmp/databases-started ]; then\n\
    ~/start-databases.sh\n\
    touch /tmp/databases-started\n\
fi\n\
' >> /home/student/.bashrc

WORKDIR /workspace

# Inherit entrypoint from base image
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["code-server", "--bind-addr", "0.0.0.0:8080", "--auth", "password", "/workspace"]