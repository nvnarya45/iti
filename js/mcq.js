// ===== MCQ Player Module =====
let mcqState = { questions: [], current: 0, answers: [], subjectId: '', lessonId: '', mode: 'lesson' };

// Start MCQ session for a specific lesson
async function startLessonMCQ(subjectId, lessonId) {
  showLoading(true);
  mcqState.subjectId = subjectId;
  mcqState.lessonId = lessonId;
  mcqState.mode = 'lesson';
  mcqState.current = 0;
  mcqState.answers = [];
  let questions = [];
  try {
    const snap = await db.ref('mcqs').orderByChild('lessonId').equalTo(lessonId).once('value');
    if (snap.exists()) {
      const d = snap.val();
      questions = Object.keys(d).map(k => ({ id: k, ...d[k] }));
    }
  } catch(e) {}
  if (questions.length === 0) { showLoading(false); showToast('No MCQ questions available for this lesson yet'); return; }
  mcqState.questions = questions;
  mcqState.answers = new Array(questions.length).fill(null);
  renderMCQ();
  navigateTo('mcq-play');
  showLoading(false);
}

// Start MCQ session for all MCQs in a subject
async function startSubjectMCQ(subjectId) {
  showLoading(true);
  mcqState.subjectId = subjectId;
  mcqState.lessonId = '';
  mcqState.mode = 'subject';
  mcqState.current = 0;
  mcqState.answers = [];
  let questions = [];
  try {
    const snap = await db.ref('mcqs').orderByChild('subjectId').equalTo(subjectId).once('value');
    if (snap.exists()) {
      const d = snap.val();
      questions = Object.keys(d).map(k => ({ id: k, ...d[k] }));
    }
  } catch(e) {}
  if (questions.length === 0) { showLoading(false); showToast('No MCQ questions available for this subject yet'); return; }
  mcqState.questions = questions;
  mcqState.answers = new Array(questions.length).fill(null);
  renderMCQ();
  navigateTo('mcq-play');
  showLoading(false);
}

// Start random quiz mode
async function startRandomQuiz(count) {
  showLoading(true);
  mcqState.mode = 'random';
  mcqState.current = 0;
  mcqState.answers = [];
  let questions = [];
  try {
    const snap = await db.ref('mcqs').once('value');
    if (snap.exists()) {
      const d = snap.val();
      questions = Object.keys(d).map(k => ({ id: k, ...d[k] }));
    }
  } catch(e) {}
  if (questions.length === 0) { showLoading(false); showToast('No MCQs available'); return; }
  // Shuffle and pick
  questions = questions.sort(() => Math.random() - 0.5).slice(0, count || 10);
  mcqState.questions = questions;
  mcqState.answers = new Array(questions.length).fill(null);
  renderMCQ();
  navigateTo('mcq-play');
  showLoading(false);
}

// Start daily practice
async function startDailyPractice() {
  showLoading(true);
  mcqState.mode = 'daily';
  mcqState.current = 0;
  mcqState.answers = [];
  let questions = [];
  try {
    const snap = await db.ref('mcqs').once('value');
    if (snap.exists()) {
      const d = snap.val();
      questions = Object.keys(d).map(k => ({ id: k, ...d[k] }));
    }
  } catch(e) {}
  if (questions.length === 0) { showLoading(false); showToast('No MCQs available'); return; }
  // Daily seed for consistent daily set
  const today = new Date().toISOString().slice(0, 10);
  let seed = 0;
  for (let i = 0; i < today.length; i++) seed += today.charCodeAt(i);
  questions.sort((a, b) => {
    const ha = (a.id.charCodeAt(0) * 31 + seed) % 1000;
    const hb = (b.id.charCodeAt(0) * 31 + seed) % 1000;
    return ha - hb;
  });
  questions = questions.slice(0, 5);
  mcqState.questions = questions;
  mcqState.answers = new Array(questions.length).fill(null);
  renderMCQ();
  navigateTo('mcq-play');
  showLoading(false);
}

