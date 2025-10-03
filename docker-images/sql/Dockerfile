# SQL and NoSQL development environment
FROM dockeride/base:latest

USER root

# Install database clients and tools
RUN apt-get update && apt-get install -y \
    mysql-client \
    postgresql-client \
    sqlite3 \
    mariadb-client \
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

# Install VS Code SQL extensions
ENV VSCODE_EXTENSIONS="mtxr.sqltools,mtxr.sqltools-driver-mysql,mtxr.sqltools-driver-pg,mtxr.sqltools-driver-sqlite,oracle.sql-developer,bradymholt.pgformatter"

# Create database directories
RUN mkdir -p /var/lib/mysql /var/lib/postgresql/data /home/student/databases && \
    chown -R student:student /home/student/databases

# Initialize PostgreSQL
RUN mkdir -p /home/student/postgres && \
    chown -R student:student /home/student/postgres

# Initialize SQLite sample database
RUN mkdir -p /home/student/databases/sqlite

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

# Create sample SQLite database
RUN sqlite3 /home/student/databases/sqlite/sample.db "CREATE TABLE IF NOT EXISTS students (id INTEGER PRIMARY KEY, name TEXT, grade INTEGER);" && \
    sqlite3 /home/student/databases/sqlite/sample.db "INSERT INTO students (name, grade) VALUES ('Alice', 90), ('Bob', 85), ('Charlie', 92);"

# Create startup script for databases
RUN echo '#!/bin/bash\n\
# Start PostgreSQL\n\
pg_ctl -D /home/student/postgres -l /home/student/postgres/logfile start 2>/dev/null || true\n\
# Wait for PostgreSQL to start\n\
sleep 2\n\
# Create student database if it does not exist\n\
createdb student 2>/dev/null || true\n\
echo "Databases ready!"\n\
' > /home/student/start-databases.sh && \
    chmod +x /home/student/start-databases.sh

# Add database info to bashrc
RUN echo '\n\
# Database Information\n\
echo "Available Databases:"\n\
echo "  - PostgreSQL: psql -U student student"\n\
echo "  - SQLite: sqlite3 ~/databases/sqlite/sample.db"\n\
echo "  - MySQL client: mysql (configure connection in assignment)"\n\
echo ""\n\
echo "To start local PostgreSQL: ~/start-databases.sh"\n\
' >> /home/student/.bashrc

WORKDIR /workspace