// ===== Courses & Lessons Module =====
// All subjects, lessons, and content are managed from Firebase Admin Panel only.
// No preloaded/hardcoded content — everything comes from Firebase.
const defaultTopics = []; // Empty — all subjects from Firebase

// ===== HOME PAGE - Simple & Direct Lesson Access =====
async function renderHome() {
  const lang = document.getElementById('lang-toggle').checked;
  const uid = getUID();
  let userProgress = {};
  try {
    const snap = await db.ref('users/' + uid + '/progress').once('value');
    if (snap.exists()) userProgress = snap.val();
  } catch(e) {}

  // Load all subjects from Firebase
  let topics = [];
  try {
    const sSnap = await db.ref('subjects').once('value');
    if (sSnap.exists()) {
      const fbSubj = sSnap.val();
      topics = Object.keys(fbSubj).map(k => ({ id: k, ...fbSubj[k], color: fbSubj[k].color || 'blue', icon: fbSubj[k].icon || 'fa-book' }));
    }
  } catch(e) {}

  // Count lessons per subject from Firebase
  let lessonCounts = {};
  try {
    const lSnap = await db.ref('lessons').once('value');
    if (lSnap.exists()) {
      const allLessons = lSnap.val();
      Object.keys(allLessons).forEach(k => {
        const topicId = allLessons[k].subjectId || allLessons[k].topicId || '';
        if (topicId) {
          lessonCounts[topicId] = (lessonCounts[topicId] || 0) + 1;
        }
      });
    }
  } catch(e) {}

  const el = document.getElementById('view-home');

  if (topics.length === 0) {
    el.innerHTML = `
      <div class="home-welcome-card">
        <div class="home-welcome-text">
          <h2>${lang ? '📚 ITI Vidhya' : '📚 ITI Vidhya'}</h2>
          <p>${lang ? 'सीखें, अभ्यास करें, सफल हों' : 'Learn. Practice. Succeed.'}</p>
        </div>
        <div class="home-welcome-icon">⚡</div>
      </div>
      <div class="empty-state">
        <i class="fas fa-book-open"></i>
        <p>${lang ? 'अभी कोई विषय नहीं जोड़ा गया' : 'No subjects added yet'}</p>
      </div>
      <div class="home-quick-actions">
        <div class="home-action-card" onclick="navigateTo('daily-practice')">
          <i class="fas fa-fire" style="color:var(--warning)"></i>
          <span>${lang ? 'दैनिक अभ्यास' : 'Daily Practice'}</span>
        </div>
        <div class="home-action-card" onclick="navigateTo('bookmarks')">
          <i class="fas fa-bookmark" style="color:var(--accent2)"></i>
          <span>${lang ? 'बुकमार्क' : 'Bookmarks'}</span>
        </div>
        <div class="home-action-card" onclick="navigateTo('search')">
          <i class="fas fa-search"></i>
          <span>${lang ? 'खोजें' : 'Search'}</span>
        </div>
      </div>`;
    return;
  }

  el.innerHTML = `
    <div class="home-welcome-card">
      <div class="home-welcome-text">
        <h2>${lang ? '📚 पढ़ाई शुरू करें' : '📚 Start Learning'}</h2>
        <p>${lang ? 'विषय चुनें और पढ़ना शुरू करें' : 'Select a subject and start reading'}</p>
      </div>
      <div class="home-welcome-icon">⚡</div>
    </div>

    <div class="home-subjects-grid">
      ${topics.map((t, i) => {
        const count = lessonCounts[t.id] || 0;
        const completed = userProgress[t.id] === true;
        return `
        <div class="home-subject-card" onclick="openSubjectLessons('${t.id}')">
          <div class="home-subject-icon card-icon ${t.color || 'blue'}">
            <i class="fas ${t.icon || 'fa-book'}"></i>
          </div>
          <div class="home-subject-info">
            <h4>${lang ? (t.titleHi || t.title) : t.title}</h4>
            <p>${count} ${lang ? 'पाठ' : 'Lessons'}</p>
          </div>
          <div class="home-subject-arrow">
            ${completed ? '<i class="fas fa-check-circle" style="color:var(--success)"></i>' : '<i class="fas fa-chevron-right"></i>'}
          </div>
        </div>`;
      }).join('')}
    </div>

    <div class="home-quick-actions">
      <div class="home-action-card" onclick="navigateTo('daily-practice')">
        <i class="fas fa-fire" style="color:var(--warning)"></i>
        <span>${lang ? 'दैनिक अभ्यास' : 'Daily Practice'}</span>
      </div>
      <div class="home-action-card" onclick="navigateTo('bookmarks')">
        <i class="fas fa-bookmark" style="color:var(--accent2)"></i>
        <span>${lang ? 'बुकमार्क' : 'Bookmarks'}</span>
      </div>
      <div class="home-action-card" onclick="navigateTo('search')">
        <i class="fas fa-search"></i>
        <span>${lang ? 'खोजें' : 'Search'}</span>
      </div>
    </div>
  `;
}

