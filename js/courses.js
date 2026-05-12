// ===== Courses & Lessons Module =====
// Subjects with unique structure - each subject has its own lessons
const defaultTopics = [
  { id: 'basic-electrical', title: 'Basic Electrical Theory', titleHi: 'बुनियादी विद्युत सिद्धांत', icon: 'fa-bolt', color: 'blue', desc: 'Voltage, Current, Resistance basics', descHi: 'वोल्टेज, करंट, प्रतिरोध की मूल बातें' },
  { id: 'ohms-law', title: "Ohm's Law", titleHi: 'ओम का नियम', icon: 'fa-calculator', color: 'purple', desc: 'V = IR and its applications', descHi: 'V = IR और इसके अनुप्रयोग' },
  { id: 'ac-dc', title: 'AC/DC Circuits', titleHi: 'AC/DC सर्किट', icon: 'fa-wave-square', color: 'green', desc: 'Alternating & Direct current circuits', descHi: 'प्रत्यावर्ती और दिष्ट धारा परिपथ' },
  { id: 'wiring', title: 'Wiring Diagrams', titleHi: 'वायरिंग आरेख', icon: 'fa-project-diagram', color: 'orange', desc: 'House wiring and industrial wiring', descHi: 'घरेलू और औद्योगिक वायरिंग' },
  { id: 'motor', title: 'Motor Winding', titleHi: 'मोटर वाइंडिंग', icon: 'fa-cog', color: 'red', desc: 'Single & three phase motor winding', descHi: 'सिंगल और थ्री फेज मोटर वाइंडिंग' },
  { id: 'safety', title: 'Electrical Safety', titleHi: 'विद्युत सुरक्षा', icon: 'fa-shield-alt', color: 'teal', desc: 'Safety practices and earthing', descHi: 'सुरक्षा अभ्यास और अर्थिंग' },
  { id: 'transformer', title: 'Transformer', titleHi: 'ट्रांसफार्मर', icon: 'fa-random', color: 'purple', desc: 'Types, working principle, losses', descHi: 'प्रकार, कार्य सिद्धांत, हानियाँ' },
  { id: 'electrical-tools', title: 'Electrical Tools', titleHi: 'विद्युत उपकरण', icon: 'fa-tools', color: 'orange', desc: 'Hand tools, power tools, measuring instruments', descHi: 'हैंड टूल, पावर टूल, मापक यंत्र' },
  { id: 'earthing', title: 'Earthing & Grounding', titleHi: 'अर्थिंग और ग्राउंडिंग', icon: 'fa-plug', color: 'green', desc: 'Types of earthing, IS standards', descHi: 'अर्थिंग के प्रकार, IS मानक' },
  { id: 'batteries', title: 'Batteries & Cells', titleHi: 'बैटरी और सेल', icon: 'fa-battery-full', color: 'blue', desc: 'Primary, secondary cells, maintenance', descHi: 'प्राथमिक, द्वितीयक सेल, रखरखाव' },
  { id: 'capacitor', title: 'Capacitors', titleHi: 'कैपेसिटर', icon: 'fa-hdd', color: 'teal', desc: 'Types, charging, discharging, uses', descHi: 'प्रकार, चार्जिंग, डिस्चार्जिंग, उपयोग' },
  { id: 'semiconductor', title: 'Semiconductors & Diodes', titleHi: 'अर्धचालक और डायोड', icon: 'fa-microchip', color: 'red', desc: 'PN junction, rectifiers, LED', descHi: 'PN जंक्शन, रेक्टिफायर, LED' },
  { id: 'electrical-machines', title: 'Electrical Machines', titleHi: 'विद्युत मशीनें', icon: 'fa-industry', color: 'purple', desc: 'Generators, alternators, starters', descHi: 'जनरेटर, अल्टरनेटर, स्टार्टर' },
  { id: 'plc-basics', title: 'PLC Basics', titleHi: 'PLC की मूल बातें', icon: 'fa-desktop', color: 'blue', desc: 'Introduction to programmable logic controllers', descHi: 'प्रोग्रामेबल लॉजिक कंट्रोलर का परिचय' },
  { id: 'energy-meter', title: 'Energy Meter & Billing', titleHi: 'एनर्जी मीटर और बिलिंग', icon: 'fa-tachometer-alt', color: 'orange', desc: 'Types of meters, tariff, reading', descHi: 'मीटर के प्रकार, टैरिफ, रीडिंग' },
  { id: 'solar-energy', title: 'Solar Energy Systems', titleHi: 'सौर ऊर्जा प्रणाली', icon: 'fa-sun', color: 'green', desc: 'Solar panels, inverters, installation', descHi: 'सोलर पैनल, इनवर्टर, स्थापना' },
];

