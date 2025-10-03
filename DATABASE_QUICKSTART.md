# Database Environment Quick Start

## 🚀 What's Included

Your database development environment comes with **three pre-configured databases**, all running locally with sample data ready to query!

- **PostgreSQL 15** (Relational SQL)
- **MongoDB 7.0** (NoSQL Document)
- **SQLite 3** (File-based SQL)

All databases **auto-start** when you open your workspace!

---

## 📊 Sample Data

All databases contain the same sample dataset for practice:

### Students
| ID | Name | Grade | Major |
|----|------|-------|-------|
| 1 | Alice Johnson | 90 | Computer Science |
| 2 | Bob Smith | 85 | Data Science |
| 3 | Charlie Brown | 92 | Computer Science |
| 4 | Diana Prince | 88 | Information Systems |
| 5 | Eve Adams | 95 | Data Science |

### Courses
| ID | Name | Credits |
|----|------|---------|
| 1 | Database Systems | 3 |
| 2 | Data Structures | 4 |
| 3 | Web Development | 3 |
| 4 | Machine Learning | 4 |

---

## 💻 Quick Commands

### PostgreSQL
```bash
# Connect to database
psql -U student student

# Run a query from terminal
psql -U student student -c "SELECT * FROM students WHERE grade > 85;"

# Execute SQL file
psql -U student student < myquery.sql

# Use in Python
python3 <<EOF
import psycopg2
conn = psycopg2.connect("dbname=student user=student host=localhost")
cur = conn.cursor()
cur.execute("SELECT * FROM students")
print(cur.fetchall())
EOF
```

### MongoDB
```bash
# Connect to database
mongosh studentdb

# Run a query from terminal
mongosh studentdb --eval 'db.students.find({ grade: { $gt: 85 } }).pretty()'

# Execute JavaScript file
mongosh studentdb < myquery.js

# Use in Python
python3 <<EOF
from pymongo import MongoClient
client = MongoClient('localhost', 27017)
db = client.studentdb
print(list(db.students.find({ "grade": { "$gt": 85 } })))
EOF
```

### SQLite
```bash
# Connect to database
sqlite3 ~/databases/sqlite/sample.db

# Run a query from terminal
sqlite3 ~/databases/sqlite/sample.db "SELECT * FROM students WHERE grade > 85;"

# Execute SQL file
sqlite3 ~/databases/sqlite/sample.db < myquery.sql

# Use in Python
python3 <<EOF
import sqlite3
conn = sqlite3.connect('/home/student/databases/sqlite/sample.db')
cur = conn.cursor()
cur.execute("SELECT * FROM students WHERE grade > 85")
print(cur.fetchall())
EOF
```

---

## 🔧 VS Code Integration

### SQLTools Extension (Pre-configured)

1. Click the **Database** icon in the left sidebar
2. You'll see two pre-configured connections:
   - **Local PostgreSQL** → `student` database
   - **Sample SQLite DB** → Sample database file
3. Click a connection to connect
4. Right-click tables to run queries
5. Or create a new SQL file and run queries directly

### MongoDB Extension

1. Click the **MongoDB** icon in the left sidebar
2. Click **"Add Connection"**
3. Use connection string: `mongodb://localhost:27017`
4. Connect and explore the `studentdb` database

---

## 📝 Sample Queries

### SQL Queries (PostgreSQL/SQLite)

```sql
-- Basic SELECT
SELECT * FROM students;

-- Filtering
SELECT name, grade FROM students WHERE grade > 85;

-- Aggregation
SELECT major, AVG(grade) as avg_grade
FROM students
GROUP BY major
ORDER BY avg_grade DESC;

-- Join (if you have enrollment data)
SELECT s.name, c.name as course, c.credits
FROM students s
JOIN enrollments e ON s.id = e.student_id
JOIN courses c ON c.id = e.course_id;

-- Sorting
SELECT * FROM students ORDER BY grade DESC LIMIT 3;
```

### MongoDB Queries (JavaScript)

```javascript
// Basic find
db.students.find()

// Filtering
db.students.find({ grade: { $gt: 85 } })

// Projection (select specific fields)
db.students.find({}, { name: 1, grade: 1, _id: 0 })

// Aggregation
db.students.aggregate([
  { $group: {
      _id: "$major",
      avgGrade: { $avg: "$grade" },
      count: { $sum: 1 }
  }},
  { $sort: { avgGrade: -1 } }
])

// Update
db.students.updateOne(
  { name: "Alice Johnson" },
  { $set: { grade: 95 } }
)

// Insert
db.students.insertOne({
  name: "Frank Miller",
  grade: 87,
  major: "Computer Science",
  courses: ["Database Systems", "Web Development"]
})
```

