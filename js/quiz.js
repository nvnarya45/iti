// ===== Quiz Module =====
// All quizzes and questions managed from Firebase Admin Panel.
// No preloaded data — everything comes from Firebase.
let quizState = { questions: [], current: 0, answers: [], timer: null, timeLeft: 0, quizId: '' };
const defaultQuizzes = [];
const defaultQuestions = {};

async function renderQuizList() {
  const lang = document.getElementById('lang-toggle').checked;
  let quizzes = [];
  try {
    const snap = await db.ref('quizzes').once('value');
    if (snap.exists()) {
      const data = snap.val();
      quizzes = Object.keys(data).map(k => ({ id: k, ...data[k] }));
    }
  } catch(e) {}

  const el = document.getElementById('view-quiz');
  el.innerHTML = `
    <h3 class="section-title"><i class="fas fa-clipboard-check" style="color:var(--accent)"></i> ${lang ? 'क्विज़ और टेस्ट' : 'Quizzes & Tests'}</h3>
    <p class="section-subtitle">${lang ? 'अपना ज्ञान परखें' : 'Test your knowledge with MCQ quizzes'}</p>
    ${quizzes.length === 0 ? `
      <div class="empty-state">
        <i class="fas fa-clipboard-check"></i>
        <p>${lang ? 'अभी कोई क्विज़ नहीं' : 'No quizzes available yet'}</p>
      </div>
    ` : ''}
    ${quizzes.map(q => `
      <div class="quiz-card" onclick="startQuiz('${q.id}')">
        <div class="quiz-card-body">
          <h3>${lang ? (q.titleHi || q.title) : q.title}</h3>
          <p>${lang ? 'बहुविकल्पीय प्रश्न' : 'Multiple choice questions'}</p>
          <div class="quiz-meta">
            <span><i class="fas fa-question-circle"></i> ${q.questions || 5} ${lang ? 'प्रश्न' : 'Qs'}</span>
            <span><i class="fas fa-clock"></i> ${Math.floor((q.time || 300) / 60)} ${lang ? 'मिनट' : 'min'}</span>
            <span><i class="fas fa-bolt"></i> ${lang ? 'इलेक्ट्रीशियन' : 'Electrician'}</span>
          </div>
        </div>
      </div>
    `).join('')}
  `;
}

async function startQuiz(quizId) {
  showLoading(true);
  const lang = document.getElementById('lang-toggle').checked;
  let questions = [];
  let timeLimit = 300;

  try {
    const snap = await db.ref('quizQuestions/' + quizId).once('value');
    if (snap.exists()) {
      const data = snap.val();
      questions = Object.values(data);
    }
    const qSnap = await db.ref('quizzes/' + quizId + '/time').once('value');
    if (qSnap.exists()) timeLimit = qSnap.val();
  } catch(e) {}

  if (questions.length === 0) { showLoading(false); showToast(lang ? 'प्रश्न उपलब्ध नहीं' : 'No questions available'); return; }

  quizState = { questions, current: 0, answers: new Array(questions.length).fill(-1), timer: null, timeLeft: timeLimit, quizId };
  renderQuizQuestion();
  startQuizTimer();
  navigateTo('quiz-play');
  showLoading(false);
}

function renderQuizQuestion() {
  const lang = document.getElementById('lang-toggle').checked;
  const { questions, current, answers } = quizState;
  const q = questions[current];
  const letters = ['A', 'B', 'C', 'D'];

  const el = document.getElementById('view-quiz-play');
  el.innerHTML = `
    <div class="quiz-header">
      <div class="quiz-progress-text">${lang ? 'प्रश्न' : 'Question'} ${current + 1}/${questions.length}</div>
      <div class="quiz-timer" id="quiz-timer-display"><i class="fas fa-clock"></i> <span id="timer-text">${formatTime(quizState.timeLeft)}</span></div>
    </div>
    <div class="progress-wrap" style="margin-bottom:16px;">
      <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${((current + 1) / questions.length) * 100}%"></div></div>
    </div>
    <div class="quiz-question-card">
      <h3>${lang ? (q.qHi || q.q) : q.q}</h3>
      ${q.options.map((opt, i) => `
        <div class="quiz-option ${answers[current] === i ? 'selected' : ''}" onclick="selectAnswer(${i})">
          <div class="quiz-option-letter">${letters[i]}</div>
          <span>${opt}</span>
        </div>
      `).join('')}
    </div>
    <div class="quiz-nav">
      ${current > 0 ? `<button class="btn-outline" onclick="quizNav(-1)"><i class="fas fa-arrow-left"></i> ${lang ? 'पिछला' : 'Previous'}</button>` : '<div></div>'}
      ${current < questions.length - 1
        ? `<button class="btn-filled" onclick="quizNav(1)">${lang ? 'अगला' : 'Next'} <i class="fas fa-arrow-right"></i></button>`
        : `<button class="btn-filled" onclick="submitQuiz()" style="background:var(--success);box-shadow:0 4px 12px rgba(48,209,88,.3);">${lang ? 'जमा करें' : 'Submit'} <i class="fas fa-check"></i></button>`}
    </div>
  `;
}

