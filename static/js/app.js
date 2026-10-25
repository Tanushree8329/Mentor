
from flask import Flask, jsonify, render_template, request
from pathlib import Path
from datetime import date
import math
import os
import sqlite3

# =========================================================
# PHOTOMENTOR 2.0 - FLASK BACKEND
# This version does not require a compiled C++ executable.
# =========================================================

ROOT = Path(__file__).resolve().parent

if os.environ.get("VERCEL"):
    DB_PATH = Path("/tmp/photomentor.db")
else:
    DB_PATH = Path(os.environ.get(
        "PHOTOMENTOR_DB",
        str(ROOT / "data" / "photomentor.db")
    ))

app = Flask(
    __name__,
    template_folder=str(ROOT / "templates"),
    static_folder=str(ROOT / "static")
)
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024


# =========================================================
# LESSON CONTENT
# Frontend fields: id, title, category, content, examples,
# exercises, completed
# =========================================================

LESSONS = [
    {
        "id": "aperture",
        "title": "Understanding Aperture",
        "category": "Exposure",
        "content": (
            "Aperture is the opening inside a lens that controls "
            "how much light reaches the camera sensor. It is "
            "measured in f-numbers such as f/1.8, f/4 and f/11. "
            "A smaller f-number means a wider opening and usually "
            "a blurrier background. A larger f-number means a "
            "narrower opening and often greater depth of field."
        ),
        "examples": (
            "Use f/1.8 or f/2.8 for a portrait with a blurred "
            "background. Try f/8 or f/11 for a landscape where "
            "you want more of the scene in focus."
        ),
        "exercises": (
            "Photograph the same subject at the widest and "
            "narrowest apertures available on your camera. "
            "Compare brightness and background blur."
        )
    },
    {
        "id": "shutter-speed",
        "title": "Shutter Speed",
        "category": "Exposure",
        "content": (
            "Shutter speed controls how long the sensor receives "
            "light. Fast shutter speeds, such as 1/1000 second, "
            "help freeze movement. Slow shutter speeds, such as "
            "1/10 second, can create motion blur and may require "
            "a tripod to prevent camera shake."
        ),
        "examples": (
            "Try 1/1000 second for a running person and 1/30 "
            "second for a stationary subject in lower light. "
            "Use a tripod for long exposures."
        ),
        "exercises": (
            "Photograph a moving subject using a fast shutter "
            "speed, then try a slower speed and compare motion."
        )
    },
    {
        "id": "iso",
        "title": "ISO and Image Noise",
        "category": "Exposure",
        "content": (
            "ISO describes the sensor's sensitivity setting in "
            "the exposure system. A higher ISO helps you use "
            "faster shutter speeds or work in darker scenes, but "
            "can introduce more visible image noise. Use the "
            "lowest ISO that still allows the shutter speed and "
            "aperture you need."
        ),
        "examples": (
            "Try ISO 100 outdoors in bright light and ISO 1600 "
            "indoors when more sensitivity is needed."
        ),
        "exercises": (
            "Photograph the same stationary subject at ISO 100, "
            "800 and 1600. Zoom in and compare noise."
        )
    },
    {
        "id": "exposure-triangle",
        "title": "The Exposure Triangle",
        "category": "Exposure",
        "content": (
            "Aperture, shutter speed and ISO work together to "
            "control exposure. Changing one setting may require "
            "adjusting another to maintain similar brightness. "
            "Each setting also affects the appearance of the "
            "image, including depth of field, motion and noise."
        ),
        "examples": (
            "If you use a faster shutter speed to freeze action, "
            "you may need a wider aperture or higher ISO."
        ),
        "exercises": (
            "Take three photographs with similar brightness but "
            "different combinations of aperture, shutter speed "
            "and ISO. Compare their visual differences."
        )
    },
    {
        "id": "rule-of-thirds",
        "title": "Rule of Thirds",
        "category": "Composition",
        "content": (
            "The rule of thirds divides the frame into nine "
            "sections using two horizontal and two vertical "
            "lines. Placing a subject near these lines or their "
            "intersections can create a balanced composition. "
            "It is a useful guide, not an unbreakable rule."
        ),
        "examples": (
            "Place a person's eyes near an upper intersection "
            "or position the horizon along the upper or lower "
            "third of a landscape."
        ),
        "exercises": (
            "Take three photographs with the main subject near "
            "different grid intersections."
        )
    },
    {
        "id": "leading-lines",
        "title": "Leading Lines",
        "category": "Composition",
        "content": (
            "Leading lines are visible lines that guide the "
            "viewer's attention through a photograph. Roads, "
            "railings, paths, shadows and buildings can all "
            "create leading lines. They can guide the eye toward "
            "the main subject or add a sense of depth."
        ),
        "examples": (
            "Use a path that leads toward a person or a railing "
            "that draws attention to a building."
        ),
        "exercises": (
            "Find three scenes with natural or man-made lines. "
            "Photograph each so the lines lead toward a subject."
        )
    },
    {
        "id": "lighting",
        "title": "Understanding Light",
        "category": "Light & Colour",
        "content": (
            "Light affects brightness, contrast, colour and "
            "mood. Soft light creates gradual shadows, while "
            "hard light creates sharper shadows. The direction "
            "of light can reveal texture, shape and depth."
        ),
        "examples": (
            "Window light can create soft portraits. Side light "
            "can reveal texture in buildings or objects."
        ),
        "exercises": (
            "Photograph one object in front light, side light "
            "and backlight. Compare the results."
        )
    },
    {
        "id": "white-balance",
        "title": "White Balance",
        "category": "Light & Colour",
        "content": (
            "White balance adjusts the colour cast caused by "
            "different light sources. Warm indoor lights can "
            "make a photograph look orange, while some daylight "
            "or shade can appear blue. Auto white balance works "
            "in many situations, but presets or manual settings "
            "can give more consistent colour."
        ),
        "examples": (
            "Try the daylight preset outdoors and the tungsten "
            "preset under warm indoor lighting."
        ),
        "exercises": (
            "Photograph the same subject using auto, daylight "
            "and shade white balance. Compare colour."
        )
    },
    {
        "id": "focal-length",
        "title": "Focal Length and Perspective",
        "category": "Lenses",
        "content": (
            "Focal length, measured in millimetres, affects "
            "the angle of view and how large subjects appear "
            "in the frame. Wide-angle lenses include more of "
            "a scene, while longer lenses show a narrower view. "
            "Perspective changes primarily with camera position."
        ),
        "examples": (
            "Use a wide lens for a room or landscape and a "
            "longer focal length for a tightly framed portrait."
        ),
        "exercises": (
            "Photograph the same subject with different focal "
            "lengths. Compare framing and your camera distance."
        )
    },
    {
        "id": "depth-of-field",
        "title": "Depth of Field",
        "category": "Lenses",
        "content": (
            "Depth of field is the distance range that appears "
            "acceptably sharp. It is influenced by aperture, "
            "focal length, subject distance and sensor format. "
            "A shallow depth of field can separate a subject "
            "from the background, while a deeper one can keep "
            "more of a scene sharp."
        ),
        "examples": (
            "Try a wide aperture for a close portrait and a "
            "narrower aperture for a detailed landscape."
        ),
        "exercises": (
            "Photograph a nearby object with a distant "
            "background using two aperture settings."
        )
    },
    {
        "id": "focus",
        "title": "Focus and Sharpness",
        "category": "Camera Skills",
        "content": (
            "Focus determines which part of the image appears "
            "sharpest. Single autofocus is useful for stationary "
            "subjects, while continuous autofocus can track "
            "moving subjects. A suitable focus point and a "
            "steady camera help improve sharpness."
        ),
        "examples": (
            "Focus on a person's nearest eye for a portrait. "
            "Use continuous autofocus for a moving subject."
        ),
        "exercises": (
            "Photograph a stationary subject and a moving "
            "subject. Experiment with focus modes if available."
        )
    },
    {
        "id": "portrait-photography",
        "title": "Portrait Photography",
        "category": "Photography Genres",
        "content": (
            "Portrait photography aims to communicate a person's "
            "appearance, character or mood. Consider light, "
            "background, pose, eye focus and framing. Clear "
            "communication with the subject often improves "
            "comfort and expression."
        ),
        "examples": (
            "Use open shade for gentle light and a simple "
            "background to keep attention on the person."
        ),
        "exercises": (
            "Make three portraits using different lighting "
            "directions and backgrounds."
        )
    }
]


