from flask import Flask, render_template, request, redirect, url_for, flash
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

@app.route('/submit_form/<form_type>', methods=['POST'])
def submit_form(form_type):
    data = request.form.to_dict()
    save_form_submission(form_type, data)
    flash('Thank you for your submission!')
    return redirect(url_for('page', page_number=501))

@app.route('/')
def index():
    try:
        with open('app/static/content.json', 'r') as file:
            content = json.load(file)
            page_content = content.get('100', {})
            section_number, section_name = get_section_info(100)
            return render_template('index.html', 
                                content=page_content,
                                page_number=100,
                                section_number=section_number,
                                section_name=section_name,
                                current_time=datetime.now().strftime('%H:%M:%S'),
                                current_date=datetime.now().strftime('%d.%m.%y'))
    except FileNotFoundError:
        return render_template('index.html',
                            page_number=100,
                            section_number=100,
                            section_name='INDEX',
                            current_time=datetime.now().strftime('%H:%M:%S'),
                            current_date=datetime.now().strftime('%d.%m.%y'))

@app.route('/page/<int:page_number>')
def page(page_number):
    try:
        with open('app/static/content.json', 'r') as file:
            content = json.load(file)
            page_content = content.get(str(page_number))
            
            if page_content is None:
                section_number, section_name = get_section_info(page_number)
                return render_template('error.html',
                                    page_number=page_number,
                                    section_number=section_number,
                                    section_name=section_name,
                                    current_time=datetime.now().strftime('%H:%M:%S'),
                                    current_date=datetime.now().strftime('%d.%m.%y')), 404
            
            section_number, section_name = get_section_info(page_number)
            
            # Bestimme das Template basierend auf der Seite
            if page_number in [501, 502, 503, 504]:
                template = 'contact_form.html'
                page_content['form_type'] = {
                    501: 'general',
                    502: 'support',
                    503: 'business',
                    504: 'career'
                }[page_number]
            else:
                template = 'page.html'
            
            return render_template(template, 
                                content=page_content,
                                page_number=page_number,
                                section_number=section_number,
                                section_name=section_name,
                                current_time=datetime.now().strftime('%H:%M:%S'),
                                current_date=datetime.now().strftime('%d.%m.%y'))
    except FileNotFoundError:
        return "Content not found", 404

if __name__ == '__main__':
    app.run(debug=True) 