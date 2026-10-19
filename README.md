# PhotoMentor 2.0 — Photography Learning Assistant

A complete, interactive photography education platform built with HTML/CSS/JavaScript frontend, Flask backend, C++ learning engine, and SQLite database.

## 🎓 Project Overview

PhotoMentor 2.0 teaches photography fundamentals through:
- **30 Photography Lessons** covering exposure, composition, lighting, and camera skills
- **28 Composition Principles** with practical examples and exercises
- **Interactive Exposure Simulator** for understanding aperture, shutter speed, and ISO
- **Camera Settings Advisor** providing smart recommendations
- **Photography Quizzes** with scoring and progress tracking
- **Photo Journal** for documenting practice sessions
- **Practical Challenges** to apply learned concepts

## 🏗️ Architecture

```
Browser (HTML/CSS/JS) → Flask REST API → C++ Learning Engine → SQLite Database
```

- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Backend:** Python Flask with REST API
- **Core Engine:** C++17 with JSON output
- **Database:** SQLite for persistence
- **Production:** Gunicorn server

## 📁 Project Structure

```
PhotoMentor2/
├── app.py                    # Flask backend server
├── requirements.txt          # Python dependencies
├── README.md                 # This file
├── .gitignore               # Git ignore rules
├── LICENSE.txt              # MIT License
├── cpp_engine/
│   └── main.cpp             # C++ learning engine
├── static/
│   ├── css/
│   │   └── style.css        # Styling
│   └── js/
│       └── app.js           # Frontend logic
└── templates/
    └── index.html           # Main HTML template
```

## 🚀 Local Development Setup

### Prerequisites

- **Python 3.8+** installed
- **C++ compiler** (g++ or MinGW on Windows)
- **Git** (optional, for version control)
- **Code editor** (VS Code recommended)

### Step 1: Extract Project Files

1. Extract the PhotoMentor2.zip file to your Desktop
2. Open VS Code
3. File → Open Folder → Select the `PhotoMentor2` folder

### Step 2: Compile C++ Engine

**On Windows (using MinGW or g++):**

```powershell
g++ -std=c++17 -O2 cpp_engine/main.cpp -o cpp_engine/photomentor_engine.exe
```

**On Linux/Mac:**

```bash
g++ -std=c++17 -O2 cpp_engine/main.cpp -o cpp_engine/photomentor_engine
```

**Verify compilation:**
```powershell
cpp_engine/photomentor_engine.exe get_lessons
```

You should see JSON output with lesson data.

### Step 3: Install Python Dependencies

```powershell
pip install -r requirements.txt
```

This installs Flask and Gunicorn.

### Step 4: Run the Application

```powershell
python app.py
```

The server will start on `http://127.0.0.1:5000`

Open your browser and navigate to that URL.

### Step 5: Test Features

1. **Learning Library** - Browse and filter 30 photography lessons
2. **Composition Academy** - Explore 28 composition principles
3. **Exposure Simulator** - Adjust aperture, shutter, ISO settings
4. **Settings Advisor** - Get camera recommendations
5. **Quizzes** - Test your knowledge
6. **Progress Dashboard** - Track completion
7. **Photo Journal** - Document practice sessions
8. **Challenges** - Complete practical exercises

## 📤 GitHub Upload Instructions

### Option 1: Using GitHub Web Interface (Easiest for Beginners)

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **+** icon (top-right) → **New repository**
3. Repository name: `PhotoMentor2`
4. Description: `Photography Learning Assistant - College Project`
5. Set to **Public**
6. **Do NOT** initialize with README (we already have one)
7. Click **Create repository**