// Render current MCQ question
function renderMCQ() {
  const lang = document.getElementById('lang-toggle').checked;
  const { questions, current, answers } = mcqState;
  const q = questions[current];
  const letters = ['A', 'B', 'C', 'D'];
  const answered = answers[current] !== null;
  const userAnswer = answers[current];
  const isCorrect = userAnswer === q.correctIndex;

  const el = document.getElementById('view-mcq-play');
  el.innerHTML = `
    <button onclick="navigateTo('${mcqState.mode === 'lesson' ? 'lessons' : 'home'}')" class="back-btn">
      <i class="fas fa-arrow-left"></i> ${lang ? 'वापस' : 'Back'}
    </button>
    <div class="mcq-progress-bar">
      ${questions.map((_, i) => {
        let cls = '';
        if (i < current) cls = answers[i] === questions[i].correctIndex ? 'done' : 'wrong-dot';
        else if (i === current) cls = 'current';
        return `<div class="mcq-progress-dot ${cls}"></div>`;
      }).join('')}
    </div>
    <div class="mcq-card">
      <div class="q-number">${lang ? 'प्रश्न' : 'Question'} ${current + 1} / ${questions.length}</div>
      <div class="q-text">${lang ? (q.questionHi || q.question) : q.question}</div>
      ${q.questionImageUrl ? `<img class="q-image" src="${q.questionImageUrl}" alt="Question Image" loading="lazy">` : ''}
    </div>
    <div class="mcq-container">
      ${(q.options || []).map((opt, i) => {
        let optClass = '';
        let icon = '';
        if (answered) {
          optClass = 'disabled';
          if (i === q.correctIndex) { optClass += ' correct'; icon = '<i class="fas fa-check-circle mcq-opt-icon" style="color:var(--success)"></i>'; }
          else if (i === userAnswer && i !== q.correctIndex) { optClass += ' wrong'; icon = '<i class="fas fa-times-circle mcq-opt-icon" style="color:var(--danger)"></i>'; }
        }
        const optText = typeof opt === 'object' ? (opt.text || '') : opt;
        const optImg = typeof opt === 'object' ? (opt.imageUrl || '') : '';
        return `
        <div class="mcq-option ${optClass}" onclick="selectMCQAnswer(${i})">
          <div class="mcq-opt-letter">${letters[i]}</div>
          <div class="mcq-opt-text">
            ${optText}
            ${optImg ? `<img src="${optImg}" style="width:100%;max-height:80px;object-fit:contain;margin-top:6px;border-radius:6px;" loading="lazy">` : ''}
          </div>
          ${icon}
        </div>`;
      }).join('')}
    </div>
    ${answered ? `
      <div class="mcq-explanation">
        <h4><i class="fas fa-lightbulb"></i> ${isCorrect ? (lang ? '✅ सही उत्तर!' : '✅ Correct!') : (lang ? '❌ गलत उत्तर' : '❌ Incorrect')}</h4>
        <p>${lang ? (q.explanationHi || q.explanation || '') : (q.explanation || '')}</p>
        ${q.explanationImageUrl ? `<img src="${q.explanationImageUrl}" loading="lazy">` : ''}
      </div>
    ` : ''}
    <div class="mcq-nav">
      ${current > 0 ? `<button class="btn-outline" onclick="mcqNav(-1)"><i class="fas fa-arrow-left"></i> ${lang ? 'पिछला' : 'Prev'}</button>` : '<div></div>'}
      ${answered ? (current < questions.length - 1
        ? `<button class="btn-filled" onclick="mcqNav(1)">${lang ? 'अगला' : 'Next'} <i class="fas fa-arrow-right"></i></button>`
        : `<button class="btn-filled" onclick="finishMCQ()" style="background:var(--success);box-shadow:0 4px 12px rgba(48,209,88,.3);">${lang ? 'पूर्ण करें' : 'Finish'} <i class="fas fa-check"></i></button>`
      ) : `<div style="flex:1;text-align:center;font-size:.82rem;color:var(--text2);">${lang ? 'उत्तर चुनें' : 'Select an answer'}</div>`}
    </div>
  `;
}

