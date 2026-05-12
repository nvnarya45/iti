// ===== Admin Module - Upgraded =====
let adminTab = 'study-material';

async function renderAdmin() {
  const lang = document.getElementById('lang-toggle').checked;
  const el = document.getElementById('view-admin');
  el.innerHTML = `
    <h3 class="section-title"><i class="fas fa-shield-alt" style="color:var(--accent)"></i> ${lang ? 'एडमिन पैनल' : 'Admin Panel'}</h3>
    <div class="admin-tabs">
      <button class="admin-tab ${adminTab==='study-material'?'active':''}" onclick="switchAdminTab('study-material')">📖 ${lang?'अध्ययन सामग्री':'Study Material'}</button>
      <button class="admin-tab ${adminTab==='quiz'?'active':''}" onclick="switchAdminTab('quiz')">📝 ${lang?'क्विज़':'Quiz'}</button>
      <button class="admin-tab ${adminTab==='subjects'?'active':''}" onclick="switchAdminTab('subjects')">📂 ${lang?'विषय':'Subjects'}</button>
      <button class="admin-tab ${adminTab==='uploads'?'active':''}" onclick="switchAdminTab('uploads')">📤 ${lang?'अपलोड':'Uploads'}</button>
      <button class="admin-tab ${adminTab==='users'?'active':''}" onclick="switchAdminTab('users')">👥 ${lang?'उपयोगकर्ता':'Users'}</button>
    </div>
    <div id="admin-content"></div>
  `;
  renderAdminContent();
}

function switchAdminTab(tab) { adminTab = tab; renderAdmin(); }

async function getSubjectOptions() {
  let topics = [...defaultTopics];
  try {
    const tSnap = await db.ref('topics').once('value');
    if (tSnap.exists()) {
      const fb = tSnap.val();
      const extra = Object.keys(fb).map(k => ({ id: k, title: fb[k].title || k, titleHi: fb[k].titleHi || '' }));
      topics = [...topics, ...extra.filter(e => !topics.find(t => t.id === e.id))];
    }
  } catch(e) {}
  return topics.map(t => `<option value="${t.id}">${t.title} ${t.titleHi ? '('+t.titleHi+')' : ''}</option>`).join('');
}

