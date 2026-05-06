// ===== Admin Module =====
let adminTab = 'lessons';

async function renderAdmin() {
  const lang = document.getElementById('lang-toggle').checked;
  const el = document.getElementById('view-admin');
  el.innerHTML = `
    <h3 class="section-title"><i class="fas fa-cog" style="color:var(--accent)"></i> ${lang ? 'एडमिन पैनल' : 'Admin Panel'}</h3>
    <div class="admin-tabs">
      <button class="admin-tab ${adminTab==='lessons'?'active':''}" onclick="switchAdminTab('lessons')">${lang ? 'पाठ' : '📚 Lessons'}</button>
      <button class="admin-tab ${adminTab==='quiz'?'active':''}" onclick="switchAdminTab('quiz')">${lang ? 'क्विज़' : '📝 Quiz'}</button>
      <button class="admin-tab ${adminTab==='topics'?'active':''}" onclick="switchAdminTab('topics')">${lang ? 'विषय' : '📂 Topics'}</button>
      <button class="admin-tab ${adminTab==='uploads'?'active':''}" onclick="switchAdminTab('uploads')">${lang ? 'अपलोड' : '📤 Uploads'}</button>
      <button class="admin-tab ${adminTab==='users'?'active':''}" onclick="switchAdminTab('users')">${lang ? 'उपयोगकर्ता' : '👥 Users'}</button>
    </div>
    <div id="admin-content"></div>
  `;
  renderAdminContent();
}

function switchAdminTab(tab) {
  adminTab = tab;
  renderAdmin();
}

