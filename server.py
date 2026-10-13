import os
import json
import time
from werkzeug.utils import secure_filename
from flask import Flask, request, jsonify, send_from_directory, render_template, redirect

from data import database

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
ASSETS_DIR = os.path.join(BASE_DIR, 'assets')
IMAGES_DIR = os.path.join(ASSETS_DIR, 'images')
PDF_DIR = os.path.join(ASSETS_DIR, 'pdf')
ADMIN_DIR = os.path.join(BASE_DIR, 'admin')

os.makedirs(IMAGES_DIR, exist_ok=True)
os.makedirs(PDF_DIR, exist_ok=True)
os.makedirs(ADMIN_DIR, exist_ok=True)

app = Flask(__name__, static_folder=None)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB max upload for PDFs

# -------------------------------------------------------------
# Frontend & Static Files Routing
# -------------------------------------------------------------
@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'index.html')

@app.route('/admin')
def admin_redirect():
    return redirect('/admin/', code=302)

@app.route('/admin/')
def admin():
    return send_from_directory(ADMIN_DIR, 'index.html')

@app.route('/admin/<path:filename>')
def admin_static(filename):
    return send_from_directory(ADMIN_DIR, filename)

@app.route('/admin.css')
def admin_css_fallback():
    return send_from_directory(ADMIN_DIR, 'admin.css')

@app.route('/admin.js')
def admin_js_fallback():
    return send_from_directory(ADMIN_DIR, 'admin.js')

@app.route('/css/<path:filename>')
def css_static(filename):
    return send_from_directory(os.path.join(BASE_DIR, 'css'), filename)

@app.route('/js/<path:filename>')
def js_static(filename):
    return send_from_directory(os.path.join(BASE_DIR, 'js'), filename)

@app.route('/assets/<path:filename>')
def assets_static(filename):
    return send_from_directory(ASSETS_DIR, filename)

# -------------------------------------------------------------
# REST API: Articles
# -------------------------------------------------------------
@app.route('/api/articles', methods=['GET'])
def api_get_articles():
    category = request.args.get('category')
    search = request.args.get('search')
    limit = request.args.get('limit', type=int)
    placement = request.args.get('placement')
    articles = database.get_articles(category=category, search=search, limit=limit, placement=placement)
    return jsonify({'success': True, 'count': len(articles), 'articles': articles})

@app.route('/api/articles/<int:article_id>', methods=['GET'])
def api_get_article(article_id):
    article = database.get_article(article_id)
    if not article:
        return jsonify({'success': False, 'error': 'Article not found'}), 404
    return jsonify({'success': True, 'article': article})

@app.route('/api/articles', methods=['POST'])
def api_create_article():
    data = request.get_json(silent=True) or request.form.to_dict()
    if not data or not data.get('title'):
        return jsonify({'success': False, 'error': 'Headline/Title is required'}), 400
        
    new_id = database.create_article(data)
    new_article = database.get_article(new_id)
    return jsonify({'success': True, 'message': 'बातमी यशस्वीरीत्या प्रकाशित झाली!', 'article': new_article}), 201

@app.route('/api/articles/<int:article_id>', methods=['PUT', 'POST'])
def api_update_article(article_id):
    data = request.get_json(silent=True) or request.form.to_dict()
    if not data:
        return jsonify({'success': False, 'error': 'No update data provided'}), 400
        
    ok = database.update_article(article_id, data)
    if not ok:
        return jsonify({'success': False, 'error': 'Failed to update article or article not found'}), 404
        
    updated = database.get_article(article_id)
    return jsonify({'success': True, 'message': 'बातमी अद्यतनित करण्यात आली!', 'article': updated})

@app.route('/api/articles/<int:article_id>/toggle-placement', methods=['POST'])
def api_toggle_article_placement(article_id):
    data = request.get_json(silent=True) or request.form.to_dict() or {}
    field = data.get('field')
    value = data.get('value')
    if not field:
        return jsonify({'success': False, 'error': 'Placement field is required (is_lead, is_popular, is_random)'}), 400
    updated = database.toggle_placement(article_id, field, value)
    if not updated:
        return jsonify({'success': False, 'error': 'Article not found or invalid placement field'}), 404
    return jsonify({'success': True, 'message': 'सेक्शन स्थान अद्यतनित केले!', 'article': updated})

@app.route('/api/articles/<int:article_id>', methods=['DELETE'])
def api_delete_article(article_id):
    ok = database.delete_article(article_id)
    if not ok:
        return jsonify({'success': False, 'error': 'Article not found'}), 404
    return jsonify({'success': True, 'message': 'बातमी यशस्वीरीत्या हटवली!'})

