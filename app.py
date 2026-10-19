import os
import sys
import json
import subprocess
import sqlite3
from datetime import datetime
from flask import Flask, render_template, request, jsonify
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Database configuration
DATABASE = 'photomentor.db'

# Determine C++ executable path
def get_cpp_executable():
    """Get correct C++ executable path for Windows or Linux"""
    base_path = os.path.join(os.path.dirname(__file__), 'cpp_engine')
    
    if sys.platform == 'win32':
        exe_path = os.path.join(base_path, 'photomentor_engine.exe')
    else:
        exe_path = os.path.join(base_path, 'photomentor_engine')
    
    return exe_path

CPP_ENGINE = get_cpp_executable()

# Database initialization
def init_db():
    """Initialize SQLite database with required tables"""
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    
    # Lesson progress table
    c.execute('''CREATE TABLE IF NOT EXISTS lesson_progress
                 (lesson_id TEXT PRIMARY KEY,
                  completed INTEGER DEFAULT 0,
                  completed_at TIMESTAMP)''')
    
    # Quiz attempts table
    c.execute('''CREATE TABLE IF NOT EXISTS quiz_attempts
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  score INTEGER,
                  total INTEGER,
                  percentage REAL,
                  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    
    # Photo journal table
    c.execute('''CREATE TABLE IF NOT EXISTS photo_journal
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  entry_date TEXT,
                  subject TEXT,
                  concept TEXT,
                  settings TEXT,
                  went_well TEXT,
                  improve TEXT,
                  next_goal TEXT,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    
    conn.commit()
    conn.close()
    logger.info("Database initialized successfully")

# Initialize database on startup
init_db()

def run_cpp_command(command, *args):
    """
    Execute C++ engine command safely
    Returns: (success: bool, data: dict/None, error: str/None)
    """
    if not os.path.exists(CPP_ENGINE):
        error_msg = f"C++ engine not found at: {CPP_ENGINE}. Please compile it first."
        logger.error(error_msg)
        return False, None, error_msg
    
    try:
        cmd = [CPP_ENGINE, command] + list(args)
        logger.info(f"Running command: {' '.join(cmd)}")
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=10,
            check=False
        )
        
        if result.returncode != 0:
            error_msg = f"C++ engine error: {result.stderr}"
            logger.error(error_msg)
            return False, None, error_msg
        
        # Parse JSON output
        try:
            data = json.loads(result.stdout)
            return True, data, None
        except json.JSONDecodeError as e:
            error_msg = f"Invalid JSON from C++ engine: {e}. Output: {result.stdout[:200]}"
            logger.error(error_msg)
            return False, None, error_msg
            
    except subprocess.TimeoutExpired:
        error_msg = "C++ engine timeout"
        logger.error(error_msg)
        return False, None, error_msg
    except Exception as e:
        error_msg = f"Subprocess error: {str(e)}"
        logger.error(error_msg)
        return False, None, error_msg

# Routes

@app.route('/')
def index():
    """Serve main HTML page"""
    return render_template('index.html')

@app.route('/health')
def health():
    """Health check endpoint for Render"""
    cpp_exists = os.path.exists(CPP_ENGINE)
    return jsonify({
        'status': 'healthy' if cpp_exists else 'degraded',
        'cpp_engine': 'found' if cpp_exists else 'missing',
        'cpp_path': CPP_ENGINE
    })

@app.route('/api/lessons', methods=['GET'])
def get_lessons():
    """Get all photography lessons"""
    category = request.args.get('category', '')
    
    success, data, error = run_cpp_command('get_lessons')
    
    if not success:
        return jsonify({'error': error}), 500
    
    lessons = data.get('lessons', [])
    
    # Filter by category if specified
    if category and category != 'all':
        lessons = [l for l in lessons if l.get('category', '').lower() == category.lower()]
    
    # Get completion status from database
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    c.execute('SELECT lesson_id, completed FROM lesson_progress')
    completed_lessons = {row[0]: bool(row[1]) for row in c.fetchall()}
    conn.close()
    
    # Add completion status to lessons
    for lesson in lessons:
        lesson['completed'] = completed_lessons.get(lesson['id'], False)
    
    return jsonify({'lessons': lessons})

@app.route('/api/composition', methods=['GET'])
def get_composition():
    """Get composition principles"""
    success, data, error = run_cpp_command('get_composition')
    
    if not success:
        return jsonify({'error': error}), 500
    
    return jsonify(data)