// ===== HOME PAGE - Simple & Direct Lesson Access =====
async function renderHome() {
  const lang = document.getElementById('lang-toggle').checked;
  const uid = getUID();
  let userProgress = {};
  try {
    const snap = await db.ref('users/' + uid + '/progress').once('value');
    if (snap.exists()) userProgress = snap.val();
  } catch(e) {}

  // Get all topics including Firebase ones
  let topics = [...defaultTopics];
  try {
    const tSnap = await db.ref('topics').once('value');
    if (tSnap.exists()) {
      const fbTopics = tSnap.val();
      const extra = Object.keys(fbTopics).map(k => ({ id: k, ...fbTopics[k], color: fbTopics[k].color || 'blue', icon: fbTopics[k].icon || 'fa-book' }));
      topics = [...topics, ...extra.filter(e => !topics.find(t => t.id === e.id))];
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

  // Also count default lessons
  defaultLessonsData.forEach(l => {
    const topicId = l.topicId || '';
    if (topicId && !lessonCounts[topicId]) {
      lessonCounts[topicId] = (lessonCounts[topicId] || 0) + 1;
    }
  });

  const el = document.getElementById('view-home');
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
        const count = lessonCounts[t.id] || 1;
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
      <div class="home-action-card" onclick="navigateTo('quiz')">
        <i class="fas fa-clipboard-check"></i>
        <span>${lang ? 'क्विज़ दें' : 'Take Quiz'}</span>
      </div>
      <div class="home-action-card" onclick="navigateTo('progress')">
        <i class="fas fa-chart-line"></i>
        <span>${lang ? 'प्रगति' : 'Progress'}</span>
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

  // Find subject info
  let subjectInfo = defaultTopics.find(t => t.id === subjectId);
  if (!subjectInfo) {
    try {
      const tSnap = await db.ref('topics/' + subjectId).once('value');
      if (tSnap.exists()) subjectInfo = { id: subjectId, ...tSnap.val() };
    } catch(e) {}
  }
  if (!subjectInfo) subjectInfo = { id: subjectId, title: subjectId, titleHi: subjectId };

  let userProgress = {};
  try {
    const snap = await db.ref('users/' + uid + '/progress').once('value');
    if (snap.exists()) userProgress = snap.val();
  } catch(e) {}

  // Get lessons FOR THIS SUBJECT from Firebase
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

  // Also add default lessons for this subject
  const defaultForSubject = defaultLessonsData.filter(l => l.topicId === subjectId);
  defaultForSubject.forEach(dl => {
    if (!lessons.find(l => l.id === dl.id)) {
      lessons.push(dl);
    }
  });

  // Sort by createdAt or order
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
        <p class="sub">${lang ? 'एडमिन जल्दी ही सामग्री जोड़ेगा' : 'Admin will add content soon'}</p>
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
      return `<div class="topic-item" onclick="openSubjectLessons('${t.id}')">
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

  if (!lesson) {
    const dl = defaultLessonsData.find(l => l.id === lessonId);
    if (dl) lesson = dl;
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
    <button onclick="navigateTo('lessons')" class="back-btn">
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
        <a href="${lesson.pdfUrl}" download class="btn-primary" style="box-shadow:none;font-size:.82rem;padding:10px;"><i class="fas fa-download"></i> ${lang ? 'डाउनलोड' : 'Download PDF'}</a>
      </div>
    </div>
    ` : ''}

    ${hasNotes ? `
    <!-- READING MATERIAL / NOTES SECTION -->
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

    ${!hasAnyContent ? `
    <div class="empty-state">
      <i class="fas fa-inbox"></i>
      <p>${lang ? 'सामग्री जल्द जोड़ी जाएगी' : 'Content will be added soon by admin'}</p>
      <p class="sub">${lang ? 'कृपया बाद में देखें' : 'Please check back later'}</p>
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

// Download notes as PDF using browser print
function downloadNotesAsPDF(lessonId) {
  const notesEl = document.getElementById('notes-content-' + lessonId);
  if (!notesEl) { showToast('No notes to download'); return; }

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>ITI Vidhya - Reading Material</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #333; line-height: 1.8; }
        h1,h2,h3,h4 { color: #1a1a2e; margin-top: 16px; }
        ul,ol { padding-left: 24px; }
        li { margin-bottom: 6px; }
        p { margin-bottom: 10px; }
        .header { text-align: center; border-bottom: 2px solid #0a84ff; padding-bottom: 16px; margin-bottom: 24px; }
        .header h1 { color: #0a84ff; font-size: 1.5rem; }
        .footer { text-align: center; margin-top: 40px; font-size: 0.8rem; color: #999; border-top: 1px solid #eee; padding-top: 12px; }
      </style>
    </head>
    <body>
      <div class="header"><h1>📚 ITI Vidhya</h1><p>Study Material</p></div>
      ${notesEl.innerHTML}
      <div class="footer">Downloaded from ITI Vidhya App • ${new Date().toLocaleDateString()}</div>
    </body>
    </html>
  `);
  printWindow.document.close();
  setTimeout(() => { printWindow.print(); }, 500);
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