async function renderAdminContent() {
  const lang = document.getElementById('lang-toggle').checked;
  const container = document.getElementById('admin-content');
  if (!container) return;

  if (adminTab === 'study-material') {
    const subjectOpts = await getSubjectOptions();
    container.innerHTML = `
      <div class="card admin-form">
        <h4 class="admin-form-title"><i class="fas fa-plus-circle" style="color:var(--success)"></i> ${lang?'नई अध्ययन सामग्री जोड़ें':'Add New Study Material'}</h4>
        <div class="admin-field-group">
          <label>${lang?'विषय चुनें':'Select Subject'} <span class="required">*</span></label>
          <div class="input-group"><i class="fas fa-folder"></i>
            <select id="adm-lesson-subject"><option value="">-- ${lang?'विषय चुनें':'Select Subject'} --</option>${subjectOpts}</select>
          </div>
        </div>
        <div class="admin-field-group">
          <label>${lang?'पाठ शीर्षक (English)':'Lesson Title (English)'} <span class="required">*</span></label>
          <div class="input-group"><i class="fas fa-heading"></i><input type="text" id="adm-lesson-title" placeholder="${lang?'शीर्षक अंग्रेजी में':'Title in English'}"></div>
        </div>
        <div class="admin-field-group">
          <label>${lang?'पाठ शीर्षक (हिंदी)':'Lesson Title (Hindi)'}</label>
          <div class="input-group"><i class="fas fa-heading"></i><input type="text" id="adm-lesson-titlehi" placeholder="${lang?'शीर्षक हिंदी में':'Title in Hindi'}" dir="auto" lang="hi"></div>
        </div>
        <div class="admin-field-group">
          <label>${lang?'विवरण':'Description'}</label>
          <div class="input-group"><i class="fas fa-align-left"></i><input type="text" id="adm-lesson-desc" placeholder="${lang?'संक्षिप्त विवरण':'Short description'}"></div>
        </div>
        <div class="admin-field-group">
          <label>${lang?'अध्ययन सामग्री / नोट्स':'Reading Material / Notes'}</label>
          <p class="field-hint"><i class="fas fa-info-circle"></i> ${lang?'हिंदी में पेस्ट करें — पूरा सपोर्ट है':'Paste Hindi content — fully supported. HTML tags allowed.'}</p>
          <textarea id="adm-lesson-notes" class="admin-textarea" placeholder="${lang?'यहाँ अध्ययन सामग्री लिखें या पेस्ट करें...\n\nहिंदी में भी लिख सकते हैं।\n\nHTML टैग सपोर्टेड हैं: <h3>, <p>, <ul>, <li>, <b>':'Write or paste study material here...\n\nHindi content fully supported.\n\nHTML tags supported: <h3>, <p>, <ul>, <li>, <b>'}" dir="auto" lang="hi" accept-charset="UTF-8" spellcheck="false"></textarea>
        </div>
        <div class="admin-field-group">
          <label>${lang?'वीडियो URL':'Video URL (YouTube)'}</label>
          <div class="input-group"><i class="fas fa-video"></i><input type="text" id="adm-lesson-video" placeholder="https://youtube.com/watch?v=..."></div>
        </div>
        <div class="admin-field-group">
          <label>${lang?'PDF URL':'PDF URL'}</label>
          <div class="input-group"><i class="fas fa-file-pdf"></i><input type="text" id="adm-lesson-pdf" placeholder="${lang?'PDF लिंक':'PDF link'}"></div>
        </div>
        <div class="admin-field-group">
          <label>${lang?'छवि URL':'Image URL'}</label>
          <div class="input-group"><i class="fas fa-image"></i><input type="text" id="adm-lesson-img" placeholder="${lang?'छवि लिंक':'Image link'}"></div>
        </div>
        <div class="admin-field-group">
          <label>${lang?'क्रम संख्या':'Order Number'}</label>
          <div class="input-group"><i class="fas fa-sort-numeric-up"></i><input type="number" id="adm-lesson-order" placeholder="1, 2, 3..." value="1"></div>
        </div>
        <input type="hidden" id="adm-lesson-edit-id" value="">
        <div class="admin-btn-row">
          <button class="btn-primary" onclick="saveStudyMaterial()"><i class="fas fa-save"></i> ${lang?'सहेजें':'Save Material'}</button>
          <button class="btn-secondary" onclick="clearLessonForm()" style="flex:0.5"><i class="fas fa-eraser"></i> ${lang?'साफ़':'Clear'}</button>
        </div>
      </div>
      <h4 class="admin-section-heading">${lang?'मौजूदा सामग्री':'Existing Materials'}</h4>
      <div class="admin-filter-row">
        <select id="admin-filter-subject" onchange="loadAdminLessons()">
          <option value="all">${lang?'सभी विषय':'All Subjects'}</option>${subjectOpts}
        </select>
      </div>
      <div id="admin-lesson-list"></div>
    `;
    loadAdminLessons();
  } else if (adminTab === 'quiz') {
    const subjectOpts = await getSubjectOptions();
    container.innerHTML = `
      <div class="card admin-form">
        <h4 class="admin-form-title"><i class="fas fa-plus-circle" style="color:var(--success)"></i> ${lang?'नया प्रश्न जोड़ें':'Add Quiz Question'}</h4>
        <div class="input-group"><i class="fas fa-list"></i>
          <select id="adm-quiz-select">
            <option value="">Select Quiz</option>
            <option value="basic-quiz">Basic Electrical Quiz</option>
            <option value="ohms-quiz">Ohm's Law Quiz</option>
            <option value="circuit-quiz">AC/DC Circuit Quiz</option>
            <option value="wiring-quiz">Wiring Quiz</option>
            <option value="motor-quiz">Motor Winding Quiz</option>
          </select>
        </div>
        <div class="input-group"><i class="fas fa-question"></i><input type="text" id="adm-q-text" placeholder="${lang?'प्रश्न (English)':'Question (English)'}"></div>
        <div class="input-group"><i class="fas fa-question"></i><input type="text" id="adm-q-texthi" placeholder="${lang?'प्रश्न (हिंदी)':'Question (Hindi)'}" dir="auto" lang="hi"></div>
        <div class="input-group"><i class="fas fa-font"></i><input type="text" id="adm-q-a" placeholder="Option A"></div>
        <div class="input-group"><i class="fas fa-font"></i><input type="text" id="adm-q-b" placeholder="Option B"></div>
        <div class="input-group"><i class="fas fa-font"></i><input type="text" id="adm-q-c" placeholder="Option C"></div>
        <div class="input-group"><i class="fas fa-font"></i><input type="text" id="adm-q-d" placeholder="Option D"></div>
        <div class="input-group"><i class="fas fa-check"></i>
          <select id="adm-q-correct"><option value="0">Correct: A</option><option value="1">Correct: B</option><option value="2">Correct: C</option><option value="3">Correct: D</option></select>
        </div>
        <div class="input-group"><i class="fas fa-lightbulb"></i><textarea id="adm-q-explain" placeholder="${lang?'व्याख्या':'Explanation'}" style="min-height:60px;"></textarea></div>
        <button class="btn-primary" onclick="saveQuizQuestion()"><i class="fas fa-plus"></i> ${lang?'प्रश्न जोड़ें':'Add Question'}</button>
      </div>
    `;
  } else if (adminTab === 'subjects') {
    container.innerHTML = `
      <div class="card admin-form">
        <h4 class="admin-form-title"><i class="fas fa-folder-plus" style="color:var(--warning)"></i> ${lang?'नया विषय':'Add New Subject'}</h4>
        <div class="input-group"><i class="fas fa-heading"></i><input type="text" id="adm-topic-title" placeholder="Subject Title (English)"></div>
        <div class="input-group"><i class="fas fa-heading"></i><input type="text" id="adm-topic-titlehi" placeholder="विषय शीर्षक (हिंदी)" dir="auto" lang="hi"></div>
        <div class="input-group"><i class="fas fa-align-left"></i><input type="text" id="adm-topic-desc" placeholder="Description"></div>
        <button class="btn-primary" onclick="saveTopic()"><i class="fas fa-save"></i> ${lang?'विषय सहेजें':'Save Subject'}</button>
      </div>
    `;
  } else if (adminTab === 'uploads') {
    container.innerHTML = `
      <div class="card">
        <h4 class="admin-form-title"><i class="fas fa-cloud-upload-alt" style="color:var(--accent)"></i> ${lang?'फ़ाइल अपलोड':'Upload Files'}</h4>
        <div class="file-upload" onclick="document.getElementById('file-input').click()">
          <i class="fas fa-cloud-upload-alt"></i>
          <p>${lang?'छवि, PDF, या वीडियो अपलोड करें':'Upload Image, PDF, or Video'}</p>
          <p style="font-size:.72rem;color:var(--text3);margin-top:4px;">Max 50MB</p>
        </div>
        <input type="file" id="file-input" style="display:none" accept="image/*,.pdf,video/*" onchange="uploadFile(this)">
        <div class="input-group"><i class="fas fa-tag"></i><input type="text" id="upload-title" placeholder="${lang?'फ़ाइल शीर्षक':'File title'}"></div>
        <div id="upload-status" style="font-size:.82rem;color:var(--text2);margin-top:8px;"></div>
      </div>
      <h4 class="admin-section-heading">${lang?'अपलोड की गई फ़ाइलें':'Uploaded Files'}</h4>
      <div id="uploads-list"></div>
    `;
    loadUploads();
  } else if (adminTab === 'users') {
    container.innerHTML = `<div id="admin-users-list"><p style="color:var(--text2);font-size:.85rem;">Loading users...</p></div>`;
    loadAdminUsers();
  }
}