# =========================================================
# COMPOSITION PRINCIPLES
# =========================================================

PRINCIPLES = [
    {
        "id": "thirds",
        "title": "Rule of Thirds",
        "definition": "Place important elements near grid lines or intersections.",
        "why_it_works": "It can create balance and guide attention.",
        "when_to_use": "Portraits, landscapes and everyday scenes.",
        "example": "Place a person's eyes near an upper intersection.",
        "exercise": "Take three photographs using different grid positions.",
        "common_mistakes": "Placing every subject in the same position without considering the scene.",
        "breaking_rule": "Centre a subject deliberately for symmetry or impact."
    },
    {
        "id": "leading-lines",
        "title": "Leading Lines",
        "definition": "Use lines to guide attention through the image.",
        "why_it_works": "Lines create visual direction and can suggest depth.",
        "when_to_use": "Roads, paths, architecture and landscapes.",
        "example": "Frame a path so it leads toward a person.",
        "exercise": "Find three lines that lead toward a clear subject.",
        "common_mistakes": "Using lines that lead the eye away from the main subject.",
        "breaking_rule": "Use crossing lines to create tension or complexity."
    },
    {
        "id": "framing",
        "title": "Natural Framing",
        "definition": "Use objects around a subject to create a frame within the frame.",
        "why_it_works": "It separates the subject and adds depth.",
        "when_to_use": "Doorways, windows, branches and architecture.",
        "example": "Photograph a person through a doorway.",
        "exercise": "Find a foreground object that frames your subject.",
        "common_mistakes": "Letting the frame block important parts of the subject.",
        "breaking_rule": "Use an incomplete frame for a more open composition."
    },
    {
        "id": "negative-space",
        "title": "Negative Space",
        "definition": "Leave uncluttered space around the main subject.",
        "why_it_works": "It can make the subject stand out and create a calm mood.",
        "when_to_use": "Minimalist images, portraits and product photographs.",
        "example": "Place a small subject against a plain wall.",
        "exercise": "Photograph a subject with both a busy and a simple background.",
        "common_mistakes": "Leaving space that does not support the composition.",
        "breaking_rule": "Fill the frame when detail, energy or pattern is the goal."
    },
    {
        "id": "symmetry",
        "title": "Symmetry and Patterns",
        "definition": "Use repeated shapes or balanced elements in a frame.",
        "why_it_works": "Repetition can create rhythm, order and visual impact.",
        "when_to_use": "Architecture, reflections and repeated objects.",
        "example": "Photograph a building from its central axis.",
        "exercise": "Find a symmetrical scene and then make an intentionally asymmetrical frame.",
        "common_mistakes": "Ignoring small distractions that disrupt the pattern.",
        "breaking_rule": "Introduce one different element to interrupt a pattern."
    }
]


