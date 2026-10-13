import sqlite3
import os
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), 'portal.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def dict_from_row(row: sqlite3.Row) -> Dict[str, Any]:
    return dict(row)

# -------------------------------------------------------------
# Articles CRUD
# -------------------------------------------------------------
def get_articles(category: Optional[str] = None, search: Optional[str] = None, limit: Optional[int] = None, placement: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db()
    cur = conn.cursor()
    query = "SELECT * FROM articles WHERE 1=1"
    params = []
    
    if category and category != 'all':
        query += " AND category = ?"
        params.append(category)

    if placement:
        if placement == 'lead':
            query += " AND is_lead = 1"
        elif placement == 'popular':
            query += " AND is_popular = 1"
        elif placement == 'random':
            query += " AND is_random = 1"
        
    if search:
        query += " AND (title LIKE ? OR excerpt LIKE ? OR content LIKE ? OR author LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term, term, term])
        
    query += " ORDER BY id DESC"
    
    if limit:
        query += " LIMIT ?"
        params.append(limit)
        
    cur.execute(query, params)
    rows = cur.fetchall()
    conn.close()
    return [dict_from_row(r) for r in rows]

def get_article(article_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM articles WHERE id = ?", (article_id,))
    row = cur.fetchone()
    conn.close()
    return dict_from_row(row) if row else None

def create_article(data: Dict[str, Any]) -> int:
    conn = get_db()
    cur = conn.cursor()
    
    category = data.get('category', 'rajkiy')
    category_label = data.get('categoryLabel')
    if not category_label:
        labels = {
            'rajkiy': 'राजकीय',
            'samajik': 'सामाजिक',
            'blogs': 'ब्लॉग्स',
            'reviews': 'परीक्षण',
            'weekly': 'साप्ताहिक आवृत्ती'
        }
        category_label = labels.get(category, 'ताज्या घडामोडी')

    is_lead = 1 if str(data.get('is_lead', 0)) in ('1', 'true', 'True') else 0
    is_popular = 1 if str(data.get('is_popular', 0)) in ('1', 'true', 'True') else 0
    is_random = 1 if str(data.get('is_random', 0)) in ('1', 'true', 'True') else 0

    if is_lead == 1:
        cur.execute("UPDATE articles SET is_lead = 0")
        
    cur.execute('''
        INSERT INTO articles (title, category, categoryLabel, author, date, image, excerpt, content, views, is_lead, is_popular, is_random)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data.get('title', '').strip(),
        category.strip(),
        category_label.strip(),
        data.get('author', 'लोकमंगल प्रतिनिधी').strip(),
        data.get('date', '').strip(),
        data.get('image', 'assets/images/lokmangal_what_we_do.jpg').strip(),
        data.get('excerpt', '').strip(),
        data.get('content', '').strip(),
        data.get('views', '1.2K').strip(),
        is_lead,
        is_popular,
        is_random
    ))
    new_id = cur.lastrowid
    conn.commit()
    conn.close()
    return new_id

def update_article(article_id: int, data: Dict[str, Any]) -> bool:
    conn = get_db()
    cur = conn.cursor()
    
    category = data.get('category')
    category_label = data.get('categoryLabel')
    if category and not category_label:
        labels = {
            'rajkiy': 'राजकीय',
            'samajik': 'सामाजिक',
            'blogs': 'ब्लॉग्स',
            'reviews': 'परीक्षण',
            'weekly': 'साप्ताहिक आवृत्ती'
        }
        category_label = labels.get(category, 'ताज्या घडामोडी')

    if str(data.get('is_lead', '')) in ('1', 'true', 'True'):
        cur.execute("UPDATE articles SET is_lead = 0 WHERE id != ?", (article_id,))

    fields = []
    values = []
    
    for key in ['title', 'category', 'categoryLabel', 'author', 'date', 'image', 'excerpt', 'content', 'views', 'is_lead', 'is_popular', 'is_random']:
        if key in data:
            val = data[key]
            if key in ('is_lead', 'is_popular', 'is_random'):
                val = 1 if str(val) in ('1', 'true', 'True') else 0
            fields.append(f"{key} = ?")
            values.append(val)
            
    if not fields:
        conn.close()
        return False
        
    values.append(article_id)
    sql = f"UPDATE articles SET {', '.join(fields)} WHERE id = ?"
    cur.execute(sql, values)
    affected = cur.rowcount
    conn.commit()
    conn.close()
    return affected > 0

def toggle_placement(article_id: int, field: str, value: Optional[int] = None) -> Optional[Dict[str, Any]]:
    if field not in ['is_lead', 'is_popular', 'is_random']:
        return None
    conn = get_db()
    cur = conn.cursor()
    if value is None:
        cur.execute(f"SELECT {field} FROM articles WHERE id = ?", (article_id,))
        row = cur.fetchone()
        if not row:
            conn.close()
            return None
        current = row[0] or 0
        value = 0 if current == 1 else 1

    if field == 'is_lead' and value == 1:
        cur.execute("UPDATE articles SET is_lead = 0")

    cur.execute(f"UPDATE articles SET {field} = ? WHERE id = ?", (value, article_id))
    conn.commit()
    cur.execute("SELECT * FROM articles WHERE id = ?", (article_id,))
    row = cur.fetchone()
    conn.close()
    return dict_from_row(row) if row else None

def delete_article(article_id: int) -> bool:
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM articles WHERE id = ?", (article_id,))
    affected = cur.rowcount
    conn.commit()
    conn.close()
    return affected > 0

# -------------------------------------------------------------
# Weekly Editions CRUD
# -------------------------------------------------------------
def get_weekly_editions(limit: Optional[int] = None) -> List[Dict[str, Any]]:
    conn = get_db()
    cur = conn.cursor()
    query = "SELECT * FROM weekly_editions ORDER BY issue_no DESC"
    params = []
    if limit:
        query += " LIMIT ?"
        params.append(limit)
    cur.execute(query, params)
    rows = cur.fetchall()
    conn.close()
    return [dict_from_row(r) for r in rows]

def get_weekly_edition(issue_no: int) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM weekly_editions WHERE issue_no = ?", (issue_no,))
    row = cur.fetchone()
    conn.close()
    return dict_from_row(row) if row else None

def create_weekly_edition(data: Dict[str, Any]) -> int:
    conn = get_db()
    cur = conn.cursor()
    issue_no = int(data.get('issue_no', 0))
    pdf_filename = data.get('pdf_filename') or f"lokmangal-weekly-{issue_no}.pdf"
    
    cur.execute('''
        INSERT OR REPLACE INTO weekly_editions (issue_no, date, title, image, pdf_filename, views, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        issue_no,
        data.get('date', '').strip(),
        data.get('title', '').strip(),
        data.get('image', 'assets/images/lokmangal_what_we_do.jpg').strip(),
        pdf_filename.strip(),
        data.get('views', '12K').strip(),
        data.get('description', '').strip()
    ))
    new_id = cur.lastrowid
    conn.commit()
    conn.close()
    return new_id

def delete_weekly_edition(issue_no: int) -> bool:
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM weekly_editions WHERE issue_no = ?", (issue_no,))
    affected = cur.rowcount
    conn.commit()
    conn.close()
    return affected > 0

# -------------------------------------------------------------
# Dashboard Statistics
# -------------------------------------------------------------
def get_stats() -> Dict[str, Any]:
    conn = get_db()
    cur = conn.cursor()
    
    cur.execute("SELECT COUNT(*) FROM articles")
    total_articles = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM weekly_editions")
    total_weekly = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM articles WHERE category = 'rajkiy'")
    total_rajkiy = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM articles WHERE category = 'samajik'")
    total_samajik = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM articles WHERE category = 'blogs'")
    total_blogs = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM articles WHERE category = 'reviews'")
    total_reviews = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM articles WHERE is_popular = 1")
    total_popular = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM articles WHERE is_random = 1")
    total_random = cur.fetchone()[0]

    cur.execute("SELECT id, title, image, categoryLabel FROM articles WHERE is_lead = 1 LIMIT 1")
    lead_row = cur.fetchone()
    current_lead = dict_from_row(lead_row) if lead_row else None
    
    # Recent 5 articles
    cur.execute("SELECT id, title, category, categoryLabel, date, views, image, is_lead, is_popular, is_random FROM articles ORDER BY id DESC LIMIT 5")
    recent_articles = [dict_from_row(r) for r in cur.fetchall()]
    
    # Recent 5 weekly
    cur.execute("SELECT issue_no, date, title, views, image, pdf_filename FROM weekly_editions ORDER BY issue_no DESC LIMIT 5")
    recent_weekly = [dict_from_row(r) for r in cur.fetchall()]
    
    conn.close()
    
    return {
        'total_articles': total_articles,
        'total_weekly': total_weekly,
        'total_rajkiy': total_rajkiy,
        'total_samajik': total_samajik,
        'total_blogs': total_blogs,
        'total_reviews': total_reviews,
        'total_popular': total_popular,
        'total_random': total_random,
        'current_lead': current_lead,
        'recent_articles': recent_articles,
        'recent_weekly': recent_weekly
    }