// ===== Save Study Material (with Hindi support) =====
async function saveStudyMaterial() {
  const subjectId = document.getElementById('adm-lesson-subject').value;
  const title = document.getElementById('adm-lesson-title').value.trim();
  if (!subjectId) { showToast('Please select a subject'); return; }
  if (!title) { showToast('Enter lesson title'); return; }

  const editId = document.getElementById('adm-lesson-edit-id').value;
  const id = editId || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const notesRaw = document.getElementById('adm-lesson-notes').value;
  // Preserve Hindi/Unicode content exactly as entered
  const notes = notesRaw;

  showLoading(true);
  try {
    const data = {
      title,
      titleHi: document.getElementById('adm-lesson-titlehi').value.trim(),
      description: document.getElementById('adm-lesson-desc').value.trim(),
      notes: notes,
      videoUrl: document.getElementById('adm-lesson-video').value.trim(),
      pdfUrl: document.getElementById('adm-lesson-pdf').value.trim(),
      imageUrl: document.getElementById('adm-lesson-img').value.trim(),
      subjectId: subjectId,
      topicId: subjectId,
      order: parseInt(document.getElementById('adm-lesson-order').value) || 1,
      createdAt: Date.now()
    };
    await db.ref('lessons/' + id).set(data);
    showToast(editId ? 'Updated! ✅' : 'Saved! ✅');
    clearLessonForm();
    loadAdminLessons();
  } catch(e) { showToast('Error: ' + e.message); }
  showLoading(false);
}