# =========================================================
# QUIZ QUESTIONS
# correct_answer is the zero-based option index expected
# by static/js/app.js.
# =========================================================

QUIZ = [
    {
        "id": "q1",
        "question": "What does a wider aperture usually do?",
        "options": [
            "Lets in more light",
            "Lets in less light",
            "Always freezes motion",
            "Changes the memory card"
        ],
        "correct_answer": 0,
        "explanation": "A wider aperture has a smaller f-number and lets in more light."
    },
    {
        "id": "q2",
        "question": "Which shutter speed is best suited to freezing fast action?",
        "options": [
            "1 second",
            "1/10 second",
            "1/1000 second",
            "10 seconds"
        ],
        "correct_answer": 2,
        "explanation": "A fast shutter speed reduces the time movement is recorded."
    },
    {
        "id": "q3",
        "question": "What is a common disadvantage of very high ISO?",
        "options": [
            "More image noise",
            "A wider lens",
            "A smaller memory card",
            "Automatic cropping"
        ],
        "correct_answer": 0,
        "explanation": "Higher ISO can make image noise more visible."
    },
    {
        "id": "q4",
        "question": "What is the rule of thirds used for?",
        "options": [
            "Charging a camera",
            "Composing a photograph",
            "Cleaning a lens",
            "Formatting a memory card"
        ],
        "correct_answer": 1,
        "explanation": "The rule of thirds helps position important elements in the frame."
    },
    {
        "id": "q5",
        "question": "What is white balance designed to adjust?",
        "options": [
            "Colour cast",
            "Shutter durability",
            "Focal length",
            "Memory capacity"
        ],
        "correct_answer": 0,
        "explanation": "White balance adjusts colour to account for different light sources."
    },
    {
        "id": "q6",
        "question": "Which technique can guide the viewer's eye toward a subject?",
        "options": [
            "Leading lines",
            "High ISO",
            "Digital zoom only",
            "A larger memory card"
        ],
        "correct_answer": 0,
        "explanation": "Leading lines direct attention through the image."
    },
    {
        "id": "q7",
        "question": "What does a shallow depth of field often create?",
        "options": [
            "A blurred background",
            "A larger file system",
            "A faster memory card",
            "A wider horizon"
        ],
        "correct_answer": 0,
        "explanation": "Shallow depth of field keeps a smaller distance range acceptably sharp."
    },
    {
        "id": "q8",
        "question": "Which setting controls how long light reaches the sensor?",
        "options": [
            "White balance",
            "Shutter speed",
            "Focal length",
            "File name"
        ],
        "correct_answer": 1,
        "explanation": "Shutter speed controls exposure time."
    }
]