function selectMCQAnswer(idx) {
  if (mcqState.answers[mcqState.current] !== null) return;
  mcqState.answers[mcqState.current] = idx;
  renderMCQ();
  // Save progress to Firebase
  saveMCQProgress(mcqState.questions[mcqState.current], idx);
}

function mcqNav(dir) {
  mcqState.current += dir;
  if (mcqState.current < 0) mcqState.current = 0;
  if (mcqState.current >= mcqState.questions.length) mcqState.current = mcqState.questions.length - 1;
  renderMCQ();
}

async function saveMCQProgress(q, answer) {
  const uid = getUID();
  if (!uid) return;
  const isCorrect = answer === q.correctIndex;
  const path = `users/${uid}/mcqProgress/${q.id}`;
  try {
    await db.ref(path).set({ answered: true, correct: isCorrect, timestamp: Date.now() });
  } catch(e) {}
}

async function finishMCQ() {
  const lang = document.getElementById('lang-toggle').checked;
  const { questions, answers } = mcqState;
  let correct = 0, wrong = 0, unanswered = 0;
  questions.forEach((q, i) => {
    if (answers[i] === null) unanswered++;
    else if (answers[i] === q.correctIndex) correct++;
    else wrong++;
  });
  const total = questions.length;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;

  // Save result to Firebase
  const uid = getUID();
  if (uid) {
    try {
      const resultData = {
        score, correct, wrong, total,
        subjectId: mcqState.subjectId || '',
        lessonId: mcqState.lessonId || '',
        mode: mcqState.mode,
        date: Date.now()
      };
      await db.ref(`users/${uid}/mcqResults`).push(resultData);
      // Update daily streak
      if (mcqState.mode === 'daily') {
        const today = new Date().toISOString().slice(0, 10);
        await db.ref(`users/${uid}/lastPracticeDate`).set(today);
        const streakSnap = await db.ref(`users/${uid}/dailyStreak`).once('value');
        const currentStreak = streakSnap.val() || 0;
        await db.ref(`users/${uid}/dailyStreak`).set(currentStreak + 1);
      }
    } catch(e) {}
  }

  // Show result
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--warning)' : 'var(--danger)';
  const emoji = score >= 80 ? '🎉' : score >= 50 ? '👍' : '📝';

  const el = document.getElementById('view-mcq-result');
  el.innerHTML = `
    <div class="mcq-result-header">
      <div class="mcq-result-emoji">${emoji}</div>
      <h3 class="section-title" style="justify-content:center;">${lang ? 'परिणाम' : 'Result'}</h3>
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
    <h3 class="section-title" style="margin-top:16px;"><i class="fas fa-list-check" style="color:var(--accent)"></i> ${lang ? 'उत्तर समीक्षा' : 'Answer Review'}</h3>
    ${questions.map((q, i) => {
      const isC = answers[i] === q.correctIndex;
      const letters = ['A','B','C','D'];
      const optText = (idx) => typeof q.options[idx] === 'object' ? q.options[idx].text : q.options[idx];
      return `<div class="explanation-card">
        <h4>${i+1}. ${lang ? (q.questionHi || q.question) : q.question}</h4>
        <p><span class="${isC ? 'correct-tag' : 'wrong-tag'}">${isC ? '✅ Correct' : '❌ Wrong'}</span>
        ${!isC ? ` — Your: ${letters[answers[i]] || 'None'}, Correct: ${letters[q.correctIndex]}` : ''}</p>
        <p style="margin-top:6px;">${lang ? (q.explanationHi || q.explanation || '') : (q.explanation || '')}</p>
      </div>`;
    }).join('')}
    <div class="mcq-nav" style="margin-top:16px;">
      <button class="btn-primary" onclick="navigateTo('home')"><i class="fas fa-home"></i> ${lang ? 'होम' : 'Home'}</button>
    </div>
    <button class="btn-download-pdf" onclick="downloadMCQAsPDF()" style="margin-top:10px;">
      <i class="fas fa-file-pdf"></i> ${lang ? 'MCQ PDF डाउनलोड करें' : 'Download MCQ as PDF'}
    </button>
  `;
  navigateTo('mcq-result');
}

