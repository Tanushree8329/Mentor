
const $ = (id) => document.getElementById(id);

async function api(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed");
    return data;
}

function showMessage(element, message) {
    if (element) element.innerHTML = `<p>${message}</p>`;
}

window.navigateTo = function (sectionId) {
    document.querySelectorAll(".section").forEach(section => {
        section.classList.toggle("active", section.id === sectionId);
    });
    document.querySelectorAll(".nav-link").forEach(button => {
        button.classList.toggle("active", button.dataset.section === sectionId);
    });

    if (sectionId === "library") loadLessons();
    if (sectionId === "composition") loadComposition();
    if (sectionId === "progress") loadProgress();
    if (sectionId === "journal") loadJournal();
    if (sectionId === "challenges") loadChallenges();

    window.scrollTo({ top: 0, behavior: "smooth" });
};

async function loadLessons(category = "all") {
    const container = $("lessons-container");
    if (!container) return;
    container.innerHTML = "<p>Loading lessons...</p>";

    try {
        const data = await api("/api/lessons");
        const lessons = data.lessons || [];
        const filtered = category === "all"
            ? lessons
            : lessons.filter(item => item.category.toLowerCase() === category.toLowerCase());

        container.innerHTML = filtered.map(lesson => `
            <article class="feature-card">
                <h3>${lesson.title}</h3>
                <p>${lesson.category}</p>
                <p>${lesson.content}</p>
                <button class="btn-primary" onclick="openLesson('${lesson.id}')">Learn More</button>
                <button class="btn-secondary" onclick="completeLesson('${lesson.id}')">
                    ${lesson.completed ? "Completed" : "Mark Complete"}
                </button>
            </article>
        `).join("") || "<p>No lessons found in this category.</p>";
    } catch (error) {
        showMessage(container, "Could not load lessons: " + error.message);
    }
}

window.openLesson = async function (id) {
    try {
        const data = await api("/api/lessons");
        const lesson = data.lessons.find(item => item.id === id);
        if (!lesson) throw new Error("Lesson not found");

        $("lesson-detail").innerHTML = `
            <h2>${lesson.title}</h2>
            <p><strong>Category:</strong> ${lesson.category}</p>
            <p>${lesson.content}</p>
            <h3>Example</h3>
            <p>${Array.isArray(lesson.examples) ? lesson.examples.join("<br>") : lesson.examples}</p>
            <h3>Practice</h3>
            <p>${Array.isArray(lesson.exercises) ? lesson.exercises.join("<br>") : lesson.exercises}</p>
            <button class="btn-primary" onclick="completeLesson('${lesson.id}')">Mark Complete</button>
        `;
        $("lesson-modal").classList.add("active");
    } catch (error) {
        alert(error.message);
    }
};

window.closeLessonModal = function () {
    $("lesson-modal")?.classList.remove("active");
};

window.completeLesson = async function (id) {
    try {
        await api("/api/lesson/complete", {
            method: "POST",
            body: JSON.stringify({ lesson_id: id })
        });
        alert("Lesson marked complete!");
        closeLessonModal();
        loadLessons();
        loadProgress();
    } catch (error) {
        alert("Could not save progress: " + error.message);
    }
};

async function loadComposition() {
    const container = $("composition-container");
    if (!container) return;

    try {
        const data = await api("/api/composition");
        container.innerHTML = (data.principles || []).map(item => `
            <article class="feature-card">
                <h3>${item.title}</h3>
                <p>${item.definition}</p>
                <button class="btn-primary" onclick="openComposition('${item.id}')">Explore Principle</button>
            </article>
        `).join("") || "<p>No principles available.</p>";
    } catch (error) {
        showMessage(container, "Could not load composition: " + error.message);
    }
}