# =========================================================
# CAMERA SETTINGS ADVICE
# =========================================================

def get_camera_advice(subject, lighting, effect):
    aperture = "f/5.6"
    shutter = "1/125 sec"
    iso = 100
    tips = "Check focus and review the image after taking the shot."

    if subject == "portrait":
        aperture = "f/2.8"
        shutter = "1/200 sec"
        iso = 100 if lighting == "bright" else 400
        tips = "Focus on the nearest eye and keep the background simple."

    elif subject == "landscape":
        aperture = "f/8"
        shutter = "1/125 sec"
        iso = 100
        tips = "Use a tripod if the shutter speed becomes too slow."

    elif subject == "action":
        aperture = "f/2.8"
        shutter = "1/1000 sec"
        iso = 800 if lighting in {"low", "normal"} else 200
        tips = "Use continuous autofocus and a fast shutter speed."

    elif subject == "night":
        aperture = "f/1.8"
        shutter = "1/30 sec"
        iso = 1600
        tips = "Stabilise the camera and check highlights for clipping."

    elif subject == "street":
        aperture = "f/5.6"
        shutter = "1/250 sec"
        iso = 400 if lighting == "low" else 100
        tips = "Watch the edges of the frame and anticipate moments."

    elif subject == "macro":
        aperture = "f/8"
        shutter = "1/200 sec"
        iso = 400 if lighting == "low" else 100
        tips = "Focus carefully; depth of field is often very shallow close up."

    if lighting == "low":
        iso = max(iso, 800)
        tips += " Low light may require a higher ISO or additional light."
    elif lighting == "bright":
        iso = min(iso, 100)
        tips += " In bright light, protect highlights from overexposure."

    if effect == "blur":
        if subject in {"portrait", "macro"}:
            aperture = "f/1.8"
        tips += " Use a wider aperture and separate the subject from the background."

    elif effect == "sharp":
        aperture = "f/8" if subject != "action" else "f/5.6"
        tips += " Keep the camera steady and use an appropriate focus mode."

    explanation = (
        "These settings are starting points. Aperture affects depth "
        "of field, shutter speed affects motion, and ISO affects "
        "sensitivity and image noise. Adjust them for your scene."
    )

    return {
        "subject": subject,
        "lighting": lighting,
        "effect": effect,
        "recommended_aperture": aperture,
        "recommended_shutter": shutter,
        "recommended_iso": iso,
        "explanation": explanation,
        "tips": tips
    }


