# PhotoMentor 2.0 - Complete Setup Instructions for Beginners

## 📋 What You'll Need

- A computer with Windows
- Internet connection
- 30 minutes of time
- The PhotoMentor2 project folder

## 🎯 Step-by-Step Local Setup

### Step 1: Extract the Project

1. Locate the `PhotoMentor2` folder on your Desktop
2. If it's a ZIP file, right-click → Extract All
3. Make sure you have this folder structure:
   ```
   PhotoMentor2/
   ├── app.py
   ├── requirements.txt
   ├── README.md
   ├── cpp_engine/
   │   └── main.cpp
   ├── static/
   │   ├── css/
   │   └── js/
   └── templates/
       └── index.html
   ```

### Step 2: Install Python (If Not Already Installed)

1. Go to https://www.python.org/downloads/
2. Download Python 3.8 or newer (latest is best)
3. Run the installer
4. **IMPORTANT:** Check "Add Python to PATH" during installation
5. Click "Install Now"
6. Wait for installation to complete
7. Verify installation:
   - Open Command Prompt (Win + R, type `cmd`, press Enter)
   - Type: `python --version`
   - You should see: `Python 3.x.x`

### Step 3: Install C++ Compiler (MinGW)

**If you already have g++ installed, skip to Step 4.**

1. Go to https://sourceforge.net/projects/mingw-w64/
2. Download the installer
3. Run installer, select:
   - Architecture: x86_64
   - Threads: posix
   - Exception: seh
4. Install to `C:\mingw-w64\`
5. Add to PATH:
   - Right-click "This PC" → Properties → Advanced System Settings
   - Click "Environment Variables"
   - Under "System Variables", find "Path", click Edit
   - Click "New", add: `C:\mingw-w64\mingw64\bin`
   - Click OK on all dialogs
6. **Restart your computer**
7. Verify installation:
   - Open Command Prompt
   - Type: `g++ --version`
   - You should see: `g++ (GCC) ...`

### Step 4: Open Project in VS Code

1. Download VS Code from https://code.visualstudio.com/ (if not installed)
2. Install VS Code
3. Open VS Code
4. File → Open Folder
5. Navigate to `PhotoMentor2` folder on Desktop
6. Click "Select Folder"

### Step 5: Compile the C++ Engine

**In VS Code:**

1. Open Terminal: View → Terminal (or Ctrl + `)
2. You should see PowerShell at the bottom
3. Type this command and press Enter:
   ```powershell
   g++ -std=c++17 -O2 cpp_engine/main.cpp -o cpp_engine/photomentor_engine.exe
   ```
4. Wait 5-10 seconds for compilation
5. **Verify compilation worked:**
   ```powershell
   .\cpp_engine\photomentor_engine.exe get_lessons
   ```
6. You should see JSON output with lesson data

**If compilation fails:**
- Error "g++ not recognized": Restart computer after MinGW installation
- Error "c++17": Your g++ version is too old, download latest MinGW
- Error "permission denied": Run VS Code as Administrator

### Step 6: Install Python Dependencies

**In VS Code Terminal:**

```powershell
pip install -r requirements.txt
```

This installs:
- Flask (web framework)
- Gunicorn (production server)
- Werkzeug (utilities)

Wait 1-2 minutes for installation.

### Step 7: Run the Application

**In VS Code Terminal:**

```powershell
python app.py
```

You should see:
```
INFO:__main__:Database initialized successfully
 * Running on http://127.0.0.1:5000
```

### Step 8: Open in Browser

1. Open Google Chrome, Edge, or Firefox
2. Go to: `http://127.0.0.1:5000`
3. You should see the PhotoMentor homepage!

### Step 9: Test All Features

1. **Home** - View welcome page
2. **Learning Library** - Click, see 30 lessons, filter by category
3. **Composition Academy** - Click, see 28 principles
4. **Exposure Simulator** - Adjust settings, click Calculate
5. **Settings Advisor** - Select options, get recommendations
6. **Quiz** - Start quiz, answer questions, see score
7. **Progress** - View your completion stats
8. **Photo Journal** - Add a practice entry
9. **Challenges** - See practical exercises

**If you see errors:**
- "C++ engine not found": Re-run compilation in Step 5
- Empty lesson library: Check terminal for errors, ensure C++ compiled
- API errors: Make sure Flask is running (Step 7)

### Step 10: Stop the Server

When done testing:
- In VS Code Terminal, press `Ctrl + C`
- Server will stop
- To restart: Run `python app.py` again

## 📤 Upload to GitHub

### Method 1: GitHub Web Interface (Easiest)