@app.route('/api/lesson/complete', methods=['POST'])
def complete_lesson():
    """Mark a lesson as completed"""
    data = request.get_json()
    lesson_id = data.get('lesson_id')
    
    if not lesson_id:
        return jsonify({'error': 'lesson_id required'}), 400
    
    try:
        conn = sqlite3.connect(DATABASE)
        c = conn.cursor()
        c.execute('''INSERT OR REPLACE INTO lesson_progress 
                     (lesson_id, completed, completed_at) 
                     VALUES (?, 1, ?)''',
                  (lesson_id, datetime.now()))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'lesson_id': lesson_id})
    except Exception as e:
        logger.error(f"Database error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/quiz', methods=['GET'])
def get_quiz():
    """Get quiz questions"""
    success, data, error = run_cpp_command('get_quiz')
    
    if not success:
        return jsonify({'error': error}), 500
    
    # Remove correct answers from response (client shouldn't see them yet)
    questions = data.get('questions', [])
    for q in questions:
        q.pop('correct_answer', None)
        q.pop('explanation', None)
    
    return jsonify({'questions': questions})

@app.route('/api/quiz/submit', methods=['POST'])
def submit_quiz():
    """Grade quiz submission"""
    data = request.get_json()
    user_answers = data.get('answers', [])
    
    if not user_answers:
        return jsonify({'error': 'answers required'}), 400
    
    # Convert answers to comma-separated string for C++ engine
    answers_str = ','.join(map(str, user_answers))
    
    success, result, error = run_cpp_command('grade_quiz', answers_str)
    
    if not success:
        return jsonify({'error': error}), 500
    
    # Store quiz attempt in database
    try:
        conn = sqlite3.connect(DATABASE)
        c = conn.cursor()
        c.execute('''INSERT INTO quiz_attempts (score, total, percentage)
                     VALUES (?, ?, ?)''',
                  (result['score'], result['total'], result['percentage']))
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"Failed to store quiz attempt: {e}")
    
    # Get full quiz with explanations
    success_quiz, quiz_data, _ = run_cpp_command('get_quiz')
    if success_quiz:
        result['questions'] = quiz_data.get('questions', [])
    
    return jsonify(result)

@app.route('/api/exposure/calculate', methods=['POST'])
def calculate_exposure():
    """Calculate exposure settings"""
    data = request.get_json()
    
    try:
        aperture = float(data.get('aperture', 5.6))
        shutter_speed = float(data.get('shutter_speed', 1/125))
        iso = int(data.get('iso', 400))
        lighting = data.get('lighting', 'moderate')
        
        success, result, error = run_cpp_command(
            'calculate_exposure',
            str(aperture),
            str(shutter_speed),
            str(iso),
            lighting
        )
        
        if not success:
            return jsonify({'error': error}), 500
        
        return jsonify(result)
        
    except (ValueError, KeyError) as e:
        return jsonify({'error': f'Invalid input: {str(e)}'}), 400

@app.route('/api/settings/advise', methods=['POST'])
def advise_settings():
    """Get camera settings recommendation"""
    data = request.get_json()
    
    subject = data.get('subject', 'everyday')
    lighting = data.get('lighting', 'moderate')
    effect = data.get('effect', 'balanced')
    
    success, result, error = run_cpp_command(
        'advise_settings',
        subject,
        lighting,
        effect
    )
    
    if not success:
        return jsonify({'error': error}), 500
    
    return jsonify(result)