# =========================================================
# EXPOSURE CALCULATION
# =========================================================

def calculate_exposure_value(aperture, shutter, iso, lighting):
    # EV at ISO 100: log2(aperture^2 / shutter time)
    ev100 = math.log2((aperture * aperture) / shutter)
    ev_adjusted = ev100 - math.log2(iso / 100.0)

    # A simplified educational reference, not a light-meter reading.
    reference_ev = {
        "very_low": 4.0,
        "low": 6.0,
        "normal": 10.0,
        "bright": 14.0
    }.get(lighting, 10.0)

    stops = ev_adjusted - reference_ev

    explanation = (
        f"The calculated exposure value at ISO 100 is {ev100:.2f}. "
        "Aperture, shutter time and ISO work together to affect "
        "exposure. The scene reference is simplified and does not "
        "replace a camera light meter."
    )

    warning = ""
    if shutter < 1 / 60:
        warning = "A slow shutter speed may cause camera shake."
    if iso >= 3200:
        warning = "High ISO may make image noise more visible."

    return {
        "aperture": f"f/{aperture:g}",
        "shutter_speed": f"1/{round(1 / shutter)} sec"
            if shutter < 1 else f"{shutter:g} sec",
        "iso": iso,
        "lighting": lighting,
        "exposure_value": ev_adjusted,
        "stops_from_reference": -stops,
        "explanation": explanation,
        "warning": warning
    }


# =========================================================
# DATABASE
# =========================================================

