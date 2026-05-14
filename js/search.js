// ===== Search Module v2 - Search Lessons + MCQs =====
async function renderSearch() {
  const lang = document.getElementById('lang-toggle').checked;
  const el = document.getElementById('view-search');
  el.innerHTML = `
    <div class="search-input-wrap">
      <i class="fas fa-search"></i>
      <input type="text" id="search-input" placeholder="${lang ? 'पाठ, विषय, MCQ खोजें...' : 'Search lessons, subjects, MCQs...'}" oninput="performSearch(this.value)" autofocus>
    </div>
    <div class="search-results" id="search-results">
      <p style="text-align:center;color:var(--text2);font-size:.85rem;padding-top:40px;">${lang ? 'खोज शुरू करने के लिए टाइप करें' : 'Start typing to search'}</p>
    </div>
  `;
}

async function performSearch(query) {
  const lang = document.getElementById('lang-toggle').checked;
  const results = document.getElementById('search-results');
  if (!query || query.length < 2) {
    results.innerHTML = `<p style="text-align:center;color:var(--text2);font-size:.85rem;padding-top:40px;">${lang ? 'कम से कम 2 अक्षर टाइप करें' : 'Type at least 2 characters'}</p>`;
    return;
  }
  const q = query.toLowerCase();
  let matches = [];

  // Search subjects from Firebase
  try {
    const subjSnap = await db.ref('subjects').once('value');
    if (subjSnap.exists()) {
      const subjects = subjSnap.val();
      Object.keys(subjects).forEach(k => {
        const t = subjects[k];
        if ((t.title && t.title.toLowerCase().includes(q)) || (t.titleHi && t.titleHi.includes(q)) || (t.desc && t.desc.toLowerCase().includes(q))) {
          matches.push({ id: k, title: lang ? (t.titleHi || t.title) : t.title, desc: lang ? (t.descHi || t.desc || '') : (t.desc || ''), type: 'subject', icon: 'fa-book-open' });
        }
      });
    }
  } catch(e) {}

  // Search Firebase lessons
  try {
    const snap = await db.ref('lessons').once('value');
    if (snap.exists()) {
      const data = snap.val();
      Object.keys(data).forEach(k => {
        const l = data[k];
        if ((l.title && l.title.toLowerCase().includes(q)) || (l.titleHi && l.titleHi.includes(q))) {
          if (!matches.find(m => m.id === k)) {
            matches.push({ id: k, title: lang ? (l.titleHi || l.title) : l.title, desc: l.subjectId || '', type: 'lesson', icon: 'fa-book' });
          }
        }
      });
    }
  } catch(e) {}

  // Search MCQs
  try {
    const snap = await db.ref('mcqs').once('value');
    if (snap.exists()) {
      const data = snap.val();
      Object.keys(data).forEach(k => {
        const m = data[k];
        if ((m.question && m.question.toLowerCase().includes(q)) || (m.questionHi && m.questionHi.includes(q))) {
          matches.push({ id: k, title: lang ? (m.questionHi || m.question) : m.question, desc: `${m.subjectId || ''} • ${m.lessonId || ''}`, type: 'mcq', icon: 'fa-clipboard-check' });
        }
      });
    }
  } catch(e) {}

  if (matches.length === 0) {
    results.innerHTML = `<p style="text-align:center;color:var(--text2);font-size:.85rem;padding-top:40px;">${lang ? 'कोई परिणाम नहीं मिला' : 'No results found'}</p>`;
    return;
  }

  results.innerHTML = matches.slice(0, 20).map(m => `
    <div class="topic-item" onclick="${m.type === 'mcq' ? `viewSingleMCQ('${m.id}')` : m.type === 'subject' ? `openSubjectLessons('${m.id}')` : `openLessonDetail('${m.id}')`}">
      <div class="card-icon blue" style="width:36px;height:36px;border-radius:10px;font-size:.85rem;"><i class="fas ${m.icon}"></i></div>
      <div class="topic-info">
        <h4>${m.title}</h4>
        <p>${m.desc} <span class="chip chip-blue" style="margin-left:4px;">${m.type}</span></p>
      </div>
      <i class="fas fa-chevron-right topic-arrow"></i>
    </div>
  `).join('');
}