window.openComposition = async function (id) {
    try {
        const data = await api("/api/composition");
        const item = data.principles.find(p => p.id === id);
        if (!item) throw new Error("Principle not found");

        $("composition-detail").innerHTML = `
            <h2>${item.title}</h2>
            <p>${item.definition}</p>
            <h3>Why it works</h3><p>${item.why_it_works || ""}</p>
            <h3>When to use it</h3><p>${item.when_to_use || ""}</p>
            <h3>Example</h3><p>${item.example || ""}</p>
            <h3>Practice exercise</h3><p>${item.exercise || ""}</p>
            <h3>Common mistakes</h3><p>${item.common_mistakes || ""}</p>
        `;
        $("composition-modal").classList.add("active");
    } catch (error) {
        alert(error.message);
    }
};

window.closeCompositionModal = function () {
    $("composition-modal")?.classList.remove("active");
};

window.calculateExposure = async function () {
    const result = $("exposure-result");
    try {
        const data = await api("/api/exposure/calculate", {
            method: "POST",
            body: JSON.stringify({
                aperture: Number($("aperture-select").value),
                shutter_speed: Number($("shutter-select").value),
                iso: Number($("iso-select").value),
                lighting: $("lighting-select").value
            })
        });
        result.innerHTML = `
            <h3>Exposure Result</h3>
            <p>Aperture: f/${data.aperture}</p>
            <p>Shutter speed: ${data.shutter_speed}</p>
            <p>ISO: ${data.iso}</p>
            <p>Exposure value: ${data.exposure_value}</p>
            <p>${data.explanation || ""}</p>
            <p>${data.warning || ""}</p>
        `;
    } catch (error) {
        showMessage(result, "Exposure calculation failed: " + error.message);
    }
};

window.getAdvice = async function () {
    const result = $("advice-result");
    try {
        const data = await api("/api/settings/advise", {
            method: "POST",
            body: JSON.stringify({
                subject: $("subject-select").value,
                lighting: $("lighting2-select").value,
                effect: $("effect-select").value
            })
        });
        result.innerHTML = `
            <h3>Recommended Camera Settings</h3>
            <p>Aperture: ${data.recommended_aperture}</p>
            <p>Shutter speed: ${data.recommended_shutter}</p>
            <p>ISO: ${data.recommended_iso}</p>
            <p>${data.explanation || ""}</p>
            <ul>${(data.tips || []).map(tip => `<li>${tip}</li>`).join("")}</ul>
        `;
    } catch (error) {
        showMessage(result, "Could not get recommendations: " + error.message);
    }
};

let quizQuestions = [];

window.startQuiz = async function () {
    const container = $("quiz-container");
    try {
        const data = await api("/api/quiz");
        quizQuestions = data.questions || [];
        if (!quizQuestions.length) throw new Error("No quiz questions available.");

        container.innerHTML = `
            <form id="quiz-form">
                ${quizQuestions.map((q, i) => `
                    <div class="feature-card">
                        <h3>${i + 1}. ${q.question}</h3>
                        ${q.options.map((option, j) => `
                            <label style="display:block;margin:10px 0">
                                <input type="radio" name="q${i}" value="${j}" required>
                                ${option}
                            </label>
                        `).join("")}
                    </div>
                `).join("")}
                <button class="btn-primary" type="submit">Submit Quiz</button>
            </form>
        `;

        $("quiz-form").addEventListener("submit", submitQuiz);
    } catch (error) {
        showMessage(container, "Could not start quiz: " + error.message);
    }
};

async function submitQuiz(event) {
    event.preventDefault();
    const answers = quizQuestions.map((q, i) => {
        const selected = document.querySelector(`input[name="q${i}"]:checked`);
        return selected ? Number(selected.value) : -1;
    });

    try {
        const data = await api("/api/quiz/submit", {
            method: "POST",
            body: JSON.stringify({ answers })
        });
        $("quiz-result").style.display = "block";
        $("quiz-result").innerHTML = `
            <h2>Your Score: ${data.score}/${data.total}</h2>
            <p>Percentage: ${data.percentage}%</p>
            <button class="btn-primary" onclick="startQuiz()">Try Again</button>
            ${(data.questions || []).map(q => `
                <article class="feature-card">
                    <h3>${q.question}</h3>
                    <p>Correct answer: ${q.options[q.correct_answer]}</p>
                    <p>${q.explanation || ""}</p>
                </article>
            `).join("")}
        `;
    } catch (error) {
        alert("Could not submit quiz: " + error.message);
    }
}