---

## 🐍 Python Examples

### Working with PostgreSQL
```python
import psycopg2
import pandas as pd

# Connect
conn = psycopg2.connect(
    dbname="student",
    user="student",
    host="localhost",
    port=5432
)

# Query with pandas
df = pd.read_sql_query("SELECT * FROM students WHERE grade > 85", conn)
print(df)

# Execute query
cur = conn.cursor()
cur.execute("INSERT INTO students (name, grade, major) VALUES (%s, %s, %s)",
            ("New Student", 88, "Data Science"))
conn.commit()
cur.close()
conn.close()
```

### Working with MongoDB
```python
from pymongo import MongoClient
import pandas as pd

# Connect
client = MongoClient('localhost', 27017)
db = client.studentdb

# Query
students = list(db.students.find({ "grade": { "$gt": 85 } }))
print(students)

# Convert to DataFrame
df = pd.DataFrame(list(db.students.find()))
print(df)

# Insert
db.students.insert_one({
    "name": "New Student",
    "grade": 88,
    "major": "Data Science",
    "courses": ["Database Systems"]
})

# Aggregate
pipeline = [
    { "$group": {
        "_id": "$major",
        "avg_grade": { "$avg": "$grade" }
    }}
]
results = list(db.students.aggregate(pipeline))
print(results)
```

### Working with SQLite
```python
import sqlite3
import pandas as pd

# Connect
conn = sqlite3.connect('/home/student/databases/sqlite/sample.db')

# Query with pandas
df = pd.read_sql_query("SELECT * FROM students WHERE grade > 85", conn)
print(df)

# Execute query
cur = conn.cursor()
cur.execute("SELECT major, AVG(grade) FROM students GROUP BY major")
print(cur.fetchall())

conn.close()
```

---

## 🔄 Database Management

### Restart Databases
```bash
~/start-databases.sh
```

### Check Database Status
```bash
# PostgreSQL
pg_ctl -D ~/postgres status

# MongoDB
mongosh --eval "db.serverStatus()" --quiet

# SQLite (always available, file-based)
ls -lh ~/databases/sqlite/
```

### View Logs
```bash
# PostgreSQL
cat ~/postgres/logfile

# MongoDB
cat ~/mongodb/logs/mongodb.log
```

### Stop Databases (if needed)
```bash
# PostgreSQL
pg_ctl -D ~/postgres stop

# MongoDB
mongosh admin --eval "db.shutdownServer()" --quiet
```

---

## 📚 Learning Resources

### SQL Tutorials
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [SQLite Tutorial](https://www.sqlitetutorial.net/)
- [SQL Practice](https://www.sql-practice.com/)

### MongoDB Tutorials
- [MongoDB University](https://university.mongodb.com/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [MongoDB Aggregation](https://docs.mongodb.com/manual/aggregation/)

### Python Database Programming
- [psycopg2 Documentation](https://www.psycopg.org/docs/)
- [PyMongo Documentation](https://pymongo.readthedocs.io/)
- [SQLAlchemy Tutorial](https://docs.sqlalchemy.org/en/14/tutorial/)

---

## 🆘 Troubleshooting

### Database Won't Connect
```bash
# Restart all databases
~/start-databases.sh

# Check if running
ps aux | grep postgres
ps aux | grep mongod
```

### Port Already in Use
```bash
# Check what's using the port
lsof -i :5432  # PostgreSQL
lsof -i :27017 # MongoDB

# Kill the process if needed
kill -9 <PID>
```

### Sample Data Missing
```bash
# Recreate sample data
~/start-databases.sh
```

### VS Code Extension Not Working
1. Reload VS Code: Ctrl+Shift+P → "Developer: Reload Window"
2. Check connection settings in VS Code
3. Verify database is running: `ps aux | grep postgres`

---

## 💡 Tips

1. **Use VS Code Extensions**: They provide autocomplete, syntax highlighting, and visual query builders
2. **Export Results**: In SQLTools, right-click query results → Export as CSV/JSON
3. **Save Queries**: Create `.sql` or `.js` files to save your queries
4. **Use Transactions**: For data modifications, wrap in transactions (SQL) or use sessions (MongoDB)
5. **Check Performance**: Use `EXPLAIN` in SQL or `.explain()` in MongoDB

---

## 🎯 Assignment Workflow

1. **Understand Requirements**: Read assignment instructions
2. **Explore Data**: Use sample queries to understand the schema
3. **Write Queries**: Create and test your solutions
4. **Test Edge Cases**: Try different scenarios
5. **Document**: Comment your queries
6. **Submit**: Push to GitHub or submit as required

Happy Querying! 🚀