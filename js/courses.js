// ===== Courses & Lessons Module =====
const defaultTopics = [
  { id: 'basic-electrical', title: 'Basic Electrical Theory', titleHi: 'बुनियादी विद्युत सिद्धांत', icon: 'fa-bolt', color: 'blue', desc: 'Voltage, Current, Resistance basics', descHi: 'वोल्टेज, करंट, प्रतिरोध की मूल बातें' },
  { id: 'ohms-law', title: "Ohm's Law", titleHi: 'ओम का नियम', icon: 'fa-calculator', color: 'purple', desc: 'V = IR and its applications', descHi: 'V = IR और इसके अनुप्रयोग' },
  { id: 'ac-dc', title: 'AC/DC Circuits', titleHi: 'AC/DC सर्किट', icon: 'fa-wave-square', color: 'green', desc: 'Alternating & Direct current circuits', descHi: 'प्रत्यावर्ती और दिष्ट धारा परिपथ' },
  { id: 'wiring', title: 'Wiring Diagrams', titleHi: 'वायरिंग आरेख', icon: 'fa-project-diagram', color: 'orange', desc: 'House wiring and industrial wiring', descHi: 'घरेलू और औद्योगिक वायरिंग' },
  { id: 'motor', title: 'Motor Winding', titleHi: 'मोटर वाइंडिंग', icon: 'fa-cog', color: 'red', desc: 'Single & three phase motor winding', descHi: 'सिंगल और थ्री फेज मोटर वाइंडिंग' },
  { id: 'safety', title: 'Electrical Safety', titleHi: 'विद्युत सुरक्षा', icon: 'fa-shield-alt', color: 'teal', desc: 'Safety practices and earthing', descHi: 'सुरक्षा अभ्यास और अर्थिंग' },
];

async function renderSubjects() {
  const lang = document.getElementById('lang-toggle').checked;
  const uid = getUID();
  let userProgress = {};
  try {
    const snap = await db.ref('users/' + uid + '/progress').once('value');
    if (snap.exists()) userProgress = snap.val();
  } catch(e) {}

  let topics = [...defaultTopics];
  try {
    const tSnap = await db.ref('topics').once('value');
    if (tSnap.exists()) {
      const fbTopics = tSnap.val();
      const extra = Object.keys(fbTopics).map(k => ({ id: k, ...fbTopics[k], color: fbTopics[k].color || 'blue', icon: fbTopics[k].icon || 'fa-book' }));
      topics = [...topics, ...extra.filter(e => !topics.find(t => t.id === e.id))];
    }
  } catch(e) {}

  const el = document.getElementById('view-subjects');
  el.innerHTML = `
    <h3 class="section-title"><i class="fas fa-book-open" style="color:var(--accent)"></i> ${lang ? 'इलेक्ट्रीशियन विषय' : 'Electrician Subjects'}</h3>
    <p class="section-subtitle">${lang ? 'अपना विषय चुनें और सीखना शुरू करें' : 'Choose a topic to start learning'}</p>
    ${topics.map((t, i) => {
      const completed = userProgress[t.id] === true;
      return `<div class="topic-item" onclick="openTopicLessons('${t.id}','${lang ? t.titleHi || t.title : t.title}')">
        <div class="topic-num">${i + 1}</div>
        <div class="topic-info">
          <h4>${lang ? (t.titleHi || t.title) : t.title}</h4>
          <p>${lang ? (t.descHi || t.desc) : t.desc}</p>
        </div>
        <span class="topic-badge ${completed ? '' : 'pending'}">${completed ? (lang ? 'पूर्ण' : 'Done') : (lang ? 'शुरू करें' : 'Start')}</span>
        <i class="fas fa-chevron-right topic-arrow"></i>
      </div>`;
    }).join('')}
  `;
}

