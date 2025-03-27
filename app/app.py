from flask import Flask, render_template, request, redirect, url_for, jsonify
from datetime import datetime
import json
import os

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # Für Flash-Nachrichten

def get_section_info(page_number):
    sections = {
        (100, 199): 'INDEX',
        (200, 299): 'SERVICES',
        (300, 399): 'ABOUT',
        (400, 499): 'MEDIA',
        (500, 599): 'CONTACT'
    }
    
    for (start, end), name in sections.items():
        if start <= page_number <= end:
            return start, name
    return 100, 'INDEX'

def num_convert(value):
    if isinstance(value, str) and '-' in value:
        # Wenn es sich um einen Bereich handelt (z.B. "100-199"), 
        # geben wir den ersten Wert zurück
        return int(value.split('-')[0])
    return int(value)

def save_form_submission(form_type, data):
    filename = f'app/data/submissions_{form_type}.json'
    os.makedirs('app/data', exist_ok=True)
    
    try:
        with open(filename, 'r') as f:
            submissions = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        submissions = []
    
    data['timestamp'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    submissions.append(data)
    
    with open(filename, 'w') as f:
        json.dump(submissions, f, indent=4)

@app.route('/')
def index():
    return redirect(url_for('page', page_number=100))

@app.route('/page/<int:page_number>')
def page(page_number):
    content = load_content()
    page_str = str(page_number)
    
    if page_str in content:
        current_time = datetime.now().strftime("%H:%M:%S")
        current_date = datetime.now().strftime("%d.%m.%y")
        section_number, section_name = get_section_info(page_number)
        
        # Get page title from content or use section name as fallback
        page_title = content[page_str].get('title', section_name)
        
        return render_template('page.html',
                             content=content[page_str],
                             page_number=page_str,
                             section_number=section_number,
                             section_name=section_name,
                             current_time=current_time,
                             current_date=current_date,
                             page_title=page_title)
    else:
        return redirect(url_for('page', page_number=100))

@app.route('/submit_form', methods=['POST'])
def submit_form():
    form_data = request.form
    # Process form data here
    return jsonify({"status": "success"})

# Load content from JSON file
def load_content():
    with open(os.path.join(app.static_folder, 'content.json'), 'r', encoding='utf-8') as file:
        return json.load(file)

if __name__ == '__main__':
    app.run(debug=True) 