# -------------------------------------------------------------
# REST API: Weekly Issues
# -------------------------------------------------------------
@app.route('/api/weekly', methods=['GET'])
def api_get_weekly():
    limit = request.args.get('limit', type=int)
    issues = database.get_weekly_editions(limit=limit)
    return jsonify({'success': True, 'count': len(issues), 'issues': issues})

@app.route('/api/weekly', methods=['POST'])
def api_create_weekly():
    data = request.get_json(silent=True) or request.form.to_dict()
    if not data or not data.get('issue_no') or not data.get('title'):
        return jsonify({'success': False, 'error': 'Issue number and title are required'}), 400
        
    try:
        new_id = database.create_weekly_edition(data)
        issue = database.get_weekly_edition(int(data['issue_no']))
        return jsonify({'success': True, 'message': 'साप्ताहिक अंक यशस्वीरीत्या जोडला!', 'issue': issue}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/weekly/<int:issue_no>', methods=['DELETE'])
def api_delete_weekly(issue_no):
    ok = database.delete_weekly_edition(issue_no)
    if not ok:
        return jsonify({'success': False, 'error': 'Weekly issue not found'}), 404
    return jsonify({'success': True, 'message': 'साप्ताहिक अंक यशस्वीरीत्या हटवला!'})

# -------------------------------------------------------------
# REST API: File Uploads (Image & PDF)
# -------------------------------------------------------------
ALLOWED_IMG_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}
ALLOWED_PDF_EXTENSIONS = {'pdf'}

def allowed_file(filename, allowed_set):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_set

@app.route('/api/upload/image', methods=['POST'])
def api_upload_image():
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No selected file'}), 400
        
    if file and allowed_file(file.filename, ALLOWED_IMG_EXTENSIONS):
        ext = file.filename.rsplit('.', 1)[1].lower()
        base_name = secure_filename(file.filename.rsplit('.', 1)[0])
        safe_name = f"{base_name}_{int(time.time())}.{ext}" if base_name else f"image_{int(time.time())}.{ext}"
        save_path = os.path.join(IMAGES_DIR, safe_name)
        file.save(save_path)
        rel_url = f"assets/images/{safe_name}"
        return jsonify({'success': True, 'url': rel_url, 'filename': safe_name, 'size': os.path.getsize(save_path)})
        
    return jsonify({'success': False, 'error': 'Invalid image format. Allowed: png, jpg, jpeg, webp, gif'}), 400

@app.route('/api/upload/pdf', methods=['POST'])
def api_upload_pdf():
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No selected file'}), 400
        
    if file and allowed_file(file.filename, ALLOWED_PDF_EXTENSIONS):
        issue_no = request.form.get('issue_no')
        if issue_no and issue_no.isdigit():
            safe_name = f"lokmangal-weekly-{issue_no}.pdf"
        else:
            safe_name = secure_filename(file.filename)
            if not safe_name.endswith('.pdf'):
                safe_name += '.pdf'
                
        save_path = os.path.join(PDF_DIR, safe_name)
        file.save(save_path)
        rel_url = f"assets/pdf/{safe_name}"
        return jsonify({'success': True, 'url': rel_url, 'filename': safe_name, 'size': os.path.getsize(save_path)})
        
    return jsonify({'success': False, 'error': 'Invalid file format. Allowed: pdf'}), 400

# -------------------------------------------------------------
# REST API: Stats & Media
# -------------------------------------------------------------
@app.route('/api/stats', methods=['GET'])
def api_get_stats():
    stats = database.get_stats()
    return jsonify({'success': True, 'stats': stats})

@app.route('/api/media', methods=['GET'])
def api_get_media():
    images = []
    if os.path.exists(IMAGES_DIR):
        for f in sorted(os.listdir(IMAGES_DIR), reverse=True):
            p = os.path.join(IMAGES_DIR, f)
            if os.path.isfile(p):
                images.append({
                    'filename': f,
                    'url': f"assets/images/{f}",
                    'size': os.path.getsize(p)
                })
    pdfs = []
    if os.path.exists(PDF_DIR):
        for f in sorted(os.listdir(PDF_DIR)):
            p = os.path.join(PDF_DIR, f)
            if os.path.isfile(p):
                pdfs.append({
                    'filename': f,
                    'url': f"assets/pdf/{f}",
                    'size': os.path.getsize(p)
                })
    return jsonify({'success': True, 'images': images, 'pdfs': pdfs})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    print(f"==================================================")
    print(f" Lokmangal News Portal & Admin Server Running")
    print(f" Live News Portal: http://localhost:{port}/")
    print(f" Admin Dashboard:  http://localhost:{port}/admin")
    print(f"==================================================")
    app.run(host='0.0.0.0', port=port, debug=False)