async function renderAdminContent() {
  const lang = document.getElementById('lang-toggle').checked;
  const container = document.getElementById('admin-content');
  if (!container) return;

  if (adminTab === 'lessons') {
    container.innerHTML = `
      <div class="card admin-form">
        <h4 style="font-size:.95rem;font-weight:600;margin-bottom:12px;">${lang ? 'नया पाठ जोड़ें' : 'Add New Lesson'}</h4>
        <div class="input-group"><i class="fas fa-heading"></i><input type="text" id="adm-lesson-title" placeholder="${lang ? 'शीर्षक' : 'Lesson Title'}"></div>
        <div class="input-group"><i class="fas fa-heading"></i><input type="text" id="adm-lesson-titlehi" placeholder="${lang ? 'हिंदी शीर्षक' : 'Title (Hindi)'}"></div>
        <div class="input-group"><i class="fas fa-align-left"></i><textarea id="adm-lesson-desc" placeholder="${lang ? 'विवरण' : 'Description'}"></textarea></div>
        <div class="input-group"><i class="fas fa-align-left"></i><textarea id="adm-lesson-notes" placeholder="${lang ? 'नोट्स सामग्री' : 'Notes content (HTML supported)'}"></textarea></div>
        <div class="input-group"><i class="fas fa-video"></i><input type="text" id="adm-lesson-video" placeholder="${lang ? 'वीडियो URL (YouTube embed)' : 'Video URL (YouTube embed)'}"></div>
        <div class="input-group"><i class="fas fa-file-pdf"></i><input type="text" id="adm-lesson-pdf" placeholder="${lang ? 'PDF URL' : 'PDF URL'}"></div>
        <div class="input-group"><i class="fas fa-image"></i><input type="text" id="adm-lesson-img" placeholder="${lang ? 'छवि URL' : 'Image URL'}"></div>
        <div class="input-group"><i class="fas fa-photo-video"></i><input type="text" id="adm-lesson-thumb" placeholder="${lang ? 'थंबनेल URL (वैकल्पिक)' : 'Thumbnail URL (optional)'}"></div>
        <div class="input-group"><i class="fas fa-folder"></i>
          <select id="adm-lesson-topic">
            <option value="">Select Topic</option>
            <option value="basic-electrical">Basic Electrical</option>
            <option value="ohms-law">Ohm's Law</option>
            <option value="ac-dc">AC/DC Circuits</option>
            <option value="wiring">Wiring Diagrams</option>
            <option value="motor">Motor Winding</option>
            <option value="safety">Electrical Safety</option>
          </select>
        </div>
        <p style="font-size:.72rem;color:var(--text2);margin-bottom:12px;"><i class="fas fa-info-circle"></i> ${lang ? 'टिप: केवल वही फ़ील्ड भरें जो आप अपलोड करना चाहते हैं। खाली फ़ील्ड छात्रों को नहीं दिखेंगे।' : 'Tip: Only fill fields you want to upload. Empty fields will be hidden from students.'}</p>
        <button class="btn-primary" onclick="saveLesson()"><i class="fas fa-save"></i> ${lang ? 'पाठ सहेजें' : 'Save Lesson'}</button>
      </div>
      <h4 style="font-size:.9rem;font-weight:600;margin:16px 0 10px;">${lang ? 'मौजूदा पाठ' : 'Existing Lessons'}</h4>
      <div id="admin-lesson-list"></div>
    `;
    loadAdminLessons();
  } else if (adminTab === 'quiz') {
    container.innerHTML = `
      <div class="card admin-form">
        <h4 style="font-size:.95rem;font-weight:600;margin-bottom:12px;">${lang ? 'नया प्रश्न जोड़ें' : 'Add Quiz Question'}</h4>
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
        <div class="input-group"><i class="fas fa-question"></i><input type="text" id="adm-q-text" placeholder="${lang ? 'प्रश्न (English)' : 'Question (English)'}"></div>
        <div class="input-group"><i class="fas fa-question"></i><input type="text" id="adm-q-texthi" placeholder="${lang ? 'प्रश्न (हिंदी)' : 'Question (Hindi)'}"></div>
        <div class="input-group"><i class="fas fa-font"></i><input type="text" id="adm-q-a" placeholder="Option A"></div>
        <div class="input-group"><i class="fas fa-font"></i><input type="text" id="adm-q-b" placeholder="Option B"></div>
        <div class="input-group"><i class="fas fa-font"></i><input type="text" id="adm-q-c" placeholder="Option C"></div>
        <div class="input-group"><i class="fas fa-font"></i><input type="text" id="adm-q-d" placeholder="Option D"></div>
        <div class="input-group"><i class="fas fa-check"></i>
          <select id="adm-q-correct">
            <option value="0">Correct: A</option><option value="1">Correct: B</option>
            <option value="2">Correct: C</option><option value="3">Correct: D</option>
          </select>
        </div>
        <div class="input-group"><i class="fas fa-lightbulb"></i><textarea id="adm-q-explain" placeholder="${lang ? 'व्याख्या' : 'Explanation'}"></textarea></div>
        <div class="input-group"><i class="fas fa-clock"></i><input type="number" id="adm-q-timer" placeholder="${lang ? 'टाइमर (सेकंड)' : 'Timer (seconds)'}" value="300"></div>
        <button class="btn-primary" onclick="saveQuizQuestion()"><i class="fas fa-plus"></i> ${lang ? 'प्रश्न जोड़ें' : 'Add Question'}</button>
      </div>
    `;
  } else if (adminTab === 'uploads') {
    container.innerHTML = `
      <div class="card">
        <h4 style="font-size:.95rem;font-weight:600;margin-bottom:12px;">${lang ? 'फ़ाइल अपलोड' : 'Upload Files'}</h4>
        <div class="file-upload" onclick="document.getElementById('file-input').click()">
          <i class="fas fa-cloud-upload-alt"></i>
          <p>${lang ? 'छवि, PDF, या वीडियो अपलोड करें' : 'Upload Image, PDF, or Video'}</p>
          <p style="font-size:.72rem;color:var(--text3);margin-top:4px;">Max 50MB</p>
        </div>
        <input type="file" id="file-input" style="display:none" accept="image/*,.pdf,video/*" onchange="uploadFile(this)">
        <div class="input-group"><i class="fas fa-tag"></i><input type="text" id="upload-title" placeholder="${lang ? 'फ़ाइल शीर्षक' : 'File title/description'}"></div>
        <div id="upload-status" style="font-size:.82rem;color:var(--text2);margin-top:8px;"></div>
      </div>
      <h4 style="font-size:.9rem;font-weight:600;margin:16px 0 10px;">${lang ? 'अपलोड की गई फ़ाइलें' : 'Uploaded Files'}</h4>
      <div id="uploads-list"></div>
    `;
    loadUploads();
  } else if (adminTab === 'topics') {
    container.innerHTML = `
      <div class="card admin-form">
        <h4 style="font-size:.95rem;font-weight:600;margin-bottom:12px;">${lang ? 'नया विषय' : 'Add New Topic'}</h4>
        <div class="input-group"><i class="fas fa-heading"></i><input type="text" id="adm-topic-title" placeholder="Topic Title"></div>
        <div class="input-group"><i class="fas fa-heading"></i><input type="text" id="adm-topic-titlehi" placeholder="Title (Hindi)"></div>
        <div class="input-group"><i class="fas fa-align-left"></i><input type="text" id="adm-topic-desc" placeholder="Description"></div>
        <button class="btn-primary" onclick="saveTopic()"><i class="fas fa-save"></i> ${lang ? 'विषय सहेजें' : 'Save Topic'}</button>
      </div>
    `;
  } else if (adminTab === 'users') {
    container.innerHTML = `<div id="admin-users-list"><p style="color:var(--text2);font-size:.85rem;">Loading users...</p></div>`;
    loadAdminUsers();
  }
}