@app.route('/api/progress', methods=['GET'])
def get_progress():
    """Get learning progress statistics"""
    try:
        conn = sqlite3.connect(DATABASE)
        c = conn.cursor()
        
        # Get total lessons
        success, data, _ = run_cpp_command('get_lessons')
        total_lessons = len(data.get('lessons', [])) if success else 30
        
        # Get completed lessons count
        c.execute('SELECT COUNT(*) FROM lesson_progress WHERE completed = 1')
        completed = c.fetchone()[0]
        
        # Get quiz statistics
        c.execute('''SELECT COUNT(*), MAX(percentage), AVG(percentage) 
                     FROM quiz_attempts''')
        quiz_stats = c.fetchone()
        quiz_attempts = quiz_stats[0] or 0
        best_score = quiz_stats[1] or 0
        avg_score = quiz_stats[2] or 0
        
        conn.close()
        
        remaining = total_lessons - completed
        percentage = (completed / total_lessons * 100) if total_lessons > 0 else 0
        
        return jsonify({
            'total_lessons': total_lessons,
            'completed_lessons': completed,
            'remaining_lessons': remaining,
            'completion_percentage': round(percentage, 1),
            'quiz_attempts': quiz_attempts,
            'best_quiz_score': round(best_score, 1),
            'average_quiz_score': round(avg_score, 1)
        })
        
    except Exception as e:
        logger.error(f"Progress error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/journal', methods=['GET', 'POST', 'DELETE'])
def journal():
    """Photo journal endpoints"""
    
    if request.method == 'GET':
        # Get all journal entries
        try:
            conn = sqlite3.connect(DATABASE)
            c = conn.cursor()
            c.execute('''SELECT id, entry_date, subject, concept, settings, 
                               went_well, improve, next_goal, created_at
                        FROM photo_journal ORDER BY created_at DESC''')
            
            entries = []
            for row in c.fetchall():
                entries.append({
                    'id': row[0],
                    'entry_date': row[1],
                    'subject': row[2],
                    'concept': row[3],
                    'settings': row[4],
                    'went_well': row[5],
                    'improve': row[6],
                    'next_goal': row[7],
                    'created_at': row[8]
                })
            
            conn.close()
            return jsonify({'entries': entries})
            
        except Exception as e:
            logger.error(f"Journal GET error: {e}")
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'POST':
        # Add new journal entry
        data = request.get_json()
        
        try:
            conn = sqlite3.connect(DATABASE)
            c = conn.cursor()
            c.execute('''INSERT INTO photo_journal 
                        (entry_date, subject, concept, settings, went_well, improve, next_goal)
                        VALUES (?, ?, ?, ?, ?, ?, ?)''',
                     (data.get('entry_date'),
                      data.get('subject'),
                      data.get('concept'),
                      data.get('settings'),
                      data.get('went_well'),
                      data.get('improve'),
                      data.get('next_goal')))
            
            entry_id = c.lastrowid
            conn.commit()
            conn.close()
            
            return jsonify({'success': True, 'id': entry_id})
            
        except Exception as e:
            logger.error(f"Journal POST error: {e}")
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'DELETE':
        # Delete journal entry
        entry_id = request.args.get('id')
        
        if not entry_id:
            return jsonify({'error': 'id required'}), 400
        
        try:
            conn = sqlite3.connect(DATABASE)
            c = conn.cursor()
            c.execute('DELETE FROM photo_journal WHERE id = ?', (entry_id,))
            conn.commit()
            conn.close()
            
            return jsonify({'success': True})
            
        except Exception as e:
            logger.error(f"Journal DELETE error: {e}")
            return jsonify({'error': str(e)}), 500

@app.route('/api/challenges', methods=['GET'])
def get_challenges():
    """Get practical photography challenges"""
    challenges = [
        {
            'id': 'CH001',
            'title': 'Rule of Thirds Portrait',
            'description': 'Photograph a person placing their eyes on the upper third intersection point.',
            'difficulty': 'Beginner',
            'category': 'Composition'
        },
        {
            'id': 'CH002',
            'title': 'Freeze Motion',
            'description': 'Capture a moving subject with a fast shutter speed (1/1000s or faster).',
            'difficulty': 'Beginner',
            'category': 'Shutter Speed'
        },
        {
            'id': 'CH003',
            'title': 'Shallow Depth of Field',
            'description': 'Create a portrait with beautiful background blur using f/2.8 or wider.',
            'difficulty': 'Beginner',
            'category': 'Aperture'
        },
        {
            'id': 'CH004',
            'title': 'Leading Lines',
            'description': 'Find a path, road, or natural lines that lead the viewer into your scene.',
            'difficulty': 'Beginner',
            'category': 'Composition'
        },
        {
            'id': 'CH005',
            'title': 'Silhouette at Sunset',
            'description': 'Photograph a subject as a silhouette against a bright sky or sunset.',
            'difficulty': 'Intermediate',
            'category': 'Exposure'
        },
        {
            'id': 'CH006',
            'title': 'Negative Space',
            'description': 'Create a minimalist composition with 70%+ empty space around your subject.',
            'difficulty': 'Intermediate',
            'category': 'Composition'
        },
        {
            'id': 'CH007',
            'title': 'Five Perspectives',
            'description': 'Photograph the same subject from five different viewpoints and angles.',
            'difficulty': 'Beginner',
            'category': 'Perspective'
        },
        {
            'id': 'CH008',
            'title': 'White Balance Comparison',
            'description': 'Take the same scene with Daylight, Tungsten, and Cloudy white balance.',
            'difficulty': 'Beginner',
            'category': 'White Balance'
        },
        {
            'id': 'CH009',
            'title': 'Three Layers',
            'description': 'Compose a landscape with distinct foreground, midground, and background.',
            'difficulty': 'Intermediate',
            'category': 'Composition'
        },
        {
            'id': 'CH010',
            'title': 'Low Light Challenge',
            'description': 'Photograph in difficult lighting without flash. Master ISO and aperture.',
            'difficulty': 'Advanced',
            'category': 'Exposure'
        }
    ]
    
    return jsonify({'challenges': challenges})

# Error handlers
@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def server_error(e):
    logger.error(f"Server error: {e}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