async function renderLessons() {
  const lang = document.getElementById('lang-toggle').checked;
  const uid = getUID();
  let userProgress = {};
  try {
    const snap = await db.ref('users/' + uid + '/progress').once('value');
    if (snap.exists()) userProgress = snap.val();
  } catch(e) {}

  let lessons = [];
  try {
    const lSnap = await db.ref('lessons').once('value');
    if (lSnap.exists()) {
      const data = lSnap.val();
      lessons = Object.keys(data).map(k => ({ id: k, ...data[k] }));
    }
  } catch(e) {}

  if (lessons.length === 0) {
    lessons = defaultTopics.map(t => ({
      id: t.id, title: t.title, titleHi: t.titleHi, description: t.desc, descHi: t.descHi,
      topicId: t.id, videoUrl: '', pdfUrl: '', imageUrl: '', notes: ''
    }));
  }

  const el = document.getElementById('view-lessons');
  el.innerHTML = `
    <h3 class="section-title"><i class="fas fa-graduation-cap" style="color:var(--accent)"></i> ${lang ? 'सभी पाठ' : 'All Lessons'}</h3>
    <p class="section-subtitle">${lang ? 'वीडियो देखें, नोट्स पढ़ें और सीखें' : 'Watch videos, read notes and learn'}</p>
    <div class="category-tabs" id="lesson-cat-tabs">
      <div class="category-tab active" onclick="filterLessonCards('all', this)"><i class="fas fa-layer-group"></i> ${lang ? 'सभी' : 'All'}</div>
      <div class="category-tab" onclick="filterLessonCards('video', this)"><i class="fas fa-video"></i> ${lang ? 'वीडियो' : 'Videos'}</div>
      <div class="category-tab" onclick="filterLessonCards('pdf', this)"><i class="fas fa-file-pdf"></i> PDFs</div>
      <div class="category-tab" onclick="filterLessonCards('image', this)"><i class="fas fa-image"></i> ${lang ? 'चित्र' : 'Images'}</div>
      <div class="category-tab" onclick="filterLessonCards('notes', this)"><i class="fas fa-sticky-note"></i> ${lang ? 'नोट्स' : 'Notes'}</div>
    </div>
    <div id="lessons-list">
    ${lessons.map((l, i) => {
      const done = userProgress[l.id] === true;
      const type = getContentType(l);
      return `<div class="topic-item" data-type="${type}" onclick="openLessonDetail('${l.id}')">
        <div class="topic-num" style="${done ? 'background:var(--success);' : ''}">${done ? '<i class="fas fa-check"></i>' : (i + 1)}</div>
        <div class="topic-info">
          <h4>${lang ? (l.titleHi || l.title) : l.title}</h4>
          <p>${lang ? (l.descHi || l.description || '') : (l.description || '')}</p>
        </div>
        <span class="type-badge ${type}" style="position:static;font-size:.6rem;padding:2px 8px;">${type.toUpperCase()}</span>
        <i class="fas fa-chevron-right topic-arrow"></i>
      </div>`;
    }).join('')}
    </div>
  `;
}

function filterLessonCards(type, btn) {
  document.querySelectorAll('#lesson-cat-tabs .category-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#lessons-list .topic-item').forEach(card => {
    card.style.display = (type === 'all' || card.dataset.type === type) ? '' : 'none';
  });
}

function openTopicLessons(topicId, topicTitle) {
  currentTopicId = topicId;
  navigateTo('lessons');
}

let currentTopicId = null;

