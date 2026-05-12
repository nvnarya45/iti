// ===== Dashboard Module (accessible from sidebar menu) =====
async function renderDashboard() {
  const uid = getUID();
  if (!uid) return;
  const lang = document.getElementById('lang-toggle').checked;
  let userData = { name: 'Student', progress: {}, quizResults: {}, trade: 'electrician' };
  try {
    const snap = await db.ref('users/' + uid).once('value');
    if (snap.exists()) userData = { ...userData, ...snap.val() };
  } catch (e) {}

  const lessonSnap = await db.ref('lessons').once('value');
  const lessonsData = lessonSnap.exists() ? lessonSnap.val() : {};
  const totalLessons = Math.max(Object.keys(lessonsData).length, defaultLessonsData.length);
  const completedLessons = userData.progress ? Object.keys(userData.progress).filter(k => userData.progress[k] === true).length : 0;
  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  let quizCount = 0, bestScore = 0;
  if (userData.quizResults) {
    const results = Object.values(userData.quizResults);
    quizCount = results.length;
    bestScore = results.length > 0 ? Math.max(...results.map(r => r.score || 0)) : 0;
  }

  const el = document.getElementById('view-dashboard');
  el.innerHTML = `
    <h3 class="section-title"><i class="fas fa-th-large" style="color:var(--accent)"></i> ${lang ? 'डैशबोर्ड' : 'Dashboard'}</h3>

    <div class="daily-banner" onclick="navigateTo('quiz')" style="cursor:pointer;">
      <h3>${lang ? '🌟 आज का अभ्यास' : '🌟 Daily Practice'}</h3>
      <p>${lang ? 'हर दिन 5 प्रश्नों का अभ्यास करें' : 'Practice 5 questions daily to improve'}</p>
      <div class="daily-icon">⚡</div>
    </div>

    <div class="stats-row">
      <div class="stat-card"><div class="stat-value">${totalLessons}</div><div class="stat-label">${lang ? 'कुल पाठ' : 'Total'}</div></div>
      <div class="stat-card"><div class="stat-value">${completedLessons}</div><div class="stat-label">${lang ? 'पूर्ण' : 'Done'}</div></div>
      <div class="stat-card"><div class="stat-value">${quizCount}</div><div class="stat-label">${lang ? 'क्विज़' : 'Quizzes'}</div></div>
      <div class="stat-card"><div class="stat-value">${bestScore}%</div><div class="stat-label">${lang ? 'सर्वश्रेष्ठ' : 'Best'}</div></div>
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

    <div class="home-quick-actions" style="margin-top:16px;">
      <div class="home-action-card" onclick="navigateTo('home')"><i class="fas fa-book-open"></i><span>${lang ? 'पढ़ें' : 'Study'}</span></div>
      <div class="home-action-card" onclick="navigateTo('quiz')"><i class="fas fa-clipboard-check"></i><span>${lang ? 'क्विज़' : 'Quiz'}</span></div>
      <div class="home-action-card" onclick="navigateTo('progress')"><i class="fas fa-trophy"></i><span>${lang ? 'प्रगति' : 'Progress'}</span></div>
    </div>

    ${progressPct >= 100 ? `<div class="card" onclick="navigateTo('certificate')" style="cursor:pointer;text-align:center;margin-top:14px;">
      <div class="card-icon teal" style="margin:0 auto 8px;"><i class="fas fa-certificate"></i></div>
      <h4 style="font-size:.85rem;font-weight:600;">${lang ? 'प्रमाणपत्र डाउनलोड करें' : 'Download Certificate'} 🏆</h4>
    </div>` : ''}
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
