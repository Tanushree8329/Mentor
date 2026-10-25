
import os
import math
import sqlite3
from datetime import datetime
from flask import Flask, render_template, request, jsonify

app = Flask(__name__, template_folder="templates", static_folder="static")

# Vercel uses temporary storage. A hosted database is needed for permanent data.
DATABASE = "/tmp/photomentor.db" if os.getenv("VERCEL") else os.path.join(os.path.dirname(__file__), "photomentor.db")

LESSON_DATA = [
("Exposure Triangle","Exposure","Aperture, shutter speed, and ISO control exposure.","Change one setting at a time and compare results."),
("Aperture Basics","Exposure","Aperture is the lens opening, described by an f-number.","A lower f-number lets in more light and often blurs the background."),
("Shutter Speed","Exposure","Shutter speed controls how long the sensor receives light.","Fast speeds freeze action; slow speeds can show motion blur."),
("ISO Basics","Exposure","ISO affects brightness and image noise.","Use the lowest practical ISO for cleaner images."),
("Exposure Compensation","Exposure","Exposure compensation adjusts automatic exposure brighter or darker.","Use it when a scene is unusually bright or dark."),
("Focus Modes","Focus","Autofocus modes control how the camera focuses on subjects.","Use continuous autofocus for moving subjects."),
("Focus Points","Focus","Focus points tell the camera where to focus.","Place focus on the most important detail, such as the eyes."),
("Depth of Field","Focus","Depth of field is the range that appears acceptably sharp.","Aperture, distance, and focal length affect background blur."),
("Focal Length","Lenses","Focal length changes the angle of view and framing.","Wide lenses show more; telephoto lenses frame a narrower view."),
("Prime vs Zoom","Lenses","Prime lenses have a fixed focal length; zoom lenses change it.","Choose according to your subject and flexibility needs."),
("Rule of Thirds","Composition","A 3-by-3 grid helps position important elements.","Try placing the subject near a grid line."),
("Leading Lines","Composition","Lines guide the viewer's eye through a photograph.","Try paths, railings, shadows, or roads."),
("Framing","Composition","Elements around a scene can frame the subject.","Try doorways, windows, or branches."),
("Negative Space","Composition","Negative space is uncluttered space around a subject.","Use it to simplify the frame."),
("Symmetry","Composition","Symmetry uses similar shapes across an axis.","Look for reflections and architecture."),
("Patterns","Composition","Repeated shapes and colours create rhythm.","A break in a pattern can draw attention."),
("Layering","Composition","Foreground, midground, and background add depth.","Include an interesting object near the camera."),
("Perspective","Composition","Viewpoint changes the relationship between objects.","Try high, low, and side angles."),
("Natural Light","Lighting","Natural light changes direction, softness, and colour.","Observe the light before positioning your subject."),
("Hard and Soft Light","Lighting","Hard light creates sharp shadows; soft light creates gradual shadows.","Open shade or a large window can soften portraits."),
("Golden Hour","Lighting","Golden hour occurs around sunrise or sunset.","Try side light or backlight and watch highlights."),
("Backlighting","Lighting","Backlighting comes from behind the subject.","Expose for the subject or create a silhouette."),
("White Balance","Colour","White balance adjusts colour casts from light sources.","Use Auto as a starting point and adjust for consistency."),
("Colour Theory","Colour","Colour relationships influence mood and harmony.","Try complementary colours or a limited palette."),
("Portrait Photography","Genres","Portraits use expression, light, and framing to communicate personality.","Focus on the eyes and give simple direction."),
("Landscape Photography","Genres","Landscape photography emphasizes place, scale, and detail.","Check frame edges and stabilize the camera."),
("Street Photography","Genres","Street photography captures everyday life and moments.","Be observant and respectful in public spaces."),
("Photo Review","Workflow","Reviewing photos helps identify strengths and improvements.","Choose one goal for each practice session."),
("Histogram Basics","Exposure","A histogram shows the distribution of tones in an image.","Check for clipped highlights and shadows."),
("Photo Storytelling","Workflow","A photograph can communicate a moment, mood, or idea.","Decide what the viewer should notice first.")
]

