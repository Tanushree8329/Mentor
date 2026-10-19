// PhotoMentor 2.0 - Frontend Application

// ========== NAVIGATION ==========
function navigateTo(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        window.scrollTo(0, 0);
        
        // Load section data if needed
        if (sectionId === 'library') {
            loadLessons('all');
        } else if (sectionId === 'composition') {
            loadComposition();
        } else if (sectionId === 'progress') {
            loadProgress();
        } else if (sectionId === 'journal') {
            loadJournal();
        } else if (sectionId === 'challenges') {
            loadChallenges();
        }
    }
}

// Navigation button handlers
document.querySelectorAll('.nav-link').forEach(button => {
    button.addEventListener('click', () => {
        navigateTo(button.dataset.section);
    });
});

// ========== LESSONS ==========
let allLessons = [];

async function loadLessons(category = 'all') {
    const container = document.getElementById('lessons-container');
    container.innerHTML = '<div class="loading">Loading lessons...</div>';
    
    try {
        const response = await fetch(`/api/lessons${category !== 'all' ? '?category=' + category : ''}`);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            container.innerHTML = `<div class="error-state">Error loading lessons: ${data.error}</div>`;
            return;
        }
        
        allLessons = data.lessons || [];
        
        if (allLessons.length === 0) {
            container.innerHTML = '<div class="empty-state">No lessons found in this category.</div>';
            return;
        }
        
        renderLessons(allLessons);
        
    } catch (error) {
        console.error('Failed to load lessons:', error);
        container.innerHTML = `<div class="error-state">Failed to load lessons. Please check that the backend is running and the C++ engine is compiled.</div>`;
    }
}

function renderLessons(lessons) {
    const container = document.getElementById('lessons-container');
    
    container.innerHTML = lessons.map(lesson => `
        <div class="lesson-card">
            <h3>${lesson.title}</h3>
            <span class="lesson-category">${lesson.category}</span>
            <p class="lesson-excerpt">${lesson.content.substring(0, 150)}...</p>
            <div class="card-actions">
                <button class="btn-small btn-view" onclick="viewLesson('${lesson.id}')">View Lesson</button>
                ${lesson.completed 
                    ? '<button class="btn-small btn-completed">✓ Completed</button>'
                    : `<button class="btn-small btn-complete" onclick="completeLesson('${lesson.id}')">Mark Complete</button>`
                }
            </div>
        </div>
    `).join('');
}

function viewLesson(lessonId) {
    const lesson = allLessons.find(l => l.id === lessonId);
    if (!lesson) return;
    
    const modal = document.getElementById('lesson-modal');
    const detail = document.getElementById('lesson-detail');
    
    detail.innerHTML = `
        <h2>${lesson.title}</h2>
        <span class="lesson-category">${lesson.category}</span>
        
        <h4>Understanding ${lesson.title}</h4>
        <p>${lesson.content}</p>
        
        <h4>Examples</h4>
        <p>${lesson.examples}</p>
        
        <h4>Practice Exercise</h4>
        <p>${lesson.exercises}</p>
        
        <div style="margin-top: 32px;">
            ${lesson.completed 
                ? '<button class="btn-secondary">✓ Already Completed</button>'
                : `<button class="btn-primary" onclick="completeLesson('${lesson.id}'); closeLessonModal();">Mark as Complete</button>`
            }
        </div>
    `;
    
    modal.classList.add('active');
}

function closeLessonModal() {
    document.getElementById('lesson-modal').classList.remove('active');
}

async function completeLesson(lessonId) {
    try {
        const response = await fetch('/api/lesson/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lesson_id: lessonId })
        });
        
        if (response.ok) {
            // Reload lessons to update completion status
            const activeFilter = document.querySelector('.filter-btn.active').dataset.category;
            loadLessons(activeFilter);
        }
    } catch (error) {
        console.error('Failed to mark lesson complete:', error);
        alert('Failed to update lesson status');
    }
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        loadLessons(button.dataset.category);
    });
});

// ========== COMPOSITION ==========
let allPrinciples = [];

