// ===== Search Module =====
async function renderSearch() {
  const lang = document.getElementById('lang-toggle').checked;
  const el = document.getElementById('view-search');
  el.innerHTML = `
    <div class="search-input-wrap">
      <i class="fas fa-search"></i>
      <input type="text" id="search-input" placeholder="${lang ? 'पाठ या विषय खोजें...' : 'Search lessons, subjects...'}" oninput="performSearch(this.value)" autofocus>
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

  // Search default topics
  defaultTopics.forEach(t => {
    if (t.title.toLowerCase().includes(q) || (t.titleHi && t.titleHi.includes(q)) || t.desc.toLowerCase().includes(q)) {
      matches.push({ id: t.id, title: lang ? (t.titleHi || t.title) : t.title, desc: lang ? (t.descHi || t.desc) : t.desc, type: 'lesson' });
    }
  });

  // Search Firebase lessons
  try {
    const snap = await db.ref('lessons').once('value');
    if (snap.exists()) {
      const data = snap.val();
      Object.keys(data).forEach(k => {
        const l = data[k];
        if ((l.title && l.title.toLowerCase().includes(q)) || (l.titleHi && l.titleHi.includes(q)) || (l.description && l.description.toLowerCase().includes(q))) {
          if (!matches.find(m => m.id === k)) {
            matches.push({ id: k, title: lang ? (l.titleHi || l.title) : l.title, desc: lang ? (l.descHi || l.description || '') : (l.description || ''), type: 'lesson' });
          }
        }
      });
    }
  } catch(e) {}

  if (matches.length === 0) {
    results.innerHTML = `<p style="text-align:center;color:var(--text2);font-size:.85rem;padding-top:40px;">${lang ? 'कोई परिणाम नहीं मिला' : 'No results found'}</p>`;
    return;
  }

  results.innerHTML = matches.map(m => `
    <div class="topic-item" onclick="openLessonDetail('${m.id}')">
      <div class="card-icon blue" style="width:36px;height:36px;border-radius:10px;font-size:.85rem;"><i class="fas fa-${m.type === 'lesson' ? 'book' : 'clipboard-check'}"></i></div>
      <div class="topic-info">
        <h4>${m.title}</h4>
        <p>${m.desc}</p>
      </div>
      <i class="fas fa-chevron-right topic-arrow"></i>
    </div>
  `).join('');
}