async function loadProgress() {
    const container = $("progress-stats");
    if (!container) return;

    try {
        const p = await api("/api/progress");
        container.innerHTML = `
            <article class="feature-card"><h3>Total Lessons</h3><p>${p.total_lessons}</p></article>
            <article class="feature-card"><h3>Completed</h3><p>${p.completed_lessons}</p></article>
            <article class="feature-card"><h3>Remaining</h3><p>${p.remaining_lessons}</p></article>
            <article class="feature-card"><h3>Completion</h3><p>${p.completion_percentage}%</p></article>
            <article class="feature-card"><h3>Quiz Attempts</h3><p>${p.quiz_attempts}</p></article>
            <article class="feature-card"><h3>Best Quiz Score</h3><p>${p.best_quiz_score}%</p></article>
        `;
    } catch (error) {
        showMessage(container, "Could not load progress: " + error.message);
    }
}

window.showJournalForm = function () {
    $("journal-form").style.display = "block";
    if (!$("journal-date").value) {
        $("journal-date").value = new Date().toISOString().slice(0, 10);
    }
};

window.hideJournalForm = function () {
    $("journal-form").style.display = "none";
};

window.saveJournalEntry = async function () {
    const entry = {
        entry_date: $("journal-date").value,
        subject: $("journal-subject").value,
        concept: $("journal-concept").value,
        settings: $("journal-settings").value,
        went_well: $("journal-well").value,
        improve: $("journal-improve").value,
        next_goal: $("journal-goal").value
    };

    try {
        await api("/api/journal", {
            method: "POST",
            body: JSON.stringify(entry)
        });
        alert("Journal entry saved!");
        hideJournalForm();
        loadJournal();
    } catch (error) {
        alert("Could not save journal entry: " + error.message);
    }
};

async function loadJournal() {
    const container = $("journal-entries");
    if (!container) return;

    try {
        const data = await api("/api/journal");
        container.innerHTML = (data.entries || []).map(entry => `
            <article class="feature-card">
                <h3>${entry.subject}</h3>
                <p>${entry.entry_date || ""} — ${entry.concept || ""}</p>
                <p>Settings: ${entry.settings || "Not recorded"}</p>
                <p>Went well: ${entry.went_well || ""}</p>
                <p>Improve: ${entry.improve || ""}</p>
                <p>Next goal: ${entry.next_goal || ""}</p>
                <button class="btn-secondary" onclick="deleteJournalEntry(${entry.id})">Delete Entry</button>
            </article>
        `).join("") || "<p>No journal entries yet. Add your first practice session!</p>";
    } catch (error) {
        showMessage(container, "Could not load journal: " + error.message);
    }
}

window.deleteJournalEntry = async function (id) {
    if (!confirm("Delete this journal entry?")) return;
    try {
        await api("/api/journal?id=" + encodeURIComponent(id), { method: "DELETE" });
        loadJournal();
    } catch (error) {
        alert("Could not delete entry: " + error.message);
    }
};

async function loadChallenges() {
    const container = $("challenges-container");
    if (!container) return;

    try {
        const data = await api("/api/challenges");
        container.innerHTML = (data.challenges || []).map(challenge => `
            <article class="feature-card">
                <h3>${challenge.title}</h3>
                <p>${challenge.category} · ${challenge.difficulty}</p>
                <p>${challenge.description}</p>
            </article>
        `).join("") || "<p>No challenges available.</p>";
    } catch (error) {
        showMessage(container, "Could not load challenges: " + error.message);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".nav-link").forEach(button => {
        button.addEventListener("click", () => navigateTo(button.dataset.section));
    });

    document.querySelectorAll(".filter-btn").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            button.classList.add("active");
            loadLessons(button.dataset.category || "all");
        });
    });

    loadLessons();
    loadComposition();
    loadProgress();
    loadJournal();
    loadChallenges();
});