// ===== Bookmark System =====
async function toggleBookmark(mcqId) {
  const uid = getUID();
  if (!uid) return;
  try {
    const snap = await db.ref(`users/${uid}/bookmarks/${mcqId}`).once('value');
    if (snap.exists()) {
      await db.ref(`users/${uid}/bookmarks/${mcqId}`).remove();
      showToast('Bookmark removed');
    } else {
      await db.ref(`users/${uid}/bookmarks/${mcqId}`).set(true);
      showToast('Bookmarked! ⭐');
    }
  } catch(e) { showToast('Error'); }
}

async function renderBookmarks() {
  const lang = document.getElementById('lang-toggle').checked;
  const uid = getUID();
  const el = document.getElementById('view-bookmarks');
  if (!uid) { el.innerHTML = '<p>Please login</p>'; return; }
  let bookmarkIds = [];
  try {
    const snap = await db.ref(`users/${uid}/bookmarks`).once('value');
    if (snap.exists()) bookmarkIds = Object.keys(snap.val());
  } catch(e) {}
  if (bookmarkIds.length === 0) {
    el.innerHTML = `
      <h3 class="section-title"><i class="fas fa-bookmark" style="color:var(--accent)"></i> ${lang ? 'बुकमार्क' : 'Bookmarks'}</h3>
      <div class="empty-state"><i class="fas fa-bookmark"></i><p>${lang ? 'कोई बुकमार्क नहीं' : 'No bookmarks yet'}</p>
      <p class="sub">${lang ? 'प्रश्नों को बुकमार्क करें' : 'Bookmark questions to review later'}</p></div>`;
    return;
  }
  let mcqs = [];
  for (const id of bookmarkIds) {
    try {
      const s = await db.ref('mcqs/' + id).once('value');
      if (s.exists()) mcqs.push({ id, ...s.val() });
    } catch(e) {}
  }
  el.innerHTML = `
    <h3 class="section-title"><i class="fas fa-bookmark" style="color:var(--accent)"></i> ${lang ? 'बुकमार्क' : 'Bookmarks'} (${mcqs.length})</h3>
    ${mcqs.map((q, i) => `
      <div class="bookmark-card" onclick="viewSingleMCQ('${q.id}')">
        <div class="bk-num">${i+1}</div>
        <div class="bk-info">
          <h4>${lang ? (q.questionHi || q.question) : q.question}</h4>
          <p>${q.subjectId || ''} • ${q.lessonId || ''}</p>
        </div>
        <i class="fas fa-chevron-right" style="color:var(--text3);font-size:.8rem;"></i>
      </div>`).join('')}`;
}

async function viewSingleMCQ(mcqId) {
  showLoading(true);
  try {
    const snap = await db.ref('mcqs/' + mcqId).once('value');
    if (!snap.exists()) { showLoading(false); showToast('Not found'); return; }
    mcqState.questions = [{ id: mcqId, ...snap.val() }];
    mcqState.current = 0;
    mcqState.answers = [null];
    mcqState.mode = 'single';
    renderMCQ();
    navigateTo('mcq-play');
  } catch(e) { showToast('Error'); }
  showLoading(false);
}