async function saveLesson() {
  const title = document.getElementById('adm-lesson-title').value.trim();
  if (!title) { showToast('Enter lesson title'); return; }
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  showLoading(true);
  try {
    await db.ref('lessons/' + id).set({
      title, titleHi: document.getElementById('adm-lesson-titlehi').value.trim(),
      description: document.getElementById('adm-lesson-desc').value.trim(),
      notes: document.getElementById('adm-lesson-notes').value.trim(),
      videoUrl: document.getElementById('adm-lesson-video').value.trim(),
      pdfUrl: document.getElementById('adm-lesson-pdf').value.trim(),
      imageUrl: document.getElementById('adm-lesson-img').value.trim(),
      thumbnail: (document.getElementById('adm-lesson-thumb') ? document.getElementById('adm-lesson-thumb').value.trim() : ''),
      topicId: document.getElementById('adm-lesson-topic').value,
      createdAt: Date.now()
    });
    showToast('Lesson saved! ✅');
    renderAdmin();
  } catch(e) { showToast('Error saving lesson'); }
  showLoading(false);
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
    // Update quiz timer
    const timer = parseInt(document.getElementById('adm-q-timer').value) || 300;
    await db.ref('quizzes/' + quizId + '/time').set(timer);
    showToast('Question added! ✅');
  } catch(e) { showToast('Error saving question'); }
  showLoading(false);
}

async function saveTopic() {
  const title = document.getElementById('adm-topic-title').value.trim();
  if (!title) { showToast('Enter topic title'); return; }
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  showLoading(true);
  try {
    await db.ref('topics/' + id).set({
      title, titleHi: document.getElementById('adm-topic-titlehi').value.trim(),
      desc: document.getElementById('adm-topic-desc').value.trim(), createdAt: Date.now()
    });
    showToast('Topic saved! ✅');
  } catch(e) { showToast('Error saving topic'); }
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
    showToast('Upload failed');
  }, async () => {
    const url = await ref.getDownloadURL();
    const title = document.getElementById('upload-title').value.trim() || file.name;
    await db.ref('uploads').push({ title, url, type: file.type, name: file.name, date: Date.now() });
    status.textContent = 'Upload complete! ✅';
    showToast('File uploaded! ✅');
    loadUploads();
  });
}

async function loadAdminLessons() {
  const list = document.getElementById('admin-lesson-list');
  if (!list) return;
  try {
    const snap = await db.ref('lessons').once('value');
    if (!snap.exists()) { list.innerHTML = '<p style="color:var(--text2);font-size:.82rem;">No lessons yet</p>'; return; }
    const data = snap.val();
    list.innerHTML = Object.keys(data).map(k => `
      <div class="admin-list-item">
        <div class="item-info"><h4>${data[k].title}</h4><p>${data[k].topicId || ''}</p></div>
        <div class="admin-actions">
          <button class="btn-edit" onclick="editLesson('${k}')"><i class="fas fa-edit"></i></button>
          <button class="btn-delete" onclick="deleteItem('lessons','${k}')"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `).join('');
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
          <a href="${data[k].url}" target="_blank" style="width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:rgba(10,132,255,.1);color:var(--accent);font-size:.8rem;"><i class="fas fa-external-link-alt"></i></a>
          <button class="btn-delete" onclick="deleteItem('uploads','${k}')"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `).join('');
  } catch(e) {}
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
    if (!snap.exists()) { showToast('Lesson not found'); showLoading(false); return; }
    const l = snap.val();
    // Switch to lessons tab and fill form
    adminTab = 'lessons';
    await renderAdmin();
    // Wait for DOM to update
    setTimeout(() => {
      document.getElementById('adm-lesson-title').value = l.title || '';
      document.getElementById('adm-lesson-titlehi').value = l.titleHi || '';
      document.getElementById('adm-lesson-desc').value = l.description || '';
      document.getElementById('adm-lesson-notes').value = l.notes || '';
      document.getElementById('adm-lesson-video').value = l.videoUrl || '';
      document.getElementById('adm-lesson-pdf').value = l.pdfUrl || '';
      document.getElementById('adm-lesson-img').value = l.imageUrl || '';
      const thumb = document.getElementById('adm-lesson-thumb');
      if (thumb) thumb.value = l.thumbnail || '';
      document.getElementById('adm-lesson-topic').value = l.topicId || '';
      showToast('Editing: ' + l.title);
    }, 200);
  } catch(e) { showToast('Error loading lesson'); }
  showLoading(false);
}