1. **Prepare Files:**
   - Delete `cpp_engine/photomentor_engine.exe` (we don't commit compiled files)
   - Delete `photomentor.db` if it exists
   - Delete any `__pycache__` folders

2. **Create GitHub Repository:**
   - Go to https://github.com
   - Sign in (or create account)
   - Click "+" icon (top-right) → "New repository"
   - Repository name: `PhotoMentor2`
   - Description: `Photography Learning Assistant - BCA College Project`
   - Set to **Public**
   - **DO NOT** check "Initialize with README" (we have one)
   - Click "Create repository"

3. **Upload Files:**
   - On repository page, click "uploading an existing file"
   - Drag all files from PhotoMentor2 folder:
     - `app.py`
     - `requirements.txt`
     - `README.md`
     - `.gitignore`
     - `LICENSE.txt`
     - `cpp_engine/main.cpp`
     - `static/` folder
     - `templates/` folder
   - Commit message: `Initial commit - PhotoMentor 2.0`
   - Click "Commit changes"

4. **Verify Upload:**
   - Refresh page
   - You should see all files in repository
   - Click README.md to verify it displays

### Method 2: Git Command Line

**In VS Code Terminal:**

```powershell
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - PhotoMentor 2.0"

# Add your GitHub repository (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/PhotoMentor2.git

# Push
git branch -M main
git push -u origin main
```

Enter your GitHub username and password (or personal access token) when prompted.

## 🌐 Deploy to Render

### Step 1: Create Render Account

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub account (recommended) or email
4. Verify your email address

### Step 2: Connect GitHub Repository

1. In Render dashboard, click "New +" (top-right)
2. Select "Web Service"
3. Connect your GitHub account if not already connected
4. Click "Configure account" → Select "All repositories" or specific repository
5. Find and select `PhotoMentor2` repository
6. Click "Connect"

### Step 3: Configure Web Service

**Basic Configuration:**

- **Name:** `photomentor2` (or any unique name you want)
- **Region:** Choose closest to your location (e.g., Singapore for India)
- **Branch:** `main`
- **Root Directory:** Leave blank (use repository root)
- **Runtime:** `Python 3`

**Build & Deploy:**

**Build Command:**
```bash
pip install -r requirements.txt && g++ -std=c++17 -O2 cpp_engine/main.cpp -o cpp_engine/photomentor_engine
```

**Start Command:**
```bash
gunicorn app:app
```

**Environment:**

- **Python Version:** `3.8` or higher (leave default)

**Instance Type:**

- Select **Free** plan

### Step 4: Deploy

1. Scroll down and click **"Create Web Service"**
2. Render will now:
   - Clone your GitHub repository
   - Run the build command (install dependencies + compile C++)
   - Start the application with Gunicorn
3. Watch the deployment logs (shows progress)
4. Wait 2-5 minutes for first deployment

### Step 5: View Deployment Logs

In the logs, look for:
- ✅ `pip install -r requirements.txt` - Python packages installed
- ✅ `g++ -std=c++17...` - C++ compilation
- ✅ `gunicorn app:app` - Server started
- ✅ `Your service is live 🎉`

**If you see errors:**
- "g++ not found": Render has it built-in, shouldn't happen
- Timeout: First build can be slow, wait up to 10 minutes
- Build fails: Check logs, often a typo in Build Command

### Step 6: Access Your Live Application

1. Render provides a URL like: `https://photomentor2.onrender.com`
2. Click the URL or copy it
3. Open in browser
4. **Wait 30-60 seconds** on first load (free tier spins down when inactive)
5. PhotoMentor should load!

### Step 7: Test Live Application

Test all features:
- Learning Library loads 30 lessons ✓
- Composition Academy loads 28 principles ✓
- Exposure Simulator calculates ✓
- Settings Advisor gives recommendations ✓
- Quiz works and scores ✓
- Progress tracks data ✓
- Journal saves entries ✓

### Step 8: Share Your Project

Your live URL is: `https://photomentor2.onrender.com` (or your custom name)

Share this with:
- Your professor
- Classmates
- Friends
- Add to resume/portfolio

## 🐛 Common Render Issues

### Issue: "Application failed to respond"

**Cause:** App crashed or C++ compilation failed

**Solution:**
1. Check Render logs
2. Look for error in red text
3. Most common: Wrong Build Command or Start Command
4. Verify commands exactly match:
   - Build: `pip install -r requirements.txt && g++ -std=c++17 -O2 cpp_engine/main.cpp -o cpp_engine/photomentor_engine`
   - Start: `gunicorn app:app`

### Issue: "Empty lesson library" on live site

**Cause:** C++ engine didn't compile or wrong path

**Solution:**
1. Check build logs for "g++ -std=c++17" line
2. Should see no errors after that line
3. Verify in `app.py` the path is:
   ```python
   if sys.platform == 'win32':
       exe_path = os.path.join(base_path, 'photomentor_engine.exe')
   else:
       exe_path = os.path.join(base_path, 'photomentor_engine')
   ```
4. Render uses Linux (no .exe extension)

### Issue: "Disk quota exceeded"

**Cause:** Free tier has 512MB storage limit

**Solution:** This shouldn't happen with our project (it's ~5MB). If it does:
- Delete any large test files from repository
- Remove any accidentally committed images/videos