// Open a subject and show its lessons
function openSubjectLessons(subjectId) {
  currentSubjectId = subjectId;
  navigateTo('lessons');
}

let currentSubjectId = null;

// ===== SUBJECT-SPECIFIC LESSONS VIEW =====
async function renderSubjectLessons() {
  const lang = document.getElementById('lang-toggle').checked;
  const uid = getUID();
  const subjectId = currentSubjectId;

  if (!subjectId) { navigateTo('home'); return; }

  // Find subject info from Firebase
  let subjectInfo = null;
  try {
    const sSnap = await db.ref('subjects/' + subjectId).once('value');
    if (sSnap.exists()) subjectInfo = { id: subjectId, ...sSnap.val() };
  } catch(e) {}
  if (!subjectInfo) subjectInfo = { id: subjectId, title: subjectId, titleHi: subjectId };

  let userProgress = {};
  try {
    const snap = await db.ref('users/' + uid + '/progress').once('value');
    if (snap.exists()) userProgress = snap.val();
  } catch(e) {}

  // Get lessons FOR THIS SUBJECT from Firebase only
  let lessons = [];
  try {
    const lSnap = await db.ref('lessons').once('value');
    if (lSnap.exists()) {
      const data = lSnap.val();
      lessons = Object.keys(data)
        .filter(k => (data[k].subjectId === subjectId || data[k].topicId === subjectId))
        .map(k => ({ id: k, ...data[k] }));
    }
  } catch(e) {}

  // Sort by order or createdAt
  lessons.sort((a, b) => (a.order || a.createdAt || 0) - (b.order || b.createdAt || 0));

  const el = document.getElementById('view-lessons');
  el.innerHTML = `
    <button onclick="navigateTo('home')" class="back-btn">
      <i class="fas fa-arrow-left"></i> ${lang ? 'वापस' : 'Back to Home'}
    </button>
    <div class="subject-header-card card-icon ${subjectInfo.color || 'blue'}">
      <i class="fas ${subjectInfo.icon || 'fa-book'}" style="font-size:1.4rem;"></i>
    </div>
    <h3 class="section-title">${lang ? (subjectInfo.titleHi || subjectInfo.title) : subjectInfo.title}</h3>
    <p class="section-subtitle">${lessons.length} ${lang ? 'पाठ उपलब्ध' : 'lessons available'}</p>

    ${lessons.length === 0 ? `
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>${lang ? 'अभी कोई पाठ नहीं जोड़ा गया' : 'No lessons added yet'}</p>
      </div>
    ` : ''}

    <div class="lessons-list">
      ${lessons.map((l, i) => {
        const done = userProgress[l.id] === true;
        const hasNotes = l.notes && l.notes.trim();
        const hasPdf = l.pdfUrl && l.pdfUrl.trim();
        const hasVideo = l.videoUrl && l.videoUrl.trim();
        let badges = '';
        if (hasNotes) badges += `<span class="mini-badge notes"><i class="fas fa-book-reader"></i></span>`;
        if (hasPdf) badges += `<span class="mini-badge pdf"><i class="fas fa-file-pdf"></i></span>`;
        if (hasVideo) badges += `<span class="mini-badge video"><i class="fas fa-play"></i></span>`;

        return `
        <div class="lesson-list-item" onclick="openLessonDetail('${l.id}')">
          <div class="lesson-num ${done ? 'completed' : ''}">${done ? '<i class="fas fa-check"></i>' : (i + 1)}</div>
          <div class="lesson-info">
            <h4>${lang ? (l.titleHi || l.title) : l.title}</h4>
            <p>${lang ? (l.descHi || l.description || '') : (l.description || '')}</p>
            <div class="lesson-badges">${badges}</div>
          </div>
          <i class="fas fa-chevron-right lesson-arrow"></i>
        </div>`;
      }).join('')}
    </div>

    <div class="card" style="text-align:center;cursor:pointer;margin-top:14px;" onclick="startSubjectMCQ('${subjectId}')">
      <div class="card-icon blue" style="margin:0 auto 8px;"><i class="fas fa-clipboard-check"></i></div>
      <h4 style="font-size:.88rem;font-weight:600;">${lang ? '📝 MCQ अभ्यास करें' : '📝 Practice All MCQs'}</h4>
      <p style="font-size:.78rem;color:var(--text2);margin-top:4px;">${lang ? 'इस विषय के सभी MCQ प्रश्न' : 'All MCQ questions for this subject'}</p>
    </div>
  `;
}