LESSONS = [
    {"id": f"L{i+1:02d}", "title": x[0], "category": x[1],
     "content": x[2], "examples": [x[3]], "exercises": [x[3]]}
    for i, x in enumerate(LESSON_DATA)
]

COMP_DATA = [
("Rule of Thirds","Place important elements near a 3-by-3 grid's lines."),
("Leading Lines","Use lines to guide attention toward the subject."),
("Framing","Use elements around the scene to frame the subject."),
("Negative Space","Leave uncluttered space around the subject."),
("Symmetry","Use matching shapes or reflections for balance."),
("Patterns","Repeat shapes, colours, or textures to create rhythm."),
("Layering","Include foreground, midground, and background."),
("Perspective","Change your viewpoint to change the story."),
("Balance","Arrange visual weight intentionally."),
("Contrast","Use differences in tone, colour, size, or texture."),
("Fill the Frame","Move closer to remove distractions."),
("Centred Composition","Place the subject centrally when it suits the scene."),
("Diagonals","Use diagonal lines to create energy."),
("Triangles","Arrange elements into triangular shapes."),
("Odd Numbers","Groups of three or five can feel visually natural."),
("Simplification","Remove competing details."),
("Colour Harmony","Choose colours that support the mood."),
("Colour Contrast","Use contrasting colours to make elements stand out."),
("Light and Shadow","Use tonal shapes to create depth."),
("Golden Ratio","Arrange elements along a flowing proportion."),
("Eye Lines","Leave space in the direction a person looks."),
("Headroom","Leave intentional space above a person's head."),
("Look Room","Leave space in front of a moving or looking subject."),
("Depth Cues","Use overlap, size, and perspective to suggest distance."),
("Repetition with a Break","A different element can become the focal point."),
("Reflections","Use reflective surfaces to add symmetry."),
("Natural Frames","Use doorways, branches, or windows around the subject."),
("Edge Awareness","Check frame edges for distracting cut-offs.")
]

COMPOSITION = [
    {"id": f"CP{i+1:02d}", "title": name, "definition": definition,
     "why_it_works": "It organizes attention and makes the image easier to read.",
     "when_to_use": "Use it when it supports the subject and story.",
     "example": f"Photograph a scene demonstrating {name.lower()}.",
     "exercise": f"Take three photos using {name.lower()} and compare them.",
     "common_mistakes": "Applying the rule when it does not suit the scene.",
     "breaking_rule": "Break it deliberately when another arrangement communicates better."}
    for i, (name, definition) in enumerate(COMP_DATA)
]

QUIZ_DATA = [
("Which setting controls the lens opening?",["ISO","Aperture","White balance","Focal length"],1,"Aperture controls the lens opening."),
("Which shutter speed best freezes fast action?",["1 second","1/15 second","1/1000 second","1/4 second"],2,"A fast shutter speed reduces motion blur."),
("What can a higher ISO increase?",["Brightness and noise","Focal length","Frame size","Depth of field"],0,"Higher ISO can brighten the image but add noise."),
("What is the rule of thirds?",["Use three lenses","Divide the frame into a 3-by-3 grid","Take three exposures","Use f/3"],1,"The frame is divided into nine areas."),
("Which aperture often gives more background blur?",["f/16","f/11","f/8","f/1.8"],3,"A lower f-number often creates shallower depth of field."),
("What do leading lines do?",["Guide the viewer's eye","Change ISO","Remove shadows","Correct white balance"],0,"Leading lines direct attention."),
("What does white balance adjust?",["Colour cast","Shutter speed","Lens zoom","Image dimensions"],0,"White balance helps neutralize colour casts."),
("Which light usually creates softer shadows?",["Small direct flash","Harsh midday sun","Large diffused window light","Bare bulb close to subject"],2,"A large light source creates softer shadows."),
("What is negative space?",["A failed photo","Uncluttered area around a subject","A film scan","A dark exposure"],1,"Negative space can emphasize the subject."),
("What should you check when reviewing a photo?",["Add a filter","Focus, exposure, and composition","Increase saturation","Delete every imperfect image"],1,"Review technical and compositional choices first.")
]