### Issue: Database resets when I redeploy

**Expected Behavior:** Render free tier uses ephemeral storage

**Solution for Production:**
- Upgrade to paid plan with persistent disk
- Or use Render PostgreSQL (free tier available)
- For college project, note in README: "Data resets on redeploy (Render free tier limitation)"

## 🎓 For Your College Viva

### Questions You Might Be Asked

**1. What is the architecture of your project?**

"It's a three-tier architecture:
- **Frontend:** HTML, CSS, and vanilla JavaScript for the user interface
- **Backend:** Python Flask REST API that handles HTTP requests
- **Core Engine:** C++ program that processes lessons, quizzes, and calculations
- **Database:** SQLite for persistent storage of user progress

The frontend makes API calls to Flask, Flask invokes the C++ executable via subprocess, and data is stored in SQLite."

**2. Why did you use C++ for the learning engine?**

"C++ provides high performance for computational tasks like exposure calculations. It demonstrates integration of compiled languages with web applications. The C++ engine acts as a microservice that communicates through JSON, showing how different technologies work together in modern systems."

**3. How does Flask communicate with C++?**

"Flask uses Python's `subprocess.run()` to execute the compiled C++ binary. It passes command-line arguments like 'get_lessons' or 'calculate_exposure', and the C++ program returns structured JSON output to stdout. Flask parses this JSON and sends it to the frontend."

**4. What is the purpose of the SQLite database?**

"SQLite provides lightweight, file-based persistent storage. It stores:
- Lesson completion status
- Quiz attempt history and scores
- Photo journal entries

This allows users to track progress across sessions."

**5. How did you deploy this on Render?**

"Render automatically builds and deploys from my GitHub repository. The build process:
1. Installs Python dependencies with pip
2. Compiles C++ source with g++
3. Starts the application with Gunicorn production server

Render provides a free public URL and handles scaling automatically."

**6. What would you improve if you had more time?**

"I would add:
- User authentication system for multiple users
- Photo upload functionality for journal entries
- PostgreSQL database for better scalability
- Progressive Web App (PWA) features for offline use
- Image examples for composition principles
- Video tutorials integrated into lessons"

**7. How is this different from a static website?**

"A static website just shows HTML pages. PhotoMentor is a dynamic web application:
- Data is generated on-the-fly from C++ engine
- User progress is tracked in database
- Interactive calculators process real-time inputs
- Quiz scores are computed and stored
- Content is delivered through REST APIs"

**8. What security measures did you implement?**

"- Input validation on all API endpoints
- Parameterized SQL queries to prevent SQL injection
- Safe subprocess execution with argument arrays (no shell injection)
- Error messages don't expose stack traces to users
- HTTPS on Render deployment
- `.gitignore` prevents sensitive files from being committed"

## 📝 Project Files Checklist

Before submitting, ensure you have:

✅ `README.md` - Project documentation
✅ `app.py` - Flask backend
✅ `requirements.txt` - Python dependencies
✅ `.gitignore` - Git ignore rules
✅ `LICENSE.txt` - MIT License
✅ `cpp_engine/main.cpp` - C++ source code
✅ `templates/index.html` - Main HTML file
✅ `static/css/style.css` - Styling
✅ `static/js/app.js` - Frontend logic
✅ GitHub repository (public)
✅ Live Render deployment
✅ This setup guide

## 🎉 You're Done!

You now have:
- ✅ A working local installation
- ✅ Complete source code on GitHub
- ✅ A live deployed website on Render
- ✅ Full understanding of the architecture
- ✅ Answers prepared for viva questions

**Your Professor Can:**
- Visit your live site: `https://photomentor2.onrender.com`
- View source code: `https://github.com/YOUR_USERNAME/PhotoMentor2`
- Run it locally following these instructions
- See your commit history on GitHub

**Good luck with your project demonstration! 🚀**

---

## 📞 Need Help?

If something doesn't work:

1. **Check the terminal/logs** - Error messages tell you what's wrong
2. **Read the error carefully** - Often tells you exactly what to fix
3. **Google the error** - Copy error message, search "render [error]" or "flask [error]"
4. **Check file paths** - Windows uses `\\`, Linux uses `/`, Python handles both with `os.path.join()`
5. **Restart everything** - Close VS Code, restart computer, try again

Common fixes:
- **"Command not found"** → Not installed or not in PATH, restart computer
- **"Module not found"** → Run `pip install -r requirements.txt` again
- **"Port already in use"** → Another app using port 5000, use `python app.py` with PORT=5001
- **"C++ engine not found"** → Re-compile with `g++ -std=c++17...` command