async function loadComposition() {
    const container = document.getElementById('composition-container');
    container.innerHTML = '<div class="loading">Loading composition principles...</div>';
    
    try {
        const response = await fetch('/api/composition');
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            container.innerHTML = `<div class="error-state">Error loading composition: ${data.error}</div>`;
            return;
        }
        
        allPrinciples = data.principles || [];
        
        if (allPrinciples.length === 0) {
            container.innerHTML = '<div class="empty-state">No composition principles found.</div>';
            return;
        }
        
        container.innerHTML = allPrinciples.map(principle => `
            <div class="composition-card" onclick="viewComposition('${principle.id}')">
                <h3>${principle.title}</h3>
                <p class="composition-excerpt">${principle.definition}</p>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Failed to load composition:', error);
        container.innerHTML = `<div class="error-state">Failed to load composition principles. Please check that the backend is running.</div>`;
    }
}

function viewComposition(principleId) {
    const principle = allPrinciples.find(p => p.id === principleId);
    if (!principle) return;
    
    const modal = document.getElementById('composition-modal');
    const detail = document.getElementById('composition-detail');
    
    detail.innerHTML = `
        <h2>${principle.title}</h2>
        
        <h4>Definition</h4>
        <p>${principle.definition}</p>
        
        <h4>Why It Works</h4>
        <p>${principle.why_it_works}</p>
        
        <h4>When to Use</h4>
        <p>${principle.when_to_use}</p>
        
        <h4>Example</h4>
        <p>${principle.example}</p>
        
        <h4>Practice Exercise</h4>
        <p>${principle.exercise}</p>
        
        <h4>Common Mistakes</h4>
        <p>${principle.common_mistakes}</p>
        
        <h4>Breaking the Rule</h4>
        <p>${principle.breaking_rule}</p>
    `;
    
    modal.classList.add('active');
}

function closeCompositionModal() {
    document.getElementById('composition-modal').classList.remove('active');
}

// ========== EXPOSURE SIMULATOR ==========
async function calculateExposure() {
    const aperture = parseFloat(document.getElementById('aperture-select').value);
    const shutterSpeed = parseFloat(document.getElementById('shutter-select').value);
    const iso = parseInt(document.getElementById('iso-select').value);
    const lighting = document.getElementById('lighting-select').value;
    
    const resultDiv = document.getElementById('exposure-result');
    resultDiv.innerHTML = '<div class="loading">Calculating...</div>';
    
    try {
        const response = await fetch('/api/exposure/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aperture, shutter_speed: shutterSpeed, iso, lighting })
        });
        
        if (!response.ok) {
            throw new Error('Calculation failed');
        }
        
        const data = await response.json();
        
        if (data.error) {
            resultDiv.innerHTML = `<div class="error-state">${data.error}</div>`;
            return;
        }
        
        resultDiv.innerHTML = `
            <h3>Exposure Analysis</h3>
            <div class="result-setting">
                <strong>Settings:</strong> ${data.aperture}, ${data.shutter_speed}, ISO ${data.iso}
            </div>
            <div class="result-setting">
                <strong>Lighting:</strong> ${data.lighting}
            </div>
            <div class="result-setting">
                <strong>Exposure Value:</strong> EV ${data.exposure_value.toFixed(2)}
            </div>
            <div class="result-setting">
                <strong>Stops from Reference:</strong> ${data.stops_from_reference >= 0 ? '+' : ''}${data.stops_from_reference.toFixed(2)} stops
            </div>
            <p style="margin-top: 20px;"><strong>Explanation:</strong></p>
            <p>${data.explanation}</p>
            ${data.warning ? `<p style="margin-top: 16px; color: var(--coral);"><strong>⚠ Warning:</strong> ${data.warning}</p>` : ''}
            <p style="margin-top: 16px; font-size: 0.9rem; color: var(--mid-gray);"><em>Note: This is an educational approximation. Real camera exposure depends on many factors including metering mode, scene brightness, and lens characteristics.</em></p>
        `;
        
    } catch (error) {
        console.error('Exposure calculation error:', error);
        resultDiv.innerHTML = '<div class="error-state">Failed to calculate exposure. Please check backend connection.</div>';
    }
}

// ========== SETTINGS ADVISOR ==========
async function getAdvice() {
    const subject = document.getElementById('subject-select').value;
    const lighting = document.getElementById('lighting2-select').value;
    const effect = document.getElementById('effect-select').value;
    
    const resultDiv = document.getElementById('advice-result');
    resultDiv.innerHTML = '<div class="loading">Getting recommendations...</div>';
    
    try {
        const response = await fetch('/api/settings/advise', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, lighting, effect })
        });
        
        if (!response.ok) {
            throw new Error('Request failed');
        }
        
        const data = await response.json();
        
        if (data.error) {
            resultDiv.innerHTML = `<div class="error-state">${data.error}</div>`;
            return;
        }
        
        resultDiv.innerHTML = `
            <h3>Recommended Settings</h3>
            <div class="result-setting">
                <strong>Subject:</strong> ${data.subject}
            </div>
            <div class="result-setting">
                <strong>Lighting:</strong> ${data.lighting}
            </div>
            <div class="result-setting">
                <strong>Effect:</strong> ${data.effect}
            </div>
            <hr style="margin: 24px 0; border: none; border-top: 1px solid var(--light-gray);">
            <div class="result-setting">
                <strong>Aperture:</strong> ${data.recommended_aperture}
            </div>
            <div class="result-setting">
                <strong>Shutter Speed:</strong> ${data.recommended_shutter}
            </div>
            <div class="result-setting">
                <strong>ISO:</strong> ${data.recommended_iso}
            </div>
            <p style="margin-top: 20px;"><strong>Why These Settings:</strong></p>
            <p>${data.explanation}</p>
            <p style="margin-top: 16px;"><strong>Tips:</strong></p>
            <p>${data.tips}</p>
            <p style="margin-top: 16px; font-size: 0.9rem; color: var(--mid-gray);"><em>These are starting points. Adjust based on your specific scene and creative vision.</em></p>
        `;
        
    } catch (error) {
        console.error('Settings advice error:', error);
        resultDiv.innerHTML = '<div class="error-state">Failed to get recommendations. Please check backend connection.</div>';
    }
}

// ========== QUIZ ==========
let quizQuestions = [];
let userAnswers = [];

async function startQuiz() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = '<div class="loading">Loading quiz...</div>';
    
    try {
        const response = await fetch('/api/quiz');
        
        if (!response.ok) {
            throw new Error('Quiz load failed');
        }
        
        const data = await response.json();
        
        if (data.error) {
            container.innerHTML = `<div class="error-state">${data.error}</div>`;
            return;
        }
        
        quizQuestions = data.questions || [];
        userAnswers = new Array(quizQuestions.length).fill(null);
        
        container.innerHTML = quizQuestions.map((q, index) => `
            <div class="quiz-question">
                <h4>Question ${index + 1}: ${q.question}</h4>
                <div class="quiz-options">
                    ${q.options.map((option, optIndex) => `
                        <label class="quiz-option">
                            <input type="radio" name="question-${index}" value="${optIndex}" 
                                   onchange="userAnswers[${index}] = ${optIndex}">
                            ${option}
                        </label>
                    `).join('')}
                </div>
            </div>
        `).join('') + '<button class="btn-primary" onclick="submitQuiz()">Submit Quiz</button>';
        
    } catch (error) {
        console.error('Quiz load error:', error);
        container.innerHTML = '<div class="error-state">Failed to load quiz. Please check backend connection.</div>';
    }
}

async function submitQuiz() {
    // Check if all questions answered
    if (userAnswers.includes(null)) {
        alert('Please answer all questions before submitting.');
        return;
    }
    
    const resultDiv = document.getElementById('quiz-result');
    resultDiv.innerHTML = '<div class="loading">Grading quiz...</div>';
    resultDiv.style.display = 'block';
    
    try {
        const response = await fetch('/api/quiz/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers: userAnswers })
        });
        
        if (!response.ok) {
            throw new Error('Quiz submission failed');
        }
        
        const data = await response.json();
        
        if (data.error) {
            resultDiv.innerHTML = `<div class="error-state">${data.error}</div>`;
            return;
        }
        
        // Hide quiz questions
        document.getElementById('quiz-container').style.display = 'none';
        
        // Show results
        let feedbackHTML = '';
        if (data.questions) {
            feedbackHTML = '<div class="quiz-feedback"><h3>Question Review</h3>';
            data.questions.forEach((q, index) => {
                const isCorrect = userAnswers[index] === q.correct_answer;
                feedbackHTML += `
                    <div class="feedback-item ${isCorrect ? 'correct' : 'incorrect'}">
                        <strong>${isCorrect ? '✓' : '✗'} Question ${index + 1}:</strong> ${q.question}<br>
                        <strong>Your answer:</strong> ${q.options[userAnswers[index]]}<br>
                        ${!isCorrect ? `<strong>Correct answer:</strong> ${q.options[q.correct_answer]}<br>` : ''}
                        <strong>Explanation:</strong> ${q.explanation}
                    </div>
                `;
            });
            feedbackHTML += '</div>';
        }
        
        resultDiv.innerHTML = `
            <div class="quiz-result">
                <h3>Quiz Complete!</h3>
                <div class="quiz-score">${data.percentage.toFixed(1)}%</div>
                <p><strong>Score:</strong> ${data.score} out of ${data.total} correct</p>
                ${feedbackHTML}
                <button class="btn-primary" onclick="resetQuiz()">Take Quiz Again</button>
            </div>
        `;
        
        // Update progress
        loadProgress();
        
    } catch (error) {
        console.error('Quiz submission error:', error);
        resultDiv.innerHTML = '<div class="error-state">Failed to submit quiz. Please check backend connection.</div>';
    }
}

function resetQuiz() {
    document.getElementById('quiz-container').innerHTML = '<button class="btn-primary" onclick="startQuiz()">Start Quiz</button>';
    document.getElementById('quiz-container').style.display = 'block';
    document.getElementById('quiz-result').style.display = 'none';
    userAnswers = [];
}

// ========== PROGRESS ==========
async function loadProgress() {
    const container = document.getElementById('progress-stats');
    container.innerHTML = '<div class="loading">Loading progress...</div>';
    
    try {
        const response = await fetch('/api/progress');
        
        if (!response.ok) {
            throw new Error('Progress load failed');
        }
        
        const data = await response.json();
        
        if (data.error) {
            container.innerHTML = `<div class="error-state">${data.error}</div>`;
            return;
        }
        
        container.innerHTML = `
            <div class="stat-card">
                <div class="stat-label">Total Lessons</div>
                <div class="stat-value">${data.total_lessons}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Completed</div>
                <div class="stat-value stat-percentage">${data.completed_lessons}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Remaining</div>
                <div class="stat-value">${data.remaining_lessons}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Completion Rate</div>
                <div class="stat-value stat-percentage">${data.completion_percentage}%</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Quiz Attempts</div>
                <div class="stat-value">${data.quiz_attempts}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Best Quiz Score</div>
                <div class="stat-value stat-percentage">${data.best_quiz_score}%</div>
            </div>
        `;
        
    } catch (error) {
        console.error('Progress load error:', error);
        container.innerHTML = '<div class="error-state">Failed to load progress. Please check backend connection.</div>';
    }
}

// ========== JOURNAL ==========
function showJournalForm() {
    const form = document.getElementById('journal-form');
    form.style.display = 'block';
    
    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('journal-date').value = today;
}

function hideJournalForm() {
    document.getElementById('journal-form').style.display = 'none';
    
    // Clear form
    document.getElementById('journal-date').value = '';
    document.getElementById('journal-subject').value = '';
    document.getElementById('journal-concept').value = '';
    document.getElementById('journal-settings').value = '';
    document.getElementById('journal-well').value = '';
    document.getElementById('journal-improve').value = '';
    document.getElementById('journal-goal').value = '';
}

async function saveJournalEntry() {
    const entry = {
        entry_date: document.getElementById('journal-date').value,
        subject: document.getElementById('journal-subject').value,
        concept: document.getElementById('journal-concept').value,
        settings: document.getElementById('journal-settings').value,
        went_well: document.getElementById('journal-well').value,
        improve: document.getElementById('journal-improve').value,
        next_goal: document.getElementById('journal-goal').value
    };
    
    // Validate
    if (!entry.entry_date || !entry.subject || !entry.concept) {
        alert('Please fill in at least date, subject, and concept fields.');
        return;
    }
    
    try {
        const response = await fetch('/api/journal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry)
        });
        
        if (response.ok) {
            hideJournalForm();
            loadJournal();
        } else {
            alert('Failed to save journal entry');
        }
    } catch (error) {
        console.error('Journal save error:', error);
        alert('Failed to save journal entry');
    }
}

async function loadJournal() {
    const container = document.getElementById('journal-entries');
    container.innerHTML = '<div class="loading">Loading journal entries...</div>';
    
    try {
        const response = await fetch('/api/journal');
        
        if (!response.ok) {
            throw new Error('Journal load failed');
        }
        
        const data = await response.json();
        
        if (data.error) {
            container.innerHTML = `<div class="error-state">${data.error}</div>`;
            return;
        }
        
        const entries = data.entries || [];
        
        if (entries.length === 0) {
            container.innerHTML = '<div class="empty-state">No journal entries yet. Start documenting your practice!</div>';
            return;
        }
        
        container.innerHTML = entries.map(entry => `
            <div class="journal-entry">
                <h4>${entry.subject}</h4>
                <div class="journal-meta">${entry.entry_date}</div>
                
                <div class="journal-section">
                    <strong>Concept Practiced:</strong>
                    ${entry.concept}
                </div>
                
                <div class="journal-section">
                    <strong>Settings Used:</strong>
                    ${entry.settings}
                </div>
                
                <div class="journal-section">
                    <strong>What Went Well:</strong>
                    ${entry.went_well}
                </div>
                
                <div class="journal-section">
                    <strong>Areas to Improve:</strong>
                    ${entry.improve}
                </div>
                
                <div class="journal-section">
                    <strong>Next Goal:</strong>
                    ${entry.next_goal}
                </div>
                
                <div class="journal-actions">
                    <button class="btn-delete" onclick="deleteJournalEntry(${entry.id})">Delete Entry</button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Journal load error:', error);
        container.innerHTML = '<div class="error-state">Failed to load journal entries.</div>';
    }
}