// Subjects list page
async function renderSubjects() {
  const lang = document.getElementById('lang-toggle').checked;
  const uid = getUID();
  let userProgress = {};
  try {
    const snap = await db.ref('users/' + uid + '/progress').once('value');
    if (snap.exists()) userProgress = snap.val();
  } catch(e) {}

  // Load subjects from Firebase only
  let topics = [];
  try {
    const sSnap = await db.ref('subjects').once('value');
    if (sSnap.exists()) {
      const fbSubj = sSnap.val();
      topics = Object.keys(fbSubj).map(k => ({ id: k, ...fbSubj[k], color: fbSubj[k].color || 'blue', icon: fbSubj[k].icon || 'fa-book' }));
    }
  } catch(e) {}

  const el = document.getElementById('view-subjects');
  el.innerHTML = `
    <h3 class="section-title"><i class="fas fa-book-open" style="color:var(--accent)"></i> ${lang ? 'विषय' : 'Subjects'}</h3>
    <p class="section-subtitle">${lang ? 'अपना विषय चुनें और सीखना शुरू करें' : 'Choose a topic to start learning'}</p>
    ${topics.length === 0 ? `
      <div class="empty-state">
        <i class="fas fa-book-open"></i>
        <p>${lang ? 'अभी कोई विषय नहीं जोड़ा गया' : 'No subjects added yet'}</p>
      </div>
    ` : ''}
    ${topics.map((t, i) => {
      const completed = userProgress[t.id] === true;
      return `<div class="topic-item" onclick="openSubjectLessons('${t.id}')">
        <div class="topic-num">${i + 1}</div>
        <div class="topic-info">
          <h4>${lang ? (t.titleHi || t.title) : t.title}</h4>
          <p>${lang ? (t.descHi || t.desc || '') : (t.desc || '')}</p>
        </div>
        <span class="topic-badge ${completed ? '' : 'pending'}">${completed ? (lang ? 'पूर्ण' : 'Done') : (lang ? 'शुरू करें' : 'Start')}</span>
        <i class="fas fa-chevron-right topic-arrow"></i>
      </div>`;
    }).join('')}
  `;
}