// ===== Daily Practice View =====
async function renderDailyPractice() {
  const lang = document.getElementById('lang-toggle').checked;
  const uid = getUID();
  let streak = 0, lastDate = '';
  if (uid) {
    try {
      const ss = await db.ref(`users/${uid}/dailyStreak`).once('value');
      streak = ss.val() || 0;
      const ld = await db.ref(`users/${uid}/lastPracticeDate`).once('value');
      lastDate = ld.val() || '';
    } catch(e) {}
  }
  const today = new Date().toISOString().slice(0, 10);
  const doneToday = lastDate === today;

  const el = document.getElementById('view-daily-practice');
  el.innerHTML = `
    <h3 class="section-title"><i class="fas fa-fire" style="color:var(--warning)"></i> ${lang ? 'दैनिक अभ्यास' : 'Daily Practice'}</h3>
    <div class="daily-streak-card">
      <div class="streak-num">${streak}</div>
      <p>${lang ? 'दिन की स्ट्रीक' : 'Day Streak'}</p>
    </div>
    ${doneToday ? `
      <div class="card" style="text-align:center;padding:24px;">
        <div style="font-size:2.5rem;margin-bottom:8px;">✅</div>
        <h4>${lang ? 'आज का अभ्यास पूरा!' : "Today's practice done!"}</h4>
        <p style="color:var(--text2);font-size:.85rem;margin-top:4px;">${lang ? 'कल फिर आइए' : 'Come back tomorrow!'}</p>
      </div>
    ` : `
      <div class="card" style="text-align:center;padding:24px;cursor:pointer;" onclick="startDailyPractice()">
        <div style="font-size:2.5rem;margin-bottom:8px;">⚡</div>
        <h4>${lang ? 'आज के 5 प्रश्न' : "Today's 5 Questions"}</h4>
        <p style="color:var(--text2);font-size:.85rem;margin-top:4px;">${lang ? 'शुरू करें' : 'Start now!'}</p>
        <button class="btn-primary" style="margin-top:14px;"><i class="fas fa-play"></i> ${lang ? 'शुरू करें' : 'Start Practice'}</button>
      </div>
    `}
    <div class="card" style="cursor:pointer;" onclick="startRandomQuiz(10)">
      <div class="card-header">
        <div class="card-icon purple"><i class="fas fa-random"></i></div>
        <div><h3 style="font-size:.95rem;font-weight:600;">${lang ? 'रैंडम क्विज़' : 'Random Quiz'}</h3>
        <p style="font-size:.78rem;color:var(--text2);">${lang ? '10 यादृच्छिक प्रश्न' : '10 random MCQ questions'}</p></div>
      </div>
    </div>
  `;
}