8. On your computer, open the `PhotoMentor2` folder
9. Delete the `cpp_engine/photomentor_engine.exe` file (don't commit compiled files)
10. If there's a `photomentor.db` file, delete it too
11. Create a ZIP of all remaining files
12. On GitHub repository page, click **uploading an existing file**
13. Drag all project files (or the ZIP contents) into the upload area
14. Commit message: `Initial commit - PhotoMentor 2.0`
15. Click **Commit changes**

### Option 2: Using Git Command Line

```powershell
# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - PhotoMentor 2.0"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/PhotoMentor2.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🌐 Render Deployment Instructions

### Step 1: Create Render Account

1. Go to [Render.com](https://render.com)
2. Sign up with GitHub account (recommended)
3. Verify your email

### Step 2: Create New Web Service

1. Click **New +** → **Web Service**
2. Connect your GitHub repository: `PhotoMentor2`
3. If asked for permission, grant Render access to your repositories

### Step 3: Configure Service

**Basic Settings:**
- **Name:** `photomentor2` (or any unique name)
- **Region:** Choose closest to you
- **Branch:** `main`
- **Root Directory:** Leave blank (repository root)
- **Runtime:** `Python 3`

**Build & Deploy Settings:**

**Build Command:**
```bash
pip install -r requirements.txt && g++ -std=c++17 -O2 cpp_engine/main.cpp -o cpp_engine/photomentor_engine
```

**Start Command:**
```bash
gunicorn app:app
```

**Important:** Copy these commands EXACTLY as shown.

### Step 4: Deploy

1. Click **Create Web Service**
2. Render will:
   - Clone your repository
   - Install Python dependencies
   - Compile the C++ engine
   - Start the Gunicorn server
3. Wait 2-5 minutes for deployment

### Step 5: Access Your App

Once deployed, Render provides a URL like:
```
https://photomentor2.onrender.com
```

Click it to see your live application!

## 🔧 Troubleshooting

### Common Issues

**1. "C++ engine not found" error**

**Cause:** Engine wasn't compiled or wrong path
**Solution:** 
- Verify Build Command includes C++ compilation
- Check that output path is `cpp_engine/photomentor_engine` (no .exe on Linux)
- Look at Render deploy logs for compilation errors

**2. Empty lesson library**

**Cause:** C++ executable not running or returning invalid JSON
**Solution:**
- Test locally: `cpp_engine/photomentor_engine.exe get_lessons`
- Check Render logs for subprocess errors
- Verify C++ compilation succeeded in build logs

**3. "Module not found" error**

**Cause:** Missing Python dependency
**Solution:**
- Verify `requirements.txt` exists and contains Flask, Gunicorn
- Check Render build logs for pip install errors

**4. Database not persisting**

**Note:** Render's free tier uses ephemeral storage. Database resets on redeploy.
**Solution for production:** Use Render PostgreSQL or external database (beyond scope of basic project)

**5. Local Windows path issues**

**Cause:** Windows uses backslashes, code expects forward slashes
**Solution:** Code already handles this with `os.path.join()` and conditional `.exe` extension

### Viewing Logs

**Local development:**
- Flask prints logs to terminal
- Look for startup messages and error traces

**Render deployment:**
- Dashboard → Your Service → **Logs** tab
- Shows build process and runtime logs
- Search for "error" or "exception"

## 🎯 How It Works (Technical Explanation)

### Frontend → Backend Communication

1. **User Action:** User clicks "Show Lessons" button
2. **JavaScript:** `fetch('/api/lessons')` sends HTTP GET request
3. **Flask:** `@app.route('/api/lessons')` receives request
4. **Subprocess:** Flask calls `subprocess.run(['cpp_engine/photomentor_engine', 'get_lessons'])`
5. **C++ Engine:** Executes, returns JSON to stdout
6. **Flask:** Parses JSON, validates, returns as HTTP response
7. **JavaScript:** Receives JSON, renders lesson cards in DOM
8. **Browser:** User sees lessons

### Data Flow Example: Quiz

```
User submits quiz answer
    ↓
JavaScript collects answers, sends POST /api/quiz/submit
    ↓
Flask validates input, calls C++ engine with answers
    ↓
C++ compares answers to correct answers, calculates score
    ↓
C++ returns JSON: {"score": 8, "total": 10, "percentage": 80}
    ↓
Flask stores result in SQLite database
    ↓
Flask returns score JSON to frontend
    ↓
JavaScript displays score, updates progress dashboard
```

### SQLite Database Schema

**Tables:**

**lesson_progress:**
- lesson_id (TEXT PRIMARY KEY)
- completed (INTEGER) - 0 or 1
- completed_at (TIMESTAMP)

**quiz_attempts:**
- id (INTEGER PRIMARY KEY)
- score (INTEGER)
- total (INTEGER)
- percentage (REAL)
- attempted_at (TIMESTAMP)

**photo_journal:**
- id (INTEGER PRIMARY KEY)
- entry_date (TEXT)
- subject (TEXT)
- concept (TEXT)
- settings (TEXT)
- went_well (TEXT)
- improve (TEXT)
- next_goal (TEXT)
- created_at (TIMESTAMP)

## 📚 Viva Questions & Answers

### 1. Why did you use C++ for the learning engine?

**Answer:** C++ provides high performance for computational tasks like exposure calculations. It demonstrates integration of compiled languages with web applications through subprocess communication. The C++ engine acts as a microservice that Flask invokes via command-line interface.

### 2. How does Flask communicate with C++?

**Answer:** Flask uses Python's `subprocess.run()` to execute the compiled C++ binary as a child process. It passes arguments via command-line (e.g., `get_lessons`, `grade_quiz`), and reads JSON output from the C++ program's stdout. This is a language-agnostic IPC (Inter-Process Communication) method.

### 3. What is the purpose of SQLite?

**Answer:** SQLite provides persistent storage for user progress data - lesson completion status, quiz scores, and journal entries. It's a lightweight, file-based database perfect for small applications. No separate database server needed.

### 4. How does the exposure simulator work?

**Answer:** The C++ engine uses the exposure formula: EV = log₂(Aperture²/Shutter_Speed × 100/ISO). It calculates relative exposure differences in "stops" (doubling/halving light). The frontend sends selected settings to Flask, which invokes C++, and returns calculated exposure values and educational explanations.

### 5. What is Gunicorn?

**Answer:** Gunicorn is a production-grade WSGI HTTP server for Python web applications. Flask's built-in server is only for development. Gunicorn handles multiple concurrent requests efficiently, making it suitable for deployment on Render.

### 6. How do you handle API errors?

**Answer:** We use try-except blocks in Flask to catch exceptions. Errors are logged server-side with details, while clients receive safe JSON responses with appropriate HTTP status codes (400 for bad requests, 500 for server errors, 200 for success).

### 7. Why separate frontend and backend?

**Answer:** Separation of concerns - frontend handles presentation, backend handles business logic and data. This architecture allows independent scaling, easier testing, and potential future mobile app development using the same API.

### 8. How do you ensure JSON is valid from C++?

**Answer:** The C++ code properly escapes special characters in strings (quotes, backslashes, newlines). It writes diagnostic messages to stderr (not stdout) to avoid corrupting JSON. Flask validates received data before parsing.

### 9. What security measures did you implement?

**Answer:** Input validation on all API endpoints, parameterized subprocess calls (no shell injection), SQLite prepared statements (no SQL injection), error messages don't expose stack traces to users, and secrets aren't hardcoded in source.

### 10. How would you scale this application?

**Answer:** For scaling: migrate SQLite to PostgreSQL for multi-user support, add user authentication with JWT tokens, implement caching with Redis, use CDN for static assets, containerize with Docker, and deploy C++ engine as separate microservice with message queue.

### 11. What happens if C++ engine crashes?

**Answer:** Flask's subprocess call has a timeout parameter. If C++ crashes or hangs, Flask catches the exception, logs it, and returns a graceful error response to the frontend. The API remains available for other requests.

### 12. Explain the lesson completion flow.

**Answer:** User clicks "Mark Complete" → JavaScript sends POST /api/lesson/complete with lesson_id → Flask validates ID → Inserts/updates lesson_progress table in SQLite → Returns success → JavaScript updates UI and progress dashboard.

## 🎨 Design Features

- **Color Palette:** Warm ivory background, forest green accents, coral orange highlights
- **Typography:** Serif headlines, sans-serif body text
- **Responsive:** Mobile-first CSS with breakpoints for tablet and desktop
- **Interactions:** Smooth transitions, hover effects, loading states
- **Accessibility:** Semantic HTML, keyboard navigation, ARIA labels

## 📄 License

MIT License - See LICENSE.txt

## 👨‍💻 Author

Created as a BCA final year project demonstrating full-stack development, C++ integration, REST API design, and cloud deployment.

---

**For questions or issues, check the Troubleshooting section above or review the Render deployment logs.**
