// ===== Dashboard Module =====
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
  const lessons = Object.keys(lessonsData);
  const totalLessons = lessons.length || 6;
  const completedLessons = userData.progress ? Object.keys(userData.progress).filter(k => userData.progress[k] === true).length : 0;
  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  let quizCount = 0, bestScore = 0;
  if (userData.quizResults) {
    const results = Object.values(userData.quizResults);
    quizCount = results.length;
    bestScore = results.length > 0 ? Math.max(...results.map(r => r.score || 0)) : 0;
  }

  // Get latest uploads from admin
  let latestContent = [];
  try {
    const uSnap = await db.ref('lessons').orderByChild('createdAt').limitToLast(10).once('value');
    if (uSnap.exists()) {
      const data = uSnap.val();
      latestContent = Object.keys(data).map(k => ({ id: k, ...data[k] })).reverse();
    }
  } catch(e) {}

  let topics = typeof defaultTopics !== 'undefined' ? [...defaultTopics] : [];
  try {
    const tSnap = await db.ref('topics').once('value');
    if (tSnap.exists()) {
      const fbTopics = tSnap.val();
      const extra = Object.keys(fbTopics).map(k => ({ id: k, ...fbTopics[k], color: fbTopics[k].color || 'blue', icon: fbTopics[k].icon || 'fa-book' }));
      topics = [...topics, ...extra.filter(e => !topics.find(t => t.id === e.id))];
    }
  } catch(e) {}

  const el = document.getElementById('view-dashboard');
  el.innerHTML = `
    <div class="daily-banner" onclick="navigateTo('quiz')" style="cursor:pointer;">
      <h3>${lang ? '🌟 आज का अभ्यास' : '🌟 Daily Practice'}</h3>
      <p>${lang ? 'हर दिन 5 प्रश्नों का अभ्यास करें' : 'Practice 5 questions daily to improve'}</p>
      <div class="daily-icon">⚡</div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value">${totalLessons}</div>
        <div class="stat-label">${lang ? 'कुल पाठ' : 'Total Lessons'}</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${completedLessons}</div>
        <div class="stat-label">${lang ? 'पूर्ण' : 'Completed'}</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${quizCount}</div>
        <div class="stat-label">${lang ? 'क्विज़' : 'Quizzes'}</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${bestScore}%</div>
        <div class="stat-label">${lang ? 'सर्वश्रेष्ठ' : 'Best Score'}</div>
      </div>
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

    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;margin-top:24px;">
      <h3 class="section-title" style="margin:0;"><i class="fas fa-book-open" style="color:var(--accent)"></i> ${lang ? 'सभी विषय पढ़ें' : 'Explore All Topics'}</h3>
      <span onclick="navigateTo('subjects')" style="color:var(--accent);font-size:.8rem;font-weight:600;cursor:pointer;">${lang ? 'विस्तार से' : 'Details'}</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(130px, 1fr));gap:12px;margin-bottom:24px;">
      ${topics.map(t => {
        const completed = userData.progress && userData.progress[t.id] === true;
        return \`
        <div class="card topic-card" onclick="openTopicLessons('\${t.id}','\${lang ? (t.titleHi || t.title).replace(/'/g, "\\'") : t.title.replace(/'/g, "\\'")}')" style="cursor:pointer;display:flex;flex-direction:column;align-items:center;text-align:center;padding:16px 12px;gap:10px;transition:all 0.2s;border:2px solid transparent;">
          <div class="card-icon \${t.color}" style="font-size:1.4rem;width:44px;height:44px;display:flex;align-items:center;justify-content:center;border-radius:12px;"><i class="fas \${t.icon}"></i></div>
          <h4 style="font-size:.85rem;font-weight:600;line-height:1.3;margin:0;">\${lang ? (t.titleHi || t.title) : t.title}</h4>
          \${completed ? \`<span style="font-size:.65rem;background:var(--success);color:#fff;padding:2px 6px;border-radius:4px;font-weight:600;"><i class="fas fa-check"></i> \${lang?'पूर्ण':'Done'}</span>\` : ''}
        </div>\`;
      }).join('')}
    </div>

    ${latestContent.length > 0 ? `
      <h3 class="section-title"><i class="fas fa-clock" style="color:var(--warning)"></i> ${lang ? 'नवीनतम सामग्री' : 'Latest Content'}</h3>
      <div class="category-tabs" id="dash-cat-tabs">
        <div class="category-tab active" onclick="filterDashContent('all', this)"><i class="fas fa-layer-group"></i> ${lang ? 'सभी' : 'All'}</div>
        <div class="category-tab" onclick="filterDashContent('video', this)"><i class="fas fa-video"></i> ${lang ? 'वीडियो' : 'Videos'}</div>
        <div class="category-tab" onclick="filterDashContent('pdf', this)"><i class="fas fa-file-pdf"></i> PDFs</div>
        <div class="category-tab" onclick="filterDashContent('image', this)"><i class="fas fa-image"></i> ${lang ? 'चित्र' : 'Images'}</div>
        <div class="category-tab" onclick="filterDashContent('notes', this)"><i class="fas fa-sticky-note"></i> ${lang ? 'नोट्स' : 'Notes'}</div>
      </div>
      <div class="content-grid" id="dash-content-grid">
        ${renderContentCards(latestContent, lang)}
      </div>
    ` : ''}

    ${progressPct >= 100 ? `<div class="card" onclick="navigateTo('certificate')" style="cursor:pointer;text-align:center;margin-top:14px;">
      <div class="card-icon teal" style="margin:0 auto 8px;"><i class="fas fa-certificate"></i></div>
      <h4 style="font-size:.85rem;font-weight:600;">${lang ? 'प्रमाणपत्र डाउनलोड करें' : 'Download Certificate'} 🏆</h4>
    </div>` : ''}
  `;
}

function renderContentCards(items, lang) {
  return items.map(item => {
    const type = getContentType(item);
    const thumbSrc = item.imageUrl || item.thumbnail || '';
    const dateStr = item.createdAt ? timeAgo(item.createdAt) : '';
    return `
      <div class="content-card" data-type="${type}" onclick="openLessonDetail('${item.id}')">
        <div class="content-card-thumb">
          ${thumbSrc ? `<img src="${thumbSrc}" alt="">` : `<i class="fas fa-${type === 'video' ? 'play-circle' : type === 'pdf' ? 'file-pdf' : type === 'image' ? 'image' : 'sticky-note'}" style="font-size:2rem;color:var(--text3);"></i>`}
          ${type === 'video' ? '<div class="play-icon"><i class="fas fa-play-circle"></i></div>' : ''}
          <span class="type-badge ${type}">${type.toUpperCase()}</span>
        </div>
        <div class="content-card-body">
          <h4>${lang ? (item.titleHi || item.title) : item.title}</h4>
          <p>${lang ? (item.descHi || item.description || '') : (item.description || '')}</p>
          ${dateStr ? `<div class="content-card-date"><i class="fas fa-clock"></i> ${dateStr}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function getContentType(item) {
  if (item.videoUrl) return 'video';
  if (item.pdfUrl) return 'pdf';
  if (item.imageUrl) return 'image';
  if (item.notes) return 'notes';
  return 'notes';
}

function filterDashContent(type, btn) {
  // Update active tab
  document.querySelectorAll('#dash-cat-tabs .category-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  // Filter cards
  const cards = document.querySelectorAll('#dash-content-grid .content-card');
  cards.forEach(card => {
    if (type === 'all' || card.dataset.type === type) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
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