CHALLENGES = [
{"id":"CH001","title":"Rule of Thirds Portrait","difficulty":"Beginner","category":"Composition","description":"Place a person's eyes near an upper-third grid line."},
{"id":"CH002","title":"Freeze Motion","difficulty":"Beginner","category":"Shutter Speed","description":"Photograph movement using a fast shutter speed."},
{"id":"CH003","title":"Shallow Depth of Field","difficulty":"Beginner","category":"Aperture","description":"Create a portrait with a soft background."},
{"id":"CH004","title":"Leading Lines","difficulty":"Beginner","category":"Composition","description":"Find lines that guide the viewer into a scene."},
{"id":"CH005","title":"Silhouette at Sunset","difficulty":"Intermediate","category":"Exposure","description":"Expose for a bright sky to create a silhouette."},
{"id":"CH006","title":"Negative Space","difficulty":"Intermediate","category":"Composition","description":"Make a simple image with uncluttered space."},
{"id":"CH007","title":"Five Perspectives","difficulty":"Beginner","category":"Perspective","description":"Photograph one subject from five viewpoints."},
{"id":"CH008","title":"White Balance Comparison","difficulty":"Beginner","category":"White Balance","description":"Compare daylight, cloudy, and tungsten white balance."},
{"id":"CH009","title":"Three Layers","difficulty":"Intermediate","category":"Composition","description":"Create foreground, midground, and background."},
{"id":"CH010","title":"Low Light Challenge","difficulty":"Advanced","category":"Exposure","description":"Compare ISO and aperture in low light."}
]

def get_db():
    folder = os.path.dirname(DATABASE)
    if folder:
        os.makedirs(folder, exist_ok=True)
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as c:
        c.execute("CREATE TABLE IF NOT EXISTS lesson_progress (lesson_id TEXT PRIMARY KEY, completed INTEGER DEFAULT 0, completed_at TEXT)")
        c.execute("CREATE TABLE IF NOT EXISTS quiz_attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, score INTEGER, total INTEGER, percentage REAL, attempted_at TEXT DEFAULT CURRENT_TIMESTAMP)")
        c.execute("""CREATE TABLE IF NOT EXISTS photo_journal (
            id INTEGER PRIMARY KEY AUTOINCREMENT, entry_date TEXT, subject TEXT,
            concept TEXT, settings TEXT, went_well TEXT, improve TEXT,
            next_goal TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP)""")

init_db()

def lesson_list():
    with get_db() as c:
        done = {r["lesson_id"]: bool(r["completed"]) for r in
                c.execute("SELECT lesson_id, completed FROM lesson_progress")}
    return [dict(x, completed=done.get(x["id"], False)) for x in LESSONS]

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/health")
def health():
    return jsonify({"status": "ok", "engine": "python-fallback"})

@app.route("/api/lessons")
def get_lessons():
    category = request.args.get("category", "")
    items = lesson_list()
    if category and category.lower() != "all":
        items = [x for x in items if x["category"].lower() == category.lower()]
    return jsonify({"lessons": items})

def mark_complete(lesson_id):
    with get_db() as c:
        c.execute("INSERT OR REPLACE INTO lesson_progress (lesson_id, completed, completed_at) VALUES (?,1,?)",
                  (str(lesson_id), datetime.utcnow().isoformat()))
    return jsonify({"success": True, "lesson_id": str(lesson_id)})

@app.route("/api/lesson/complete", methods=["POST"])
def complete_lesson():
    data = request.get_json(silent=True) or {}
    if not data.get("lesson_id"):
        return jsonify({"error": "lesson_id required"}), 400
    return mark_complete(data["lesson_id"])

