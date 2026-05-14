// ===== Dashboard Module v2 =====
async function renderDashboard() {
  const uid = getUID();
  if (!uid) return;
  const lang = document.getElementById('lang-toggle').checked;
  let userData = { name: 'Student', progress: {}, quizResults: {}, mcqProgress: {}, mcqResults: {}, trade: 'electrician' };
  try {
    const snap = await db.ref('users/' + uid).once('value');
    if (snap.exists()) userData = { ...userData, ...snap.val() };
  } catch (e) {}

  // Lesson stats
  const lessonSnap = await db.ref('lessons').once('value');
  const lessonsData = lessonSnap.exists() ? lessonSnap.val() : {};
  const totalLessons = Object.keys(lessonsData).length;
  const completedLessons = userData.progress ? Object.keys(userData.progress).filter(k => userData.progress[k] === true).length : 0;
  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // MCQ stats
  let mcqAnswered = 0, mcqCorrect = 0;
  if (userData.mcqProgress) {
    const entries = Object.values(userData.mcqProgress);
    mcqAnswered = entries.length;
    mcqCorrect = entries.filter(e => e.correct).length;
  }

  // Quiz stats
  let quizCount = 0, bestScore = 0;
  if (userData.quizResults) {
    const results = Object.values(userData.quizResults);
    quizCount = results.length;
    bestScore = results.length > 0 ? Math.max(...results.map(r => r.score || 0)) : 0;
  }

  const el = document.getElementById('view-dashboard');
  el.innerHTML = `
    <h3 class="section-title"><i class="fas fa-th-large" style="color:var(--accent)"></i> ${lang ? 'डैशबोर्ड' : 'Dashboard'}</h3>

    <div class="daily-banner" onclick="navigateTo('daily-practice')" style="cursor:pointer;">
      <h3>${lang ? '🔥 दैनिक अभ्यास' : '🔥 Daily Practice'}</h3>
      <p>${lang ? 'हर दिन 5 MCQ का अभ्यास करें' : 'Practice 5 MCQs daily to improve'}</p>
      <div class="daily-icon">⚡</div>
    </div>

    <div class="stats-row">
      <div class="stat-card"><div class="stat-value">${totalLessons}</div><div class="stat-label">${lang ? 'कुल पाठ' : 'Lessons'}</div></div>
      <div class="stat-card"><div class="stat-value">${completedLessons}</div><div class="stat-label">${lang ? 'पूर्ण' : 'Done'}</div></div>
      <div class="stat-card"><div class="stat-value">${mcqAnswered}</div><div class="stat-label">${lang ? 'MCQ उत्तर' : 'MCQs Done'}</div></div>
      <div class="stat-card"><div class="stat-value">${mcqCorrect}</div><div class="stat-label">${lang ? 'सही' : 'Correct'}</div></div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-icon blue"><i class="fas fa-chart-pie"></i></div>
        <div>
          <h3 style="font-size:.95rem;font-weight:600;">${lang ? 'समग्र प्रगति' : 'Overall Progress'}</h3>
          <p style="font-size:.78rem;color:var(--text2);">${lang ? 'पाठ्यक्रम पूर्णता' : 'Course completion'}</p>
        </div>
      </div>
      <div class="progress-wrap">
        <div class="progress-label"><span>${lang ? 'प्रगति' : 'Progress'}</span><span>${progressPct}%</span></div>
        <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${progressPct}%"></div></div>
      </div>
    </div>

    ${mcqAnswered > 0 ? `
    <div class="card">
      <div class="card-header">
        <div class="card-icon green"><i class="fas fa-clipboard-check"></i></div>
        <div>
          <h3 style="font-size:.95rem;font-weight:600;">${lang ? 'MCQ प्रदर्शन' : 'MCQ Performance'}</h3>
          <p style="font-size:.78rem;color:var(--text2);">${mcqCorrect}/${mcqAnswered} ${lang ? 'सही' : 'correct'} (${mcqAnswered > 0 ? Math.round(mcqCorrect/mcqAnswered*100) : 0}%)</p>
        </div>
      </div>
      <div class="progress-wrap">
        <div class="progress-label"><span>${lang ? 'सटीकता' : 'Accuracy'}</span><span>${mcqAnswered > 0 ? Math.round(mcqCorrect/mcqAnswered*100) : 0}%</span></div>
        <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${mcqAnswered > 0 ? Math.round(mcqCorrect/mcqAnswered*100) : 0}%;background:linear-gradient(135deg,#30d158,#34c759);"></div></div>
      </div>
    </div>` : ''}

    <div class="home-quick-actions" style="margin-top:16px;">
      <div class="home-action-card" onclick="navigateTo('home')"><i class="fas fa-book-open"></i><span>${lang ? 'पढ़ें' : 'Study'}</span></div>
      <div class="home-action-card" onclick="startRandomQuiz(10)"><i class="fas fa-random"></i><span>${lang ? 'रैंडम' : 'Random'}</span></div>
      <div class="home-action-card" onclick="navigateTo('progress')"><i class="fas fa-trophy"></i><span>${lang ? 'प्रगति' : 'Progress'}</span></div>
    </div>
  `;
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  const days = Math.floor(hrs / 24);
  if (days < 30) return days + 'd ago';
  return new Date(ts).toLocaleDateString();
}