function selectAnswer(idx) {
  quizState.answers[quizState.current] = idx;
  renderQuizQuestion();
}

function quizNav(dir) {
  quizState.current += dir;
  renderQuizQuestion();
}

function startQuizTimer() {
  if (quizState.timer) clearInterval(quizState.timer);
  quizState.timer = setInterval(() => {
    quizState.timeLeft--;
    const te = document.getElementById('timer-text');
    if (te) te.textContent = formatTime(quizState.timeLeft);
    if (quizState.timeLeft <= 0) { clearInterval(quizState.timer); submitQuiz(); }
  }, 1000);
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

async function submitQuiz() {
  if (quizState.timer) clearInterval(quizState.timer);
  const lang = document.getElementById('lang-toggle').checked;
  const { questions, answers, quizId } = quizState;
  let correct = 0;
  questions.forEach((q, i) => { if (answers[i] === q.correct) correct++; });
  const score = Math.round((correct / questions.length) * 100);

  // Save result
  const uid = getUID();
  if (uid) {
    try {
      await db.ref('users/' + uid + '/quizResults/' + quizId).set({ score, correct, total: questions.length, date: Date.now() });
    } catch(e) {}
  }

  renderQuizResult(score, correct, questions, answers, lang);
  navigateTo('quiz-result');
}

function renderQuizResult(score, correct, questions, answers, lang) {
  const total = questions.length;
  const wrong = total - correct;
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--warning)' : 'var(--danger)';

  const el = document.getElementById('view-quiz-result');
  el.innerHTML = `
    <div style="text-align:center;margin-bottom:12px;">
      <h3 class="section-title" style="justify-content:center;">${score >= 70 ? '🎉' : '📝'} ${lang ? 'परिणाम' : 'Quiz Result'}</h3>
    </div>
    <div class="result-circle">
      <svg viewBox="0 0 160 160"><circle class="bg-circle" cx="80" cy="80" r="70"/><circle class="fg-circle" cx="80" cy="80" r="70" style="stroke:${color};stroke-dasharray:${circumference};stroke-dashoffset:${offset}"/></svg>
      <div class="result-score">${score}%</div>
    </div>
    <div class="result-summary">
      <div class="result-item"><div class="val" style="color:var(--success)">${correct}</div><div class="lbl">${lang ? 'सही' : 'Correct'}</div></div>
      <div class="result-item"><div class="val" style="color:var(--danger)">${wrong}</div><div class="lbl">${lang ? 'गलत' : 'Wrong'}</div></div>
      <div class="result-item"><div class="val">${total}</div><div class="lbl">${lang ? 'कुल' : 'Total'}</div></div>
    </div>
    <h3 class="section-title" style="margin-top:20px;"><i class="fas fa-list-check" style="color:var(--accent)"></i> ${lang ? 'उत्तर व्याख्या' : 'Answer Explanations'}</h3>
    ${questions.map((q, i) => {
      const isCorrect = answers[i] === q.correct;
      const letters = ['A','B','C','D'];
      return `<div class="explanation-card">
        <h4>${i + 1}. ${lang ? (q.qHi || q.q) : q.q}</h4>
        <p><span class="${isCorrect ? 'correct-tag' : 'wrong-tag'}">${isCorrect ? '✅ Correct' : '❌ Wrong'}</span>
        ${!isCorrect ? ` — Your answer: ${letters[answers[i]] || 'None'}, Correct: ${letters[q.correct]}` : ''}</p>
        <p style="margin-top:6px;">${lang ? (q.explanationHi || q.explanation || '') : (q.explanation || '')}</p>
      </div>`;
    }).join('')}
    <button class="btn-primary" onclick="navigateTo('quiz')" style="margin-top:16px;">
      <i class="fas fa-redo"></i> ${lang ? 'और क्विज़ दें' : 'Take Another Quiz'}
    </button>
    ${score >= 80 ? `<button class="btn-complete" onclick="navigateTo('certificate')" style="margin-top:10px;background:linear-gradient(135deg,#d4a843,#f5d77a);color:#333;">
      <i class="fas fa-certificate"></i> ${lang ? 'प्रमाणपत्र देखें' : 'View Certificate'}
    </button>` : ''}
  `;
}
