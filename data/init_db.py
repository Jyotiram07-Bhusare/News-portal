import json
import re
import os
import sqlite3

os.makedirs('data', exist_ok=True)
db_path = os.path.join('data', 'portal.db')

conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Create tables
cur.execute('''
CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    categoryLabel TEXT NOT NULL,
    author TEXT NOT NULL,
    date TEXT NOT NULL,
    image TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    views TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
''')

cur.execute('''
CREATE TABLE IF NOT EXISTS weekly_editions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    issue_no INTEGER UNIQUE NOT NULL,
    date TEXT NOT NULL,
    title TEXT NOT NULL,
    image TEXT NOT NULL,
    pdf_filename TEXT NOT NULL,
    views TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
''')

conn.commit()
print("Tables created successfully.")
conn.close()