def get_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH), timeout=10)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS lesson_progress (
                lesson_id TEXT PRIMARY KEY,
                completed INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS quiz_attempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                score INTEGER NOT NULL,
                total INTEGER NOT NULL,
                percentage REAL NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS journal_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entry_date TEXT NOT NULL,
                subject TEXT NOT NULL,
                concept TEXT NOT NULL,
                settings TEXT NOT NULL DEFAULT '',
                went_well TEXT NOT NULL DEFAULT '',
                improve TEXT NOT NULL DEFAULT '',
                next_goal TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        """)


def ensure_db():
    if not getattr(app, "_database_ready", False):
        init_db()
        app._database_ready = True


@app.before_request
def prepare_database():
    ensure_db()


# =========================================================
# HOME AND HEALTH
# =========================================================

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/health")
def health():
    return jsonify({"status": "ok", "application": "PhotoMentor 2.0"})


# =========================================================
# LESSON API
# =========================================================

@app.route("/api/lessons", methods=["GET"])
def api_lessons():
    category = request.args.get("category", "all").strip()

    with get_db() as conn:
        rows = conn.execute(
            "SELECT lesson_id FROM lesson_progress WHERE completed = 1"
        ).fetchall()

    completed_ids = {row["lesson_id"] for row in rows}
    lessons = []

    for lesson in LESSONS:
        if category not in {"", "all"} and lesson["category"].lower() != category.lower():
            continue

        item = dict(lesson)
        item["completed"] = item["id"] in completed_ids
        lessons.append(item)

    return jsonify({"lessons": lessons})


@app.route("/api/lesson/complete", methods=["POST"])
def complete_lesson():
    data = request.get_json(silent=True) or {}
    lesson_id = str(data.get("lesson_id", "")).strip()

    if not any(lesson["id"] == lesson_id for lesson in LESSONS):
        return jsonify({"error": "Lesson not found."}), 404

    with get_db() as conn:
        conn.execute("""
            INSERT INTO lesson_progress (lesson_id, completed)
            VALUES (?, 1)
            ON CONFLICT(lesson_id) DO UPDATE SET completed = 1
        """, (lesson_id,))

    return jsonify({"ok": True})


# =========================================================
# COMPOSITION API
# =========================================================

@app.route("/api/composition", methods=["GET"])
def api_composition():
    return jsonify({"principles": PRINCIPLES})


# =========================================================
# EXPOSURE API
# =========================================================

@app.route("/api/exposure/calculate", methods=["POST"])
def api_exposure():
    data = request.get_json(silent=True) or {}

    try:
        aperture = float(data.get("aperture", 4))
        shutter = float(data.get("shutter_speed", 1 / 125))
        iso = int(data.get("iso", 100))
    except (TypeError, ValueError):
        return jsonify({"error": "Use numeric exposure settings."}), 400

    lighting = str(data.get("lighting", "normal"))

    if not 0.7 <= aperture <= 64:
        return jsonify({"error": "Aperture must be between 0.7 and 64."}), 400

    if not 1 / 8000 <= shutter <= 30:
        return jsonify({"error": "Shutter speed is outside the supported range."}), 400

    if not 25 <= iso <= 102400:
        return jsonify({"error": "ISO is outside the supported range."}), 400

    if lighting not in {"very_low", "low", "normal", "bright"}:
        lighting = "normal"

    return jsonify(
        calculate_exposure_value(aperture, shutter, iso, lighting)
    )


# =========================================================
# CAMERA ADVISOR API
# =========================================================

@app.route("/api/settings/advise", methods=["POST"])
def api_settings_advice():
    data = request.get_json(silent=True) or {}

    subject = str(data.get("subject", "portrait")).lower()
    lighting = str(data.get("lighting", "normal")).lower()
    effect = str(data.get("effect", "natural")).lower()

    if subject not in {"portrait", "landscape", "action", "night", "street", "macro"}:
        return jsonify({"error": "Choose a valid subject."}), 400

    if lighting not in {"low", "normal", "bright", "moving"}:
        return jsonify({"error": "Choose a valid lighting condition."}), 400

    if effect not in {"blur", "natural", "sharp"}:
        return jsonify({"error": "Choose a valid effect."}), 400

    return jsonify(get_camera_advice(subject, lighting, effect))


# =========================================================
# QUIZ API
# =========================================================

@app.route("/api/quiz", methods=["GET"])
def api_quiz():
    # Do not expose correct answers before submission.
    questions = []
    for item in QUIZ:
        questions.append({
            "id": item["id"],
            "question": item["question"],
            "options": item["options"]
        })
    return jsonify({"questions": questions})


@app.route("/api/quiz/submit", methods=["POST"])
def submit_quiz():
    data = request.get_json(silent=True) or {}
    answers = data.get("answers")

    if not isinstance(answers, list):
        return jsonify({"error": "Answers must be submitted as a list."}), 400

    if len(answers) != len(QUIZ):
        return jsonify({
            "error": f"Please answer all {len(QUIZ)} questions."
        }), 400

    try:
        answers = [int(answer) for answer in answers]
    except (TypeError, ValueError):
        return jsonify({"error": "Answers must be option numbers."}), 400

    if any(answer < 0 or answer >= 4 for answer in answers):
        return jsonify({"error": "An answer is outside the valid options."}), 400

    review = []
    score = 0

    for index, question in enumerate(QUIZ):
        correct = answers[index] == question["correct_answer"]
        if correct:
            score += 1

        review.append({
            "id": question["id"],
            "question": question["question"],
            "options": question["options"],
            "correct_answer": question["correct_answer"],
            "explanation": question["explanation"]
        })

    total = len(QUIZ)
    percentage = score / total * 100 if total else 0

    with get_db() as conn:
        conn.execute("""
            INSERT INTO quiz_attempts (score, total, percentage)
            VALUES (?, ?, ?)
        """, (score, total, percentage))

    return jsonify({
        "score": score,
        "total": total,
        "percentage": percentage,
        "questions": review
    })


# =========================================================
# PROGRESS API
# =========================================================

@app.route("/api/progress", methods=["GET"])
def api_progress():
    with get_db() as conn:
        completed = conn.execute("""
            SELECT COUNT(*) AS count
            FROM lesson_progress
            WHERE completed = 1
        """).fetchone()["count"]

        attempts = conn.execute("""
            SELECT COUNT(*) AS count,
                   COALESCE(MAX(percentage), 0) AS best_score
            FROM quiz_attempts
        """).fetchone()

    total = len(LESSONS)
    completed = min(completed, total)
    attempt_count = attempts["count"]

    return jsonify({
        "total_lessons": total,
        "completed_lessons": completed,
        "remaining_lessons": total - completed,
        "completion_percentage": round(completed / total * 100)
            if total else 0,
        "quiz_attempts": attempt_count,
        "best_quiz_score": round(attempts["best_score"], 1)
    })


# =========================================================
# PHOTO JOURNAL API
# Frontend uses entry_date, subject, concept, settings,
# went_well, improve and next_goal.
# =========================================================

@app.route("/api/journal", methods=["GET", "POST", "DELETE"])
def api_journal():
    if request.method == "GET":
        with get_db() as conn:
            rows = conn.execute("""
                SELECT id, entry_date, subject, concept, settings,
                       went_well, improve, next_goal, created_at
                FROM journal_entries
                ORDER BY entry_date DESC, id DESC
            """).fetchall()

        return jsonify({"entries": [dict(row) for row in rows]})

    if request.method == "DELETE":
        entry_id = request.args.get("id", type=int)
        if entry_id is None:
            return jsonify({"error": "Journal entry ID is required."}), 400

        with get_db() as conn:
            cursor = conn.execute(
                "DELETE FROM journal_entries WHERE id = ?",
                (entry_id,)
            )

        if cursor.rowcount == 0:
            return jsonify({"error": "Journal entry not found."}), 404

        return jsonify({"ok": True})

    data = request.get_json(silent=True) or {}

    entry_date = str(data.get("entry_date", "")).strip()
    subject = str(data.get("subject", "")).strip()[:150]
    concept = str(data.get("concept", "")).strip()[:500]
    settings = str(data.get("settings", "")).strip()[:300]
    went_well = str(data.get("went_well", "")).strip()[:2000]
    improve = str(data.get("improve", "")).strip()[:2000]
    next_goal = str(data.get("next_goal", "")).strip()[:1000]

    if not entry_date or not subject or not concept:
        return jsonify({
            "error": "Date, subject and concept are required."
        }), 400

    try:
        date.fromisoformat(entry_date)
    except ValueError:
        return jsonify({"error": "Use a valid YYYY-MM-DD date."}), 400

    with get_db() as conn:
        cursor = conn.execute("""
            INSERT INTO journal_entries (
                entry_date, subject, concept, settings,
                went_well, improve, next_goal
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            entry_date, subject, concept, settings,
            went_well, improve, next_goal
        ))

        entry_id = cursor.lastrowid

    return jsonify({"ok": True, "id": entry_id}), 201