async function deleteJournalEntry(entryId) {
    if (!confirm('Delete this journal entry?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/journal?id=${entryId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadJournal();
        } else {
            alert('Failed to delete entry');
        }
    } catch (error) {
        console.error('Journal delete error:', error);
        alert('Failed to delete entry');
    }
}

// ========== CHALLENGES ==========
async function loadChallenges() {
    const container = document.getElementById('challenges-container');
    container.innerHTML = '<div class="loading">Loading challenges...</div>';
    
    try {
        const response = await fetch('/api/challenges');
        
        if (!response.ok) {
            throw new Error('Challenges load failed');
        }
        
        const data = await response.json();
        
        if (data.error) {
            container.innerHTML = `<div class="error-state">${data.error}</div>`;
            return;
        }
        
        const challenges = data.challenges || [];
        
        container.innerHTML = challenges.map(challenge => `
            <div class="challenge-card">
                <h3>${challenge.title}</h3>
                <span class="challenge-difficulty">${challenge.difficulty} • ${challenge.category}</span>
                <p class="challenge-description">${challenge.description}</p>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Challenges load error:', error);
        container.innerHTML = '<div class="error-state">Failed to load challenges.</div>';
    }
}

// ========== INITIALIZATION ==========
// Show home section on load
document.addEventListener('DOMContentLoaded', () => {
    navigateTo('home');
});

// Close modals on background click
document.getElementById('lesson-modal').addEventListener('click', (e) => {
    if (e.target.id === 'lesson-modal') {
        closeLessonModal();
    }
});

document.getElementById('composition-modal').addEventListener('click', (e) => {
    if (e.target.id === 'composition-modal') {
        closeCompositionModal();
    }
});