// ===== LESSON DETAIL VIEW =====
async function openLessonDetail(lessonId) {
  const lang = document.getElementById('lang-toggle').checked;
  const uid = getUID();
  showLoading(true);

  let lesson = null;
  try {
    const snap = await db.ref('lessons/' + lessonId).once('value');
    if (snap.exists()) lesson = { id: lessonId, ...snap.val() };
  } catch(e) {}

  if (!lesson) { showLoading(false); showToast(lang ? 'पाठ नहीं मिला' : 'Lesson not found'); return; }

  let isDone = false;
  try {
    const pSnap = await db.ref('users/' + uid + '/progress/' + lessonId).once('value');
    isDone = pSnap.val() === true;
  } catch(e) {}

  const hasVideo = lesson.videoUrl && lesson.videoUrl.trim() !== '';
  const hasPdf = lesson.pdfUrl && lesson.pdfUrl.trim() !== '';
  const hasImage = lesson.imageUrl && lesson.imageUrl.trim() !== '';
  const hasNotes = lesson.notes && lesson.notes.trim() !== '';
  const uploadDate = lesson.createdAt ? new Date(lesson.createdAt).toLocaleDateString() : '';

  // Build video embed URL
  let videoEmbedUrl = '';
  if (hasVideo) {
    videoEmbedUrl = convertToEmbedUrl(lesson.videoUrl);
  }

  const el = document.getElementById('view-lesson-detail');
  el.innerHTML = `
    <button onclick="navigateTo('lessons')" class="back-btn">
      <i class="fas fa-arrow-left"></i> ${lang ? 'वापस' : 'Back'}
    </button>
    <h3 class="section-title">${lang ? (lesson.titleHi || lesson.title) : lesson.title}</h3>
    <p class="section-subtitle">${lang ? (lesson.descHi || lesson.description || '') : (lesson.description || '')}${uploadDate ? ` • ${uploadDate}` : ''}</p>

    ${hasVideo ? `
    <div class="media-section">
      <div class="media-section-header"><i class="fas fa-play-circle"></i> ${lang ? 'वीडियो' : 'Video Lesson'}</div>
      <div class="media-section-body">
        <iframe src="${videoEmbedUrl}" allowfullscreen allow="autoplay; encrypted-media; fullscreen" loading="lazy"></iframe>
      </div>
    </div>
    ` : ''}

    ${hasImage ? `
    <div class="media-section">
      <div class="media-section-header"><i class="fas fa-image"></i> ${lang ? 'चित्र / आरेख' : 'Image / Diagram'}</div>
      <div class="media-section-body">
        <img src="${lesson.imageUrl}" alt="${lesson.title}" loading="lazy" onclick="window.open('${lesson.imageUrl}','_blank')" style="cursor:zoom-in;">
      </div>
    </div>
    ` : ''}

    ${hasPdf ? `
    <div class="media-section">
      <div class="media-section-header"><i class="fas fa-file-pdf"></i> ${lang ? 'PDF नोट्स' : 'PDF Notes'}</div>
      <div class="pdf-viewer-wrap">
        <iframe src="${lesson.pdfUrl}" loading="lazy"></iframe>
      </div>
      <div class="pdf-actions">
        <a href="${lesson.pdfUrl}" target="_blank" class="btn-secondary"><i class="fas fa-external-link-alt"></i> ${lang ? 'खोलें' : 'Open'}</a>
        <a href="${lesson.pdfUrl}" download class="btn-primary" style="box-shadow:none;font-size:.82rem;padding:10px;"><i class="fas fa-download"></i> ${lang ? 'डाउनलोड' : 'Download PDF'}</a>
      </div>
    </div>
    ` : ''}

    ${hasNotes ? `
    <div class="media-section">
      <div class="media-section-header">
        <i class="fas fa-book-reader"></i> ${lang ? 'अध्ययन सामग्री' : 'Reading Material'}
        <button class="download-notes-btn" onclick="downloadNotesAsPDF('${lessonId}')">
          <i class="fas fa-file-pdf"></i> ${lang ? 'PDF डाउनलोड' : 'Download PDF'}
        </button>
      </div>
      <div class="notes-content" id="notes-content-${lessonId}">
        <div class="reading-material">${lesson.notes}</div>
      </div>
    </div>
    ` : ''}

    <!-- MCQ Section - loaded dynamically -->
    <div id="lesson-mcq-section"></div>

    <button class="btn-complete ${isDone ? 'done' : ''}" onclick="markLessonComplete('${lessonId}', this)" ${isDone ? 'disabled' : ''}>
      <i class="fas ${isDone ? 'fa-check-circle' : 'fa-check'}"></i>
      ${isDone ? (lang ? 'पूर्ण ✅' : 'Completed ✅') : (lang ? 'पूर्ण चिह्नित करें' : 'Mark as Complete')}
    </button>
  `;
  loadLessonMCQSection(lessonId, lesson.subjectId || lesson.topicId || '', lang);
  navigateTo('lesson-detail');
  showLoading(false);
}