# =========================================================
# CHALLENGES API
# =========================================================

CHALLENGES = [
    {
        "id": "challenge-1",
        "title": "Find the Leading Lines",
        "difficulty": "Beginner",
        "category": "Composition",
        "description": "Photograph a path, railing or road that leads the eye toward a subject."
    },
    {
        "id": "challenge-2",
        "title": "One Subject, Three Exposures",
        "difficulty": "Beginner",
        "category": "Exposure",
        "description": "Photograph one stationary subject using three different exposure combinations."
    },
    {
        "id": "challenge-3",
        "title": "Light and Shadow",
        "difficulty": "Intermediate",
        "category": "Light & Colour",
        "description": "Create a photograph in which shadows contribute to the composition."
    },
    {
        "id": "challenge-4",
        "title": "Background Separation",
        "difficulty": "Beginner",
        "category": "Lenses",
        "description": "Make a subject stand out by changing distance, aperture or background."
    },
    {
        "id": "challenge-5",
        "title": "Everyday Portrait",
        "difficulty": "Intermediate",
        "category": "Photography Genres",
        "description": "Create a portrait using thoughtful light, background and eye focus."
    }
]


@app.route("/api/challenges", methods=["GET"])
def api_challenges():
    return jsonify({"challenges": CHALLENGES})


# =========================================================
# LOCAL DEVELOPMENT
# =========================================================

if __name__ == "__main__":
    init_db()
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", "5000")),
        debug=False
    )
