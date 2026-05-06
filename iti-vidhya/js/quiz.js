// ===== Quiz Module =====
let quizState = { questions: [], current: 0, answers: [], timer: null, timeLeft: 0, quizId: '' };

const defaultQuizzes = [
  { id: 'basic-quiz', title: 'Basic Electrical Theory Quiz', titleHi: 'बुनियादी विद्युत सिद्धांत क्विज़', questions: 5, time: 300, topic: 'basic-electrical' },
  { id: 'ohms-quiz', title: "Ohm's Law Quiz", titleHi: 'ओम का नियम क्विज़', questions: 5, time: 300, topic: 'ohms-law' },
  { id: 'circuit-quiz', title: 'AC/DC Circuit Quiz', titleHi: 'AC/DC सर्किट क्विज़', questions: 5, time: 300, topic: 'ac-dc' },
  { id: 'wiring-quiz', title: 'Wiring Diagrams Quiz', titleHi: 'वायरिंग आरेख क्विज़', questions: 5, time: 300, topic: 'wiring' },
  { id: 'motor-quiz', title: 'Motor Winding Quiz', titleHi: 'मोटर वाइंडिंग क्विज़', questions: 5, time: 300, topic: 'motor' },
];

const defaultQuestions = {
  'basic-quiz': [
    { q: 'What is the unit of electrical resistance?', qHi: 'विद्युत प्रतिरोध की इकाई क्या है?', options: ['Volt', 'Ampere', 'Ohm', 'Watt'], correct: 2, explanation: 'Resistance is measured in Ohms (Ω), named after Georg Simon Ohm.', explanationHi: 'प्रतिरोध को ओम (Ω) में मापा जाता है।' },
    { q: 'Which particle carries electric current?', qHi: 'कौन सा कण विद्युत धारा वहन करता है?', options: ['Proton', 'Neutron', 'Electron', 'Photon'], correct: 2, explanation: 'Electrons are negatively charged particles that flow to create electric current.', explanationHi: 'इलेक्ट्रॉन ऋणात्मक आवेशित कण हैं जो विद्युत धारा बनाते हैं।' },
    { q: 'What is the SI unit of current?', qHi: 'करंट की SI इकाई क्या है?', options: ['Volt', 'Ampere', 'Ohm', 'Farad'], correct: 1, explanation: 'Current is measured in Amperes (A).', explanationHi: 'करंट एम्पियर (A) में मापा जाता है।' },
    { q: 'A conductor has ___ resistance.', qHi: 'चालक में ___ प्रतिरोध होता है।', options: ['High', 'Low', 'Zero', 'Infinite'], correct: 1, explanation: 'Conductors have low resistance allowing current to flow easily.', explanationHi: 'चालकों में कम प्रतिरोध होता है।' },
    { q: 'EMF stands for?', qHi: 'EMF का पूरा नाम क्या है?', options: ['Electric Motor Force', 'Electromotive Force', 'Electromagnetic Flux', 'Electric Magnetic Field'], correct: 1, explanation: 'EMF = Electromotive Force, measured in Volts.', explanationHi: 'EMF = इलेक्ट्रोमोटिव फोर्स, वोल्ट में मापा जाता है।' },
  ],
  'ohms-quiz': [
    { q: "What is Ohm's Law formula?", qHi: 'ओम के नियम का सूत्र क्या है?', options: ['V = IR', 'P = VI', 'V = I/R', 'R = VI'], correct: 0, explanation: "Ohm's Law: V = I × R (Voltage = Current × Resistance).", explanationHi: 'ओम का नियम: V = I × R' },
    { q: 'If V=12V, R=4Ω, what is I?', qHi: 'यदि V=12V, R=4Ω, तो I क्या है?', options: ['2A', '3A', '4A', '48A'], correct: 1, explanation: 'I = V/R = 12/4 = 3 Ampere.', explanationHi: 'I = V/R = 12/4 = 3 एम्पियर।' },
    { q: 'Resistance is directly proportional to?', qHi: 'प्रतिरोध किसके समानुपाती है?', options: ['Length', 'Area', 'Current', 'Voltage'], correct: 0, explanation: 'R = ρL/A. Resistance increases with length.', explanationHi: 'R = ρL/A, प्रतिरोध लंबाई के साथ बढ़ता है।' },
    { q: 'Unit of resistivity is?', qHi: 'प्रतिरोधकता की इकाई क्या है?', options: ['Ohm', 'Ohm-meter', 'Ohm/meter', 'Siemens'], correct: 1, explanation: 'Resistivity (ρ) is measured in Ohm-meter (Ω·m).', explanationHi: 'प्रतिरोधकता ओम-मीटर में मापी जाती है।' },
    { q: 'Power formula using Ohm\'s law?', qHi: 'ओम के नियम से शक्ति सूत्र?', options: ['P = V²/R', 'P = IR', 'P = V/I', 'P = R/V'], correct: 0, explanation: 'P = V²/R, derived from P=VI and V=IR.', explanationHi: 'P = V²/R, P=VI और V=IR से व्युत्पन्न।' },
  ],
};

// Copy same structure for other quizzes
['circuit-quiz', 'wiring-quiz', 'motor-quiz'].forEach(qid => {
  if (!defaultQuestions[qid]) defaultQuestions[qid] = defaultQuestions['basic-quiz'];
});

async function renderQuizList() {
  const lang = document.getElementById('lang-toggle').checked;
  let quizzes = [...defaultQuizzes];
  try {
    const snap = await db.ref('quizzes').once('value');
    if (snap.exists()) {
      const data = snap.val();
      const fbQuizzes = Object.keys(data).map(k => ({ id: k, ...data[k] }));
      quizzes = [...quizzes, ...fbQuizzes.filter(f => !quizzes.find(q => q.id === f.id))];
    }
  } catch(e) {}

  const el = document.getElementById('view-quiz');
  el.innerHTML = `
    <h3 class="section-title"><i class="fas fa-clipboard-check" style="color:var(--accent)"></i> ${lang ? 'क्विज़ और टेस्ट' : 'Quizzes & Tests'}</h3>
    <p class="section-subtitle">${lang ? 'अपना ज्ञान परखें' : 'Test your knowledge with MCQ quizzes'}</p>
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

  // Try Firebase first
  try {
    const snap = await db.ref('quizQuestions/' + quizId).once('value');
    if (snap.exists()) {
      const data = snap.val();
      questions = Object.values(data);
    }
    const qSnap = await db.ref('quizzes/' + quizId + '/time').once('value');
    if (qSnap.exists()) timeLimit = qSnap.val();
  } catch(e) {}

  // Fallback to defaults
  if (questions.length === 0 && defaultQuestions[quizId]) {
    questions = defaultQuestions[quizId];
  }
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