// Load and display MCQ section in lesson detail
async function loadLessonMCQSection(lessonId, subjectId, lang) {
  const section = document.getElementById('lesson-mcq-section');
  if (!section) return;
  let mcqCount = 0;
  try {
    const snap = await db.ref('mcqs').orderByChild('lessonId').equalTo(lessonId).once('value');
    if (snap.exists()) mcqCount = Object.keys(snap.val()).length;
  } catch(e) {}

  if (mcqCount > 0) {
    section.innerHTML = `
      <div class="media-section" style="cursor:pointer;" onclick="startLessonMCQ('${subjectId}','${lessonId}')">
        <div class="media-section-header">
          <i class="fas fa-clipboard-check"></i> ${lang ? 'MCQ प्रश्न' : 'MCQ Questions'}
          <span style="margin-left:auto;font-size:.75rem;padding:3px 10px;border-radius:12px;background:rgba(10,132,255,.1);color:var(--accent);font-weight:700;">${mcqCount} ${lang ? 'प्रश्न' : 'Qs'}</span>
        </div>
        <div style="padding:16px;text-align:center;">
          <div style="font-size:2rem;margin-bottom:8px;">📝</div>
          <h4 style="font-size:.9rem;font-weight:600;margin-bottom:4px;">${lang ? 'MCQ अभ्यास शुरू करें' : 'Start MCQ Practice'}</h4>
          <p style="font-size:.78rem;color:var(--text2);">${mcqCount} ${lang ? 'बहुविकल्पीय प्रश्न उपलब्ध' : 'multiple choice questions available'}</p>
          <button class="btn-primary" style="margin-top:12px;width:auto;padding:10px 24px;font-size:.85rem;">
            <i class="fas fa-play"></i> ${lang ? 'शुरू करें' : 'Start Now'}
          </button>
        </div>
      </div>`;
  } else {
    section.innerHTML = '';
  }
}

// Download notes as PDF using browser print
function downloadNotesAsPDF(lessonId) {
  const notesEl = document.getElementById('notes-content-' + lessonId);
  if (!notesEl) { showToast('No notes to download'); return; }
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>ITI Vidhya - Notes</title>
    <style>body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;padding:30px;color:#333;line-height:1.8;}
    h1,h2,h3,h4{color:#1a1a2e;margin-top:16px;}ul,ol{padding-left:24px;}li{margin-bottom:6px;}p{margin-bottom:10px;}
    .header{text-align:center;border-bottom:2px solid #0a84ff;padding-bottom:16px;margin-bottom:24px;}.header h1{color:#0a84ff;font-size:1.5rem;}
    .footer{text-align:center;margin-top:40px;font-size:.8rem;color:#999;border-top:1px solid #eee;padding-top:12px;}</style></head><body>
    <div class="header"><h1>📚 ITI Vidhya</h1><p>Study Material</p></div>
    ${notesEl.innerHTML}
    <div class="footer">Downloaded from ITI Vidhya App • ${new Date().toLocaleDateString()}</div></body></html>`);
  printWindow.document.close();
  setTimeout(() => { printWindow.print(); }, 500);
}

// Convert YouTube URL to embed format
function convertToEmbedUrl(url) {
  if (!url) return '';
  if (url.includes('/embed/')) return url;
  let match = url.match(/[?&]v=([^&]+)/);
  if (match) return 'https://www.youtube.com/embed/' + match[1];
  match = url.match(/youtu\.be\/([^?&]+)/);
  if (match) return 'https://www.youtube.com/embed/' + match[1];
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

function getContentType(item) {
  if (item.videoUrl && item.videoUrl.trim()) return 'video';
  if (item.pdfUrl && item.pdfUrl.trim()) return 'pdf';
  if (item.imageUrl && item.imageUrl.trim()) return 'image';
  if (item.notes && item.notes.trim()) return 'notes';
  return 'notes';
}