@app.route("/api/lessons/<lesson_id>/complete", methods=["POST"])
def complete_lesson_old(lesson_id):
    return mark_complete(lesson_id)

@app.route("/api/composition")
def get_composition():
    return jsonify({"principles": COMPOSITION})

def exposure_result(data):
    try:
        aperture = float(data.get("aperture", 5.6))
        shutter = float(data.get("shutter_speed", 1/125))
        iso = int(data.get("iso", 400))
        if aperture <= 0 or shutter <= 0 or iso <= 0:
            raise ValueError("Settings must be positive numbers.")
        ev = round(math.log2((aperture ** 2) / shutter), 2)
        stops = round(math.log2((aperture ** 2 / shutter) * (100 / iso)), 2)
        warning = "High ISO may add noise." if iso >= 3200 else (
            "Slow shutter speeds can cause blur." if shutter < 1/60 else "")
        return jsonify({
            "aperture": aperture, "shutter_speed": shutter, "iso": iso,
            "lighting": data.get("lighting", "moderate"),
            "exposure_value": ev, "stops_from_reference": stops,
            "explanation": "Aperture affects depth of field, shutter speed affects motion blur, and ISO affects brightness and noise.",
            "warning": warning
        })
    except (TypeError, ValueError) as e:
        return jsonify({"error": f"Invalid input: {e}"}), 400

@app.route("/api/exposure/calculate", methods=["POST"])
def calculate_exposure():
    return exposure_result(request.get_json(silent=True) or {})

@app.route("/api/simulate", methods=["POST"])
def simulate_old():
    return exposure_result(request.get_json(silent=True) or {})

def advise_result(data):
    subject = str(data.get("subject", "everyday")).lower()
    lighting = str(data.get("lighting", "moderate")).lower()
    effect = str(data.get("effect", "balanced")).lower()
    if subject in ("portrait", "person", "people"):
        ap, sh, iso = "f/1.8–f/2.8", "1/200s or faster", "100–800"
        reason = "A wide aperture can separate a portrait from its background."
    elif subject in ("sports", "action", "moving"):
        ap, sh, iso = "f/2.8–f/5.6", "1/1000s or faster", "Auto ISO or 400–3200"
        reason = "Prioritize a fast shutter speed to freeze motion."
    elif subject in ("landscape", "architecture"):
        ap, sh, iso = "f/8–f/11", "Use a tripod if slow", "100–200"
        reason = "A moderate aperture and low ISO are useful starting points."
    elif subject in ("night", "low light", "lowlight"):
        ap, sh, iso = "Widest available", "1/60s or tripod-dependent", "800–3200+"
        reason = "Gather light with a wide aperture and stabilize the camera."
    else:
        ap, sh, iso = "f/4–f/8", "1/125s or faster", "100–800"
        reason = "These are general starting points; adjust after reviewing the image."
    tips = [reason, "Check focus and highlights after the first shot."]
    if lighting in ("low", "dark", "dim"):
        tips.append("Stabilize the camera or raise ISO if needed.")
    if lighting in ("bright", "sunny", "harsh"):
        tips.append("Use a low ISO and watch for clipped highlights.")
    if effect in ("blur", "bokeh", "shallow depth of field"):
        ap = "f/1.8–f/2.8 if available"
        tips.append("Move the subject away from the background.")
    if effect in ("freeze", "motion", "sharp action"):
        sh = "1/500s–1/1000s or faster"
        tips.append("A faster shutter may require a higher ISO.")
    return jsonify({
        "subject": subject, "lighting": lighting, "effect": effect,
        "recommended_aperture": ap, "recommended_shutter": sh,
        "recommended_iso": iso, "explanation": reason, "tips": tips
    })

@app.route("/api/settings/advise", methods=["POST"])
def advise_settings():
    return advise_result(request.get_json(silent=True) or {})

@app.route("/api/advisor", methods=["POST"])
def advisor_old():
    return advise_result(request.get_json(silent=True) or {})

