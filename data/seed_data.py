import json
import re
import os
import sqlite3

db_path = os.path.join('data', 'portal.db')
conn = sqlite3.connect(db_path)
cur = conn.cursor()

with open('js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract weekly issues array
m_weekly = re.search(r'const\s+PAST_WEEKLY_ISSUES\s*=\s*\[([\s\S]*?)\];', content)
if m_weekly:
    raw_weekly = m_weekly.group(1)
    # Parse lines with { no: ..., date: ..., title: ..., img: ..., views: ... }
    lines = raw_weekly.strip().split('\n')
    count = 0
    for line in lines:
        line = line.strip()
        if not line.startswith('{'):
            continue
        no_m = re.search(r'no:\s*(\d+)', line)
        date_m = re.search(r'date:\s*"([^"]+)"', line)
        title_m = re.search(r'title:\s*"([^"]+)"', line)
        img_m = re.search(r'img:\s*"([^"]+)"', line)
        views_m = re.search(r'views:\s*"([^"]+)"', line)
        desc_m = re.search(r'desc:\s*"([^"]+)"', line)
        
        if no_m and date_m and title_m:
            no = int(no_m.group(1))
            dt = date_m.group(1)
            title = title_m.group(1)
            img = img_m.group(1) if img_m else "assets/images/lokmangal_what_we_do.jpg"
            views = views_m.group(1) if views_m else "15K"
            desc = desc_m.group(1) if desc_m else ""
            pdf_name = f"lokmangal-weekly-{no}.pdf"
            
            cur.execute('''
                INSERT OR REPLACE INTO weekly_editions (issue_no, date, title, image, pdf_filename, views, description)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (no, dt, title, img, pdf_name, views, desc))
            count += 1
    conn.commit()
    print(f"Successfully inserted/updated {count} weekly editions.")

cur.execute("SELECT COUNT(*) FROM weekly_editions")
print(f"Total weekly editions in DB: {cur.fetchone()[0]}")
cur.execute("SELECT COUNT(*) FROM articles")
print(f"Total articles in DB: {cur.fetchone()[0]}")

conn.close()