// ===== Download All MCQ Questions as PDF =====
// Uses browser print-to-PDF for full Hindi/Unicode support
function downloadMCQAsPDF() {
  const lang = document.getElementById('lang-toggle').checked;
  const { questions, answers } = mcqState;
  if (!questions || questions.length === 0) {
    showToast(lang ? 'कोई प्रश्न नहीं' : 'No questions to download');
    return;
  }

  const letters = ['A', 'B', 'C', 'D'];
  const subjectName = mcqState.subjectId || 'Mixed';
  const totalQ = questions.length;
  const correctCount = questions.filter((q, i) => answers[i] === q.correctIndex).length;

  // Build HTML content with embedded Hindi font support
  const questionsHtml = questions.map((q, idx) => {
    const qText = lang ? (q.questionHi || q.question || '') : (q.question || '');
    const userAns = answers[idx];
    const isCorrect = userAns === q.correctIndex;

    const optionsHtml = (q.options || []).map((opt, oi) => {
      const optText = typeof opt === 'object' ? (opt.text || '') : opt;
      const isRight = oi === q.correctIndex;
      const isWrong = oi === userAns && !isCorrect;
      let cls = '';
      if (isRight) cls = 'correct';
      else if (isWrong) cls = 'wrong';
      return `<div class="opt ${cls}">
        <span class="opt-letter">${letters[oi]}</span>
        <span>${optText}</span>
        ${isRight ? '<span class="tick">✓</span>' : ''}
      </div>`;
    }).join('');

    const explanation = lang ? (q.explanationHi || q.explanation || '') : (q.explanation || '');

    return `<div class="question">
      <div class="q-header">
        <span class="q-num">Q${idx + 1}</span>
        <span class="q-text">${qText}</span>
      </div>
      ${optionsHtml}
      <div class="answer-line">
        <strong>Answer: ${letters[q.correctIndex]}</strong>
        ${userAns !== null && userAns !== undefined ? ` | Your Answer: ${letters[userAns] || '-'} ${isCorrect ? '✅' : '❌'}` : ''}
      </div>
      ${explanation ? `<div class="explanation">💡 ${explanation}</div>` : ''}
    </div>`;
  }).join('');

  const htmlContent = `<!DOCTYPE html>
<html lang="${lang ? 'hi' : 'en'}">
<head>
  <meta charset="UTF-8">
  <title>ITI Vidhya - MCQ Questions</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', 'Noto Sans Devanagari', 'Segoe UI', Arial, sans-serif;
      padding: 24px 28px;
      color: #1a1a2e;
      line-height: 1.7;
      font-size: 13px;
      background: #fff;
    }
    .header {
      text-align: center;
      padding-bottom: 16px;
      margin-bottom: 20px;
      border-bottom: 3px solid #0a84ff;
    }
    .header h1 {
      color: #0a84ff;
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .header .meta {
      font-size: 11px;
      color: #666;
    }
    .header .score-bar {
      display: inline-block;
      margin-top: 8px;
      padding: 4px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      background: #e8f5e9;
      color: #2e7d32;
    }
    .question {
      margin-bottom: 18px;
      padding: 14px 16px;
      border: 1px solid #e0e0e0;
      border-radius: 10px;
      page-break-inside: avoid;
      background: #fafbfc;
    }
    .q-header {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 10px;
    }
    .q-num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 30px;
      height: 26px;
      border-radius: 6px;
      background: #0a84ff;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .q-text {
      font-size: 13.5px;
      font-weight: 600;
      line-height: 1.6;
    }
    .opt {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      margin: 4px 0;
      border-radius: 6px;
      font-size: 12.5px;
      border: 1px solid transparent;
    }
    .opt.correct {
      background: #e8f5e9;
      border-color: #4caf50;
      color: #2e7d32;
      font-weight: 600;
    }
    .opt.wrong {
      background: #ffebee;
      border-color: #f44336;
      color: #c62828;
    }
    .opt-letter {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #eee;
      font-size: 11px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .opt.correct .opt-letter { background: #4caf50; color: #fff; }
    .opt.wrong .opt-letter { background: #f44336; color: #fff; }
    .tick { margin-left: auto; color: #4caf50; font-weight: 700; }
    .answer-line {
      margin-top: 8px;
      padding: 4px 8px;
      font-size: 11.5px;
      color: #2e7d32;
      background: #f1f8e9;
      border-radius: 4px;
      display: inline-block;
    }
    .explanation {
      margin-top: 6px;
      font-size: 11.5px;
      color: #555;
      font-style: italic;
      padding: 6px 10px;
      background: #fff8e1;
      border-radius: 4px;
      border-left: 3px solid #ffc107;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 12px;
      border-top: 1px solid #e0e0e0;
      font-size: 10px;
      color: #999;
    }
    @media print {
      body { padding: 16px; }
      .question { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>⚡ ITI Vidhya - MCQ Questions</h1>
    <div class="meta">Subject: ${subjectName} | Total: ${totalQ} Questions | Date: ${new Date().toLocaleDateString()}</div>
    <div class="score-bar">Score: ${correctCount}/${totalQ} Correct (${totalQ > 0 ? Math.round(correctCount/totalQ*100) : 0}%)</div>
  </div>
  ${questionsHtml}
  <div class="footer">
    Downloaded from ITI Vidhya App | ${new Date().toLocaleString()}
  </div>
</body>
</html>`;

  // Open print window
  const printWin = window.open('', '_blank');
  if (!printWin) {
    showToast(lang ? 'पॉपअप ब्लॉक है, कृपया अनुमति दें' : 'Popup blocked! Please allow popups');
    return;
  }
  printWin.document.write(htmlContent);
  printWin.document.close();
  
  // Wait for fonts to load then print
  setTimeout(() => {
    printWin.focus();
    printWin.print();
  }, 1200);

  showToast(lang ? 'PDF तैयार है! प्रिंट डायलॉग में "Save as PDF" चुनें 📄' : 'PDF ready! Select "Save as PDF" in print dialog 📄');
}