@app.route("/api/quiz")
def get_quiz():
    return jsonify({"questions": [
        {"id": i+1, "question": q[0], "options": q[1]}
        for i, q in enumerate(QUIZ_DATA)
    ]})

def grade_quiz(answers):
    review = []
    score = 0
    for i, q in enumerate(QUIZ_DATA):
        try:
            submitted = int(answers[i]) if i < len(answers) else -1
        except (TypeError, ValueError):
            submitted = -1
        correct = submitted == q[2]
        score += int(correct)
        review.append({
            "id": i+1, "question": q[0], "options": q[1],
            "correct_answer": q[2], "your_answer": submitted,
            "is_correct": correct, "explanation": q[3]
        })
    total = len(QUIZ_DATA)
    pct = round(score / total * 100, 1)
    with get_db() as c:
        c.execute("INSERT INTO quiz_attempts (score,total,percentage) VALUES (?,?,?)",
                  (score, total, pct))
    return jsonify({"score": score, "total": total, "percentage": pct, "questions": review})

@app.route("/api/quiz/submit", methods=["POST"])
def submit_quiz():
    answers = (request.get_json(silent=True) or {}).get("answers", [])
    if not isinstance(answers, list) or not answers:
        return jsonify({"error": "answers must be a non-empty list"}), 400
    return grade_quiz(answers)

@app.route("/api/quiz/answer", methods=["POST"])
def answer_quiz_old():
    data = request.get_json(silent=True) or {}
    answers = data.get("answers", data.get("answer", []))
    if not isinstance(answers, list):
        answers = [answers]
    return grade_quiz(answers)

@app.route("/api/progress")
def get_progress():
    with get_db() as c:
        completed = c.execute("SELECT COUNT(*) FROM lesson_progress WHERE completed=1").fetchone()[0]
        stats = c.execute("SELECT COUNT(*), MAX(percentage), AVG(percentage) FROM quiz_attempts").fetchone()
    total = len(LESSONS)
    return jsonify({
        "total_lessons": total, "completed_lessons": completed,
        "remaining_lessons": max(0, total-completed),
        "completion_percentage": round(completed/total*100, 1),
        "quiz_attempts": stats[0] or 0,
        "best_quiz_score": round(stats[1] or 0, 1),
        "average_quiz_score": round(stats[2] or 0, 1)
    })

@app.route("/api/journal", methods=["GET", "POST", "DELETE"])
def journal():
    if request.method == "GET":
        with get_db() as c:
            rows = c.execute("""SELECT id, entry_date, subject, concept, settings,
                went_well, improve, next_goal, created_at FROM photo_journal
                ORDER BY created_at DESC""").fetchall()
        return jsonify({"entries": [dict(r) for r in rows]})
    if request.method == "POST":
        d = request.get_json(silent=True) or {}
        with get_db() as c:
            cur = c.execute("""INSERT INTO photo_journal
                (entry_date,subject,concept,settings,went_well,improve,next_goal)
                VALUES (?,?,?,?,?,?,?)""",
                (d.get("entry_date"), d.get("subject"), d.get("concept"),
                 d.get("settings"), d.get("went_well"), d.get("improve"),
                 d.get("next_goal")))
            entry_id = cur.lastrowid
        return jsonify({"success": True, "id": entry_id}), 201
    entry_id = request.args.get("id")
    if not entry_id:
        return jsonify({"error": "id required"}), 400
    with get_db() as c:
        c.execute("DELETE FROM photo_journal WHERE id=?", (entry_id,))
    return jsonify({"success": True})

@app.route("/api/journal/<int:entry_id>", methods=["DELETE"])
def delete_journal_entry(entry_id):
    with get_db() as c:
        c.execute("DELETE FROM photo_journal WHERE id=?", (entry_id,))
    return jsonify({"success": True})

@app.route("/api/challenges")
def get_challenges():
    return jsonify({"challenges": CHALLENGES})

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def server_error(error):
    app.logger.exception("Unhandled server error")
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=False)
