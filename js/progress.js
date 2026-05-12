// ===== Progress Module =====
async function renderProgress() {
  const lang = document.getElementById('lang-toggle').checked;
  const uid = getUID();
  if (!uid) return;

  let userData = { progress: {}, quizResults: {} };
  try {
    const snap = await db.ref('users/' + uid).once('value');
    if (snap.exists()) userData = snap.val();
  } catch(e) {}

  const lessonSnap = await db.ref('lessons').once('value');
  const allLessons = lessonSnap.exists() ? Object.keys(lessonSnap.val()) : defaultTopics.map(t => t.id);
  const totalLessons = Math.max(allLessons.length, defaultTopics.length);
  const completedIds = userData.progress ? Object.keys(userData.progress).filter(k => userData.progress[k]) : [];
  const completedCount = completedIds.length;
  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  let quizHtml = '';
  if (userData.quizResults) {
    const results = Object.entries(userData.quizResults);
    quizHtml = results.map(([qid, r]) => `
      <div class="admin-list-item">
        <div class="item-info">
          <h4>${qid.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</h4>
          <p>${lang ? 'स्कोर' : 'Score'}: ${r.score}% • ${r.correct}/${r.total} ${lang ? 'सही' : 'correct'}</p>
        </div>
        <div class="stat-value" style="font-size:1.1rem;">${r.score}%</div>
      </div>
    `).join('');
  }

  const el = document.getElementById('view-progress');
  el.innerHTML = `
    <h3 class="section-title"><i class="fas fa-chart-line" style="color:var(--accent)"></i> ${lang ? 'मेरी प्रगति' : 'My Progress'}</h3>
    <div class="card">
      <div class="card-header">
        <div class="card-icon green"><i class="fas fa-trophy"></i></div>
        <div><h3 style="font-size:.95rem;font-weight:600;">${lang ? 'पाठ्यक्रम प्रगति' : 'Course Progress'}</h3>
        <p style="font-size:.78rem;color:var(--text2);">${completedCount} / ${totalLessons} ${lang ? 'पाठ पूर्ण' : 'lessons completed'}</p></div>
      </div>
      <div class="progress-wrap">
        <div class="progress-label"><span>${lang ? 'समग्र' : 'Overall'}</span><span>${pct}%</span></div>
        <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
      </div>
    </div>
    <div class="stats-row">
      <div class="stat-card"><div class="stat-value">${completedCount}</div><div class="stat-label">${lang ? 'पूर्ण' : 'Completed'}</div></div>
      <div class="stat-card"><div class="stat-value">${totalLessons - completedCount}</div><div class="stat-label">${lang ? 'शेष' : 'Remaining'}</div></div>
    </div>
    <h3 class="section-title" style="margin-top:16px;"><i class="fas fa-clipboard-check" style="color:var(--accent)"></i> ${lang ? 'क्विज़ परिणाम' : 'Quiz Results'}</h3>
    ${quizHtml || `<p style="color:var(--text2);font-size:.85rem;padding:12px 0;">${lang ? 'अभी तक कोई क्विज़ नहीं दी' : 'No quizzes taken yet'}</p>`}
    ${pct >= 100 ? `<button class="btn-primary" onclick="navigateTo('certificate')" style="margin-top:16px;background:linear-gradient(135deg,#d4a843,#f5d77a);color:#333;">
      <i class="fas fa-certificate"></i> ${lang ? 'प्रमाणपत्र प्राप्त करें' : 'Get Certificate'} 🏆
    </button>` : ''}
  `;
}

// ===== Certificate =====
async function renderCertificate() {
  const uid = getUID();
  let name = 'Student';
  try {
    const snap = await db.ref('users/' + uid + '/name').once('value');
    if (snap.exists()) name = snap.val();
  } catch(e) {}
  const date = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  document.getElementById('view-certificate').innerHTML = `
    <button onclick="navigateTo('progress')" style="display:flex;align-items:center;gap:6px;color:var(--accent);font-size:.9rem;font-weight:500;margin-bottom:12px;padding:4px 0;">
      <i class="fas fa-arrow-left"></i> Back
    </button>
    <div class="certificate-frame">
      <div class="certificate-badge">🏆</div>
      <p style="font-size:.75rem;letter-spacing:2px;text-transform:uppercase;color:#8b6914;">Certificate of Completion</p>
      <h2>ITI Vidhya</h2>
      <p style="margin-top:16px;">This is to certify that</p>
      <h3 style="font-size:1.3rem;color:#1c1c1e;margin:8px 0;">${name}</h3>
      <p>has successfully completed the</p>
      <h3 style="color:#8b6914;">Electrician Trade Course</h3>
      <p style="margin-top:16px;font-size:.8rem;">Date: ${date}</p>
      <p style="margin-top:24px;font-size:.7rem;color:#999;">ITI Vidhya • Digital Certificate</p>
    </div>
  `;
}