function clearLessonForm() {
  ['adm-lesson-title','adm-lesson-titlehi','adm-lesson-desc','adm-lesson-notes','adm-lesson-video','adm-lesson-pdf','adm-lesson-img'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('adm-lesson-subject').selectedIndex = 0;
  document.getElementById('adm-lesson-order').value = '1';
  document.getElementById('adm-lesson-edit-id').value = '';
}

async function saveQuizQuestion() {
  const quizId = document.getElementById('adm-quiz-select').value;
  if (!quizId) { showToast('Select a quiz'); return; }
  const q = document.getElementById('adm-q-text').value.trim();
  if (!q) { showToast('Enter question text'); return; }
  showLoading(true);
  try {
    const newRef = db.ref('quizQuestions/' + quizId).push();
    await newRef.set({
      q, qHi: document.getElementById('adm-q-texthi').value.trim(),
      options: [document.getElementById('adm-q-a').value, document.getElementById('adm-q-b').value, document.getElementById('adm-q-c').value, document.getElementById('adm-q-d').value],
      correct: parseInt(document.getElementById('adm-q-correct').value),
      explanation: document.getElementById('adm-q-explain').value.trim()
    });
    showToast('Question added! ✅');
  } catch(e) { showToast('Error saving question'); }
  showLoading(false);
}

async function saveTopic() {
  const title = document.getElementById('adm-topic-title').value.trim();
  if (!title) { showToast('Enter subject title'); return; }
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  showLoading(true);
  try {
    await db.ref('topics/' + id).set({
      title, titleHi: document.getElementById('adm-topic-titlehi').value.trim(),
      desc: document.getElementById('adm-topic-desc').value.trim(), createdAt: Date.now()
    });
    showToast('Subject saved! ✅');
  } catch(e) { showToast('Error saving subject'); }
  showLoading(false);
}

async function uploadFile(input) {
  const file = input.files[0];
  if (!file) return;
  const status = document.getElementById('upload-status');
  status.textContent = 'Uploading... 0%';
  const ref = storage.ref('uploads/' + Date.now() + '_' + file.name);
  const task = ref.put(file);
  task.on('state_changed', snap => {
    const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
    status.textContent = `Uploading... ${pct}%`;
  }, err => {
    status.textContent = 'Upload failed!';
  }, async () => {
    const url = await ref.getDownloadURL();
    const title = document.getElementById('upload-title').value.trim() || file.name;
    await db.ref('uploads').push({ title, url, type: file.type, name: file.name, date: Date.now() });
    status.textContent = 'Upload complete! ✅ URL copied!';
    // Auto-copy URL
    try { await navigator.clipboard.writeText(url); } catch(e) {}
    showToast('Uploaded! URL: ' + url.substring(0, 50) + '...');
    loadUploads();
  });
}

async function loadAdminLessons() {
  const list = document.getElementById('admin-lesson-list');
  if (!list) return;
  const filterEl = document.getElementById('admin-filter-subject');
  const filterSubject = filterEl ? filterEl.value : 'all';

  try {
    const snap = await db.ref('lessons').once('value');
    if (!snap.exists()) { list.innerHTML = '<p style="color:var(--text2);font-size:.82rem;">No materials yet</p>'; return; }
    const data = snap.val();
    let keys = Object.keys(data);
    if (filterSubject !== 'all') {
      keys = keys.filter(k => data[k].subjectId === filterSubject || data[k].topicId === filterSubject);
    }
    if (keys.length === 0) { list.innerHTML = '<p style="color:var(--text2);font-size:.82rem;">No materials for this subject</p>'; return; }

    list.innerHTML = keys.map(k => {
      const d = data[k];
      const subj = d.subjectId || d.topicId || '';
      return `
      <div class="admin-list-item">
        <div class="item-info">
          <h4>${d.title}</h4>
          <p><span class="mini-badge notes" style="font-size:.65rem;">${subj}</span> ${d.notes ? '📖' : ''} ${d.pdfUrl ? '📄' : ''} ${d.videoUrl ? '🎬' : ''}</p>
        </div>
        <div class="admin-actions">
          <button class="btn-edit" onclick="editLesson('${k}')"><i class="fas fa-edit"></i></button>
          <button class="btn-delete" onclick="deleteItem('lessons','${k}')"><i class="fas fa-trash"></i></button>
        </div>
      </div>`;
    }).join('');
  } catch(e) { list.innerHTML = '<p style="color:var(--text2);">Error loading</p>'; }
}

async function loadUploads() {
  const list = document.getElementById('uploads-list');
  if (!list) return;
  try {
    const snap = await db.ref('uploads').once('value');
    if (!snap.exists()) { list.innerHTML = '<p style="color:var(--text2);font-size:.82rem;">No uploads yet</p>'; return; }
    const data = snap.val();
    list.innerHTML = Object.keys(data).map(k => `
      <div class="admin-list-item">
        <div class="item-info"><h4>${data[k].title}</h4><p>${data[k].name || ''}</p></div>
        <div class="admin-actions">
          <button class="btn-edit" onclick="copyUrl('${data[k].url}')" title="Copy URL"><i class="fas fa-copy"></i></button>
          <a href="${data[k].url}" target="_blank" style="width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:rgba(10,132,255,.1);color:var(--accent);font-size:.8rem;"><i class="fas fa-external-link-alt"></i></a>
          <button class="btn-delete" onclick="deleteItem('uploads','${k}')"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `).join('');
  } catch(e) {}
}

function copyUrl(url) {
  navigator.clipboard.writeText(url).then(() => showToast('URL copied! 📋')).catch(() => showToast('Copy failed'));
}

async function loadAdminUsers() {
  const list = document.getElementById('admin-users-list');
  if (!list) return;
  try {
    const snap = await db.ref('users').once('value');
    if (!snap.exists()) { list.innerHTML = '<p style="color:var(--text2);">No users</p>'; return; }
    const data = snap.val();
    list.innerHTML = Object.keys(data).map(k => `
      <div class="admin-list-item">
        <div class="item-info"><h4>${data[k].name || 'User'}</h4><p>${data[k].email} • ${data[k].role || 'student'}</p></div>
        <div class="admin-actions">
          <button class="btn-edit" onclick="toggleUserRole('${k}','${data[k].role || 'student'}')" title="Toggle role"><i class="fas fa-user-shield"></i></button>
        </div>
      </div>
    `).join('');
  } catch(e) {}
}

async function toggleUserRole(uid, currentRole) {
  const newRole = currentRole === 'admin' ? 'student' : 'admin';
  await db.ref('users/' + uid + '/role').set(newRole);
  showToast(`Role changed to ${newRole}`);
  loadAdminUsers();
}

async function deleteItem(path, key) {
  if (!confirm('Delete this item?')) return;
  await db.ref(path + '/' + key).remove();
  showToast('Deleted ✅');
  renderAdmin();
}

async function editLesson(id) {
  showLoading(true);
  try {
    const snap = await db.ref('lessons/' + id).once('value');
    if (!snap.exists()) { showToast('Not found'); showLoading(false); return; }
    const l = snap.val();
    adminTab = 'study-material';
    await renderAdmin();
    setTimeout(() => {
      document.getElementById('adm-lesson-edit-id').value = id;
      document.getElementById('adm-lesson-subject').value = l.subjectId || l.topicId || '';
      document.getElementById('adm-lesson-title').value = l.title || '';
      document.getElementById('adm-lesson-titlehi').value = l.titleHi || '';
      document.getElementById('adm-lesson-desc').value = l.description || '';
      document.getElementById('adm-lesson-notes').value = l.notes || '';
      document.getElementById('adm-lesson-video').value = l.videoUrl || '';
      document.getElementById('adm-lesson-pdf').value = l.pdfUrl || '';
      document.getElementById('adm-lesson-img').value = l.imageUrl || '';
      document.getElementById('adm-lesson-order').value = l.order || 1;
      showToast('Editing: ' + l.title);
      window.scrollTo(0, 0);
    }, 300);
  } catch(e) { showToast('Error loading'); }
  showLoading(false);
}