async function openLessonDetail(lessonId) {
  const lang = document.getElementById('lang-toggle').checked;
  const uid = getUID();
  showLoading(true);

  let lesson = null;
  try {
    const snap = await db.ref('lessons/' + lessonId).once('value');
    if (snap.exists()) lesson = { id: lessonId, ...snap.val() };
  } catch(e) {}

  if (!lesson) {
    const dt = defaultTopics.find(t => t.id === lessonId);
    if (dt) lesson = { id: lessonId, title: dt.title, titleHi: dt.titleHi, description: dt.desc, descHi: dt.descHi, videoUrl: '', pdfUrl: '', imageUrl: '', notes: '' };
  }
  if (!lesson) { showLoading(false); showToast('Lesson not found'); return; }

  let isDone = false;
  try {
    const pSnap = await db.ref('users/' + uid + '/progress/' + lessonId).once('value');
    isDone = pSnap.val() === true;
  } catch(e) {}

  const hasVideo = lesson.videoUrl && lesson.videoUrl.trim() !== '';
  const hasPdf = lesson.pdfUrl && lesson.pdfUrl.trim() !== '';
  const hasImage = lesson.imageUrl && lesson.imageUrl.trim() !== '';
  const hasNotes = lesson.notes && lesson.notes.trim() !== '';
  const hasAnyContent = hasVideo || hasPdf || hasImage || hasNotes;
  const uploadDate = lesson.createdAt ? new Date(lesson.createdAt).toLocaleDateString() : '';

  // Build video embed URL
  let videoEmbedUrl = '';
  if (hasVideo) {
    videoEmbedUrl = convertToEmbedUrl(lesson.videoUrl);
  }

  const el = document.getElementById('view-lesson-detail');
  el.innerHTML = `
    <button onclick="navigateTo('lessons')" style="display:flex;align-items:center;gap:6px;color:var(--accent);font-size:.9rem;font-weight:500;margin-bottom:12px;padding:4px 0;">
      <i class="fas fa-arrow-left"></i> ${lang ? 'वापस' : 'Back'}
    </button>
    <h3 class="section-title">${lang ? (lesson.titleHi || lesson.title) : lesson.title}</h3>
    <p class="section-subtitle">${lang ? (lesson.descHi || lesson.description || '') : (lesson.description || '')}${uploadDate ? ` • ${uploadDate}` : ''}</p>

    ${hasVideo ? `
    <!-- VIDEO SECTION -->
    <div class="media-section">
      <div class="media-section-header"><i class="fas fa-play-circle"></i> ${lang ? 'वीडियो' : 'Video Lesson'}</div>
      <div class="media-section-body">
        <iframe src="${videoEmbedUrl}" allowfullscreen allow="autoplay; encrypted-media; fullscreen" loading="lazy"></iframe>
      </div>
    </div>
    ` : ''}

    ${hasImage ? `
    <!-- IMAGE SECTION -->
    <div class="media-section">
      <div class="media-section-header"><i class="fas fa-image"></i> ${lang ? 'चित्र / आरेख' : 'Image / Diagram'}</div>
      <div class="media-section-body">
        <img src="${lesson.imageUrl}" alt="${lesson.title}" loading="lazy" onclick="window.open('${lesson.imageUrl}','_blank')" style="cursor:zoom-in;">
      </div>
    </div>
    ` : ''}

    ${hasPdf ? `
    <!-- PDF SECTION -->
    <div class="media-section">
      <div class="media-section-header"><i class="fas fa-file-pdf"></i> ${lang ? 'PDF नोट्स' : 'PDF Notes'}</div>
      <div class="pdf-viewer-wrap">
        <iframe src="${lesson.pdfUrl}" loading="lazy"></iframe>
      </div>
      <div class="pdf-actions">
        <a href="${lesson.pdfUrl}" target="_blank" class="btn-secondary"><i class="fas fa-external-link-alt"></i> ${lang ? 'खोलें' : 'Open'}</a>
        <a href="${lesson.pdfUrl}" download class="btn-primary" style="box-shadow:none;font-size:.82rem;padding:10px;"><i class="fas fa-download"></i> ${lang ? 'डाउनलोड' : 'Download'}</a>
      </div>
    </div>
    ` : ''}

    ${hasNotes ? `
    <!-- NOTES SECTION -->
    <div class="media-section">
      <div class="media-section-header"><i class="fas fa-sticky-note"></i> ${lang ? 'नोट्स' : 'Study Notes'}</div>
      <div style="padding:16px;">
        <div style="font-size:.88rem;line-height:1.8;color:var(--text2);">${lesson.notes}</div>
      </div>
    </div>
    ` : ''}

    ${!hasAnyContent ? `
    <div class="card" style="text-align:center;padding:40px 20px;">
      <i class="fas fa-inbox" style="font-size:2.5rem;color:var(--text3);margin-bottom:12px;"></i>
      <p style="color:var(--text2);font-size:.9rem;font-weight:500;">${lang ? 'सामग्री जल्द जोड़ी जाएगी' : 'Content will be added soon by admin'}</p>
      <p style="color:var(--text3);font-size:.78rem;margin-top:4px;">${lang ? 'कृपया बाद में देखें' : 'Please check back later'}</p>
    </div>
    ` : ''}

    <button class="btn-complete ${isDone ? 'done' : ''}" onclick="markLessonComplete('${lessonId}', this)" ${isDone ? 'disabled' : ''}>
      <i class="fas ${isDone ? 'fa-check-circle' : 'fa-check'}"></i>
      ${isDone ? (lang ? 'पूर्ण ✅' : 'Completed ✅') : (lang ? 'पूर्ण चिह्नित करें' : 'Mark as Complete')}
    </button>
  `;
  navigateTo('lesson-detail');
  showLoading(false);
}

// Convert YouTube URL to embed format
function convertToEmbedUrl(url) {
  if (!url) return '';
  // Already an embed URL
  if (url.includes('/embed/')) return url;
  // youtube.com/watch?v=ID
  let match = url.match(/[?&]v=([^&]+)/);
  if (match) return 'https://www.youtube.com/embed/' + match[1];
  // youtu.be/ID
  match = url.match(/youtu\.be\/([^?&]+)/);
  if (match) return 'https://www.youtube.com/embed/' + match[1];
  // Return as-is for direct video URLs
  return url;
}

function showLessonTab(btn, tab) {
  document.querySelectorAll('.lesson-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
}

async function markLessonComplete(lessonId, btn) {
  const uid = getUID();
  const lang = document.getElementById('lang-toggle').checked;
  try {
    await db.ref('users/' + uid + '/progress/' + lessonId).set(true);
    btn.classList.add('done');
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-check-circle"></i> ${lang ? 'पूर्ण ✅' : 'Completed ✅'}`;
    showToast(lang ? 'पाठ पूर्ण! 🎉' : 'Lesson completed! 🎉');
  } catch(e) {
    showToast('Error saving progress');
  }
}

// Helper used by dashboard too
function getContentType(item) {
  if (item.videoUrl && item.videoUrl.trim()) return 'video';
  if (item.pdfUrl && item.pdfUrl.trim()) return 'pdf';
  if (item.imageUrl && item.imageUrl.trim()) return 'image';
  if (item.notes && item.notes.trim()) return 'notes';
  return 'notes';
}
