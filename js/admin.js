// ===== Admin Module v2 - MCQ Management =====
let adminTab = 'dashboard';
let editingMcqId = null;
let mcqCorrectIndex = 0;

async function renderAdmin() {
  const lang = document.getElementById('lang-toggle').checked;
  const el = document.getElementById('view-admin');
  el.innerHTML = `
    <h3 class="section-title"><i class="fas fa-shield-alt" style="color:var(--accent)"></i> ${lang?'एडमिन पैनल':'Admin Panel'}</h3>
    <div class="admin-tabs">
      <button class="admin-tab ${adminTab==='dashboard'?'active':''}" onclick="switchAdminTab('dashboard')">📊 ${lang?'डैशबोर्ड':'Dashboard'}</button>
      <button class="admin-tab ${adminTab==='mcq'?'active':''}" onclick="switchAdminTab('mcq')">📝 MCQ</button>
      <button class="admin-tab ${adminTab==='subjects'?'active':''}" onclick="switchAdminTab('subjects')">📂 ${lang?'विषय':'Subjects'}</button>
      <button class="admin-tab ${adminTab==='lessons-mgmt'?'active':''}" onclick="switchAdminTab('lessons-mgmt')">📖 ${lang?'पाठ':'Lessons'}</button>
      <button class="admin-tab ${adminTab==='users'?'active':''}" onclick="switchAdminTab('users')">👥 ${lang?'उपयोगकर्ता':'Users'}</button>
    </div>
    <div id="admin-content"></div>`;
  renderAdminContent();
}

function switchAdminTab(tab) { adminTab = tab; renderAdmin(); }

async function renderAdminContent() {
  const lang = document.getElementById('lang-toggle').checked;
  const c = document.getElementById('admin-content');
  if (!c) return;
  if (adminTab === 'dashboard') await renderAdminDashboard(c, lang);
  else if (adminTab === 'mcq') await renderMCQManager(c, lang);
  else if (adminTab === 'subjects') await renderSubjectManager(c, lang);
  else if (adminTab === 'lessons-mgmt') await renderLessonManager(c, lang);
  else if (adminTab === 'users') await renderUserManager(c, lang);
}

// ===== Admin Dashboard =====
async function renderAdminDashboard(c, lang) {
  let subjects=0, lessons=0, mcqs=0, users=0;
  try {
    const [ss,ls,ms,us] = await Promise.all([
      db.ref('subjects').once('value'), db.ref('lessons').once('value'),
      db.ref('mcqs').once('value'), db.ref('users').once('value')
    ]);
    if(ss.exists()) subjects = Object.keys(ss.val()).length;
    if(ls.exists()) lessons = Object.keys(ls.val()).length;
    if(ms.exists()) mcqs = Object.keys(ms.val()).length;
    if(us.exists()) users = Object.keys(us.val()).length;
  } catch(e){}
  c.innerHTML = `
    <div class="admin-dash-grid">
      <div class="admin-dash-card"><span class="dash-icon">📂</span><div class="dash-val">${subjects}</div><div class="dash-label">${lang?'विषय':'Subjects'}</div></div>
      <div class="admin-dash-card"><span class="dash-icon">📖</span><div class="dash-val">${lessons}</div><div class="dash-label">${lang?'पाठ':'Lessons'}</div></div>
      <div class="admin-dash-card"><span class="dash-icon">📝</span><div class="dash-val">${mcqs}</div><div class="dash-label">MCQs</div></div>
      <div class="admin-dash-card"><span class="dash-icon">👥</span><div class="dash-val">${users}</div><div class="dash-label">${lang?'उपयोगकर्ता':'Users'}</div></div>
    </div>`;
}

// ===== Subject Manager =====
async function renderSubjectManager(c, lang) {
  c.innerHTML = `
    <div class="card admin-form">
      <h4 class="admin-form-title"><i class="fas fa-folder-plus" style="color:var(--warning)"></i> ${lang?'नया विषय':'Add Subject'}</h4>
      <div class="input-group"><i class="fas fa-heading"></i><input type="text" id="adm-subj-title" placeholder="Subject Title (English)"></div>
      <div class="input-group"><i class="fas fa-heading"></i><input type="text" id="adm-subj-titlehi" placeholder="विषय शीर्षक (हिंदी)" dir="auto"></div>
      <div class="input-group"><i class="fas fa-align-left"></i><input type="text" id="adm-subj-desc" placeholder="Description"></div>
      <div class="input-group"><i class="fas fa-palette"></i>
        <select id="adm-subj-color"><option value="blue">Blue</option><option value="purple">Purple</option><option value="green">Green</option><option value="orange">Orange</option><option value="red">Red</option><option value="teal">Teal</option></select>
      </div>
      <div class="input-group"><i class="fas fa-icons"></i><input type="text" id="adm-subj-icon" placeholder="Icon (fa-bolt)" value="fa-book"></div>
      <button class="btn-primary" onclick="saveSubject()"><i class="fas fa-save"></i> ${lang?'सहेजें':'Save'}</button>
    </div>
    <h4 class="admin-section-heading">${lang?'मौजूदा विषय':'Existing Subjects'}</h4>
    <div id="admin-subjects-list"></div>`;
  loadAdminSubjects();
}

async function saveSubject() {
  const title = document.getElementById('adm-subj-title').value.trim();
  if (!title) { showToast('Enter subject title'); return; }
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  showLoading(true);
  try {
    await db.ref('subjects/' + id).set({
      title, titleHi: document.getElementById('adm-subj-titlehi').value.trim(),
      desc: document.getElementById('adm-subj-desc').value.trim(),
      color: document.getElementById('adm-subj-color').value,
      icon: document.getElementById('adm-subj-icon').value.trim() || 'fa-book',
      createdAt: Date.now()
    });
    showToast('Subject saved! ✅');
    loadAdminSubjects();
  } catch(e) { showToast('Error: '+e.message); }
  showLoading(false);
}

async function loadAdminSubjects() {
  const list = document.getElementById('admin-subjects-list');
  if (!list) return;
  try {
    const snap = await db.ref('subjects').once('value');
    if (!snap.exists()) { list.innerHTML = '<p style="color:var(--text2);font-size:.82rem;">No custom subjects yet</p>'; return; }
    const data = snap.val();
    list.innerHTML = Object.keys(data).map(k => `
      <div class="admin-list-item">
        <div class="item-info"><h4>${data[k].title}</h4><p>${data[k].titleHi||''} • ${data[k].color||''}</p></div>
        <div class="admin-actions">
          <button class="btn-delete" onclick="confirmDelete('subjects','${k}')"><i class="fas fa-trash"></i></button>
        </div>
      </div>`).join('');
  } catch(e) {}
}

// ===== Lesson Manager =====
async function renderLessonManager(c, lang) {
  const opts = await getSubjectOptionsV2();
  c.innerHTML = `
    <div class="card admin-form">
      <h4 class="admin-form-title"><i class="fas fa-plus-circle" style="color:var(--success)"></i> ${lang?'नया पाठ':'Add Lesson'}</h4>
      <div class="input-group"><i class="fas fa-folder"></i><select id="adm-les-subject"><option value="">-- Select Subject --</option>${opts}</select></div>
      <div class="input-group"><i class="fas fa-heading"></i><input type="text" id="adm-les-title" placeholder="Lesson Title (English)"></div>
      <div class="input-group"><i class="fas fa-heading"></i><input type="text" id="adm-les-titlehi" placeholder="पाठ शीर्षक (हिंदी)" dir="auto"></div>
      <div class="input-group"><i class="fas fa-sort-numeric-up"></i><input type="number" id="adm-les-order" placeholder="Order" value="1"></div>
      <input type="hidden" id="adm-les-edit-id" value="">
      <button class="btn-primary" onclick="saveLesson()"><i class="fas fa-save"></i> ${lang?'सहेजें':'Save'}</button>
    </div>
    <h4 class="admin-section-heading">${lang?'मौजूदा पाठ':'Existing Lessons'}</h4>
    <div id="admin-lessons-list"></div>`;
  loadAdminLessonsV2();
}

async function saveLesson() {
  const subjectId = document.getElementById('adm-les-subject').value;
  const title = document.getElementById('adm-les-title').value.trim();
  if (!subjectId || !title) { showToast('Fill subject and title'); return; }
  const editId = document.getElementById('adm-les-edit-id').value;
  const id = editId || title.toLowerCase().replace(/[^a-z0-9]+/g,'-');
  showLoading(true);
  try {
    await db.ref('lessons/'+id).set({
      title, titleHi: document.getElementById('adm-les-titlehi').value.trim(),
      subjectId, order: parseInt(document.getElementById('adm-les-order').value)||1,
      createdAt: Date.now()
    });
    showToast('Lesson saved! ✅');
    document.getElementById('adm-les-edit-id').value = '';
    loadAdminLessonsV2();
  } catch(e) { showToast('Error'); }
  showLoading(false);
}

async function loadAdminLessonsV2() {
  const list = document.getElementById('admin-lessons-list');
  if (!list) return;
  try {
    const snap = await db.ref('lessons').once('value');
    if (!snap.exists()) { list.innerHTML = '<p style="color:var(--text2);font-size:.82rem;">No lessons</p>'; return; }
    const data = snap.val();
    list.innerHTML = Object.keys(data).map(k => `
      <div class="admin-list-item">
        <div class="item-info"><h4>${data[k].title}</h4><p>${data[k].subjectId||''}</p></div>
        <div class="admin-actions">
          <button class="btn-delete" onclick="confirmDelete('lessons','${k}')"><i class="fas fa-trash"></i></button>
        </div>
      </div>`).join('');
  } catch(e) {}
}

// ===== MCQ Manager =====
async function renderMCQManager(c, lang) {
  const subjOpts = await getSubjectOptionsV2();
  const lessonOpts = await getLessonOptions();
  c.innerHTML = `
    <div class="card admin-form">
      <h4 class="admin-form-title"><i class="fas fa-plus-circle" style="color:var(--success)"></i> ${lang?'MCQ प्रश्न जोड़ें':'Add MCQ Question'}</h4>
      <div class="admin-field-group">
        <label>${lang?'विषय':'Subject'} <span class="required">*</span></label>
        <div class="input-group"><i class="fas fa-folder"></i><select id="adm-mcq-subject" onchange="updateLessonDropdown()">${subjOpts}</select></div>
      </div>
      <div class="admin-field-group">
        <label>${lang?'पाठ':'Lesson'} <span class="required">*</span></label>
        <div class="input-group"><i class="fas fa-book"></i><select id="adm-mcq-lesson">${lessonOpts}</select></div>
      </div>
      <div class="admin-field-group">
        <label>${lang?'प्रश्न (English)':'Question (English)'} <span class="required">*</span></label>
        <div class="input-group"><i class="fas fa-question"></i><input type="text" id="adm-mcq-q" placeholder="Enter question"></div>
      </div>
      <div class="admin-field-group">
        <label>${lang?'प्रश्न (हिंदी)':'Question (Hindi)'}</label>
        <div class="input-group"><i class="fas fa-question"></i><input type="text" id="adm-mcq-qhi" placeholder="हिंदी में प्रश्न" dir="auto"></div>
      </div>
      <div class="admin-field-group">
        <label>${lang?'प्रश्न छवि':'Question Image'}</label>
        <div class="image-upload-mini" onclick="document.getElementById('mcq-q-img-input').click()">
          <i class="fas fa-image"></i> Upload Image
        </div>
        <input type="file" id="mcq-q-img-input" accept="image/*" style="display:none" onchange="uploadMCQImage(this,'mcq-q-img-preview','mcq-q-img-url')">
        <img id="mcq-q-img-preview" class="image-preview" style="display:none">
        <input type="hidden" id="mcq-q-img-url" value="">
      </div>
      <div class="admin-field-group">
        <label>${lang?'विकल्प (सही उत्तर पर ✓ क्लिक करें)':'Options (Click ✓ for correct answer)'}</label>
        ${['A','B','C','D'].map((l,i) => `
          <div class="mcq-option-row">
            <div class="mcq-correct-btn ${mcqCorrectIndex===i?'is-correct':''}" onclick="setCorrectOption(${i})" title="Mark correct"><i class="fas fa-check"></i></div>
            <div class="input-group"><i class="fas fa-font"></i><input type="text" id="adm-mcq-opt-${i}" placeholder="Option ${l}"></div>
          </div>`).join('')}
      </div>
      <div class="admin-field-group">
        <label>${lang?'व्याख्या':'Explanation'}</label>
        <textarea id="adm-mcq-explain" class="admin-textarea" style="min-height:80px" placeholder="${lang?'सही उत्तर की व्याख्या':'Explain the correct answer'}"></textarea>
      </div>
      <input type="hidden" id="adm-mcq-edit-id" value="">
      <div class="admin-btn-row">
        <button class="btn-primary" onclick="saveMCQ()"><i class="fas fa-save"></i> ${lang?'सहेजें':'Save MCQ'}</button>
        <button class="btn-secondary" onclick="clearMCQForm()" style="flex:.5"><i class="fas fa-eraser"></i> ${lang?'साफ़':'Clear'}</button>
      </div>
    </div>
    <h4 class="admin-section-heading">${lang?'मौजूदा MCQ':'Existing MCQs'}</h4>
    <div class="admin-filter-row">
      <select id="admin-mcq-filter" onchange="loadAdminMCQs()">
        <option value="all">${lang?'सभी':'All'}</option>${lessonOpts}
      </select>
    </div>
    <div id="admin-mcq-list"></div>`;
  loadAdminMCQs();
}

function setCorrectOption(idx) {
  mcqCorrectIndex = idx;
  document.querySelectorAll('.mcq-correct-btn').forEach((btn,i) => {
    btn.classList.toggle('is-correct', i === idx);
  });
}

async function saveMCQ() {
  const subjectId = document.getElementById('adm-mcq-subject').value;
  const lessonId = document.getElementById('adm-mcq-lesson').value;
  const question = document.getElementById('adm-mcq-q').value.trim();
  if (!question) { showToast('Enter question'); return; }
  if (!subjectId || !lessonId) { showToast('Select subject and lesson'); return; }
  const options = [0,1,2,3].map(i => document.getElementById('adm-mcq-opt-'+i).value.trim());
  if (options.some(o => !o)) { showToast('Fill all 4 options'); return; }
  showLoading(true);
  const editId = document.getElementById('adm-mcq-edit-id').value;
  try {
    const data = {
      question, questionHi: document.getElementById('adm-mcq-qhi').value.trim(),
      subjectId, lessonId, options,
      correctIndex: mcqCorrectIndex,
      explanation: document.getElementById('adm-mcq-explain').value.trim(),
      questionImageUrl: document.getElementById('mcq-q-img-url').value || '',
      createdAt: Date.now()
    };
    if (editId) { await db.ref('mcqs/'+editId).update(data); }
    else { await db.ref('mcqs').push(data); }
    showToast(editId ? 'Updated! ✅' : 'MCQ saved! ✅');
    clearMCQForm();
    loadAdminMCQs();
  } catch(e) { showToast('Error: '+e.message); }
  showLoading(false);
}

function clearMCQForm() {
  ['adm-mcq-q','adm-mcq-qhi','adm-mcq-explain'].forEach(id => { const e=document.getElementById(id); if(e) e.value=''; });
  [0,1,2,3].forEach(i => { const e=document.getElementById('adm-mcq-opt-'+i); if(e) e.value=''; });
  document.getElementById('adm-mcq-edit-id').value = '';
  document.getElementById('mcq-q-img-url').value = '';
  const prev = document.getElementById('mcq-q-img-preview');
  if (prev) prev.style.display = 'none';
  mcqCorrectIndex = 0;
  setCorrectOption(0);
}

async function loadAdminMCQs() {
  const list = document.getElementById('admin-mcq-list');
  if (!list) return;
  const filter = document.getElementById('admin-mcq-filter');
  const filterVal = filter ? filter.value : 'all';
  try {
    const snap = await db.ref('mcqs').once('value');
    if (!snap.exists()) { list.innerHTML = '<p style="color:var(--text2);font-size:.82rem;">No MCQs yet</p>'; return; }
    const data = snap.val();
    let keys = Object.keys(data);
    if (filterVal !== 'all') keys = keys.filter(k => data[k].lessonId === filterVal);
    if (keys.length === 0) { list.innerHTML = '<p style="color:var(--text2);font-size:.82rem;">No MCQs found</p>'; return; }
    list.innerHTML = keys.slice(0,50).map(k => {
      const d = data[k];
      const letters = ['A','B','C','D'];
      return `<div class="admin-list-item">
        <div class="item-info">
          <h4>${d.question}</h4>
          <p>✅ ${letters[d.correctIndex]}: ${typeof d.options[d.correctIndex]==='object'?d.options[d.correctIndex].text:d.options[d.correctIndex]} • ${d.lessonId||''}</p>
        </div>
        <div class="admin-actions">
          <button class="btn-edit" onclick="editMCQ('${k}')"><i class="fas fa-edit"></i></button>
          <button class="btn-delete" onclick="confirmDelete('mcqs','${k}')"><i class="fas fa-trash"></i></button>
        </div>
      </div>`;
    }).join('');
  } catch(e) { list.innerHTML = '<p style="color:var(--text2);">Error loading</p>'; }
}

async function editMCQ(id) {
  showLoading(true);
  try {
    const snap = await db.ref('mcqs/'+id).once('value');
    if (!snap.exists()) { showLoading(false); return; }
    const d = snap.val();
    adminTab = 'mcq';
    await renderAdmin();
    setTimeout(() => {
      document.getElementById('adm-mcq-edit-id').value = id;
      document.getElementById('adm-mcq-subject').value = d.subjectId || '';
      document.getElementById('adm-mcq-lesson').value = d.lessonId || '';
      document.getElementById('adm-mcq-q').value = d.question || '';
      document.getElementById('adm-mcq-qhi').value = d.questionHi || '';
      (d.options||[]).forEach((o,i) => {
        const el = document.getElementById('adm-mcq-opt-'+i);
        if (el) el.value = typeof o === 'object' ? o.text : o;
      });
      document.getElementById('adm-mcq-explain').value = d.explanation || '';
      mcqCorrectIndex = d.correctIndex || 0;
      setCorrectOption(mcqCorrectIndex);
      if (d.questionImageUrl) {
        document.getElementById('mcq-q-img-url').value = d.questionImageUrl;
        const prev = document.getElementById('mcq-q-img-preview');
        if (prev) { prev.src = d.questionImageUrl; prev.style.display = 'block'; }
      }
      window.scrollTo(0,0);
      showToast('Editing MCQ');
    }, 300);
  } catch(e) {}
  showLoading(false);
}

// ===== Users Manager =====
async function renderUserManager(c, lang) {
  c.innerHTML = `<div id="admin-users-list"><p style="color:var(--text2);font-size:.85rem;">Loading...</p></div>`;
  loadAdminUsers();
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
        <div class="item-info"><h4>${data[k].name||'User'}</h4><p>${data[k].email} ${data[k].phone ? '• '+data[k].phone : ''} • ${data[k].role||'student'}</p></div>
        <div class="admin-actions">
          <button class="btn-edit" onclick="toggleUserRole('${k}','${data[k].role||'student'}')" title="Toggle role"><i class="fas fa-user-shield"></i></button>
        </div>
      </div>`).join('');
  } catch(e) {}
}

async function toggleUserRole(uid, currentRole) {
  const newRole = currentRole === 'admin' ? 'student' : 'admin';
  await db.ref('users/'+uid+'/role').set(newRole);
  showToast(`Role changed to ${newRole}`);
  loadAdminUsers();
}

// ===== Helpers =====
async function getSubjectOptionsV2() {
  let topics = [];
  try {
    const s = await db.ref('subjects').once('value');
    if (s.exists()) {
      const fb = s.val();
      topics = Object.keys(fb).map(k => ({id:k,...fb[k]}));
    }
  } catch(e) {}
  return topics.map(t => `<option value="${t.id}">${t.title} ${t.titleHi?'('+t.titleHi+')':''}</option>`).join('');
}

async function getLessonOptions() {
  let opts = '';
  try {
    const s = await db.ref('lessons').once('value');
    if (s.exists()) {
      const d = s.val();
      opts = Object.keys(d).map(k => `<option value="${k}">${d[k].title||k}</option>`).join('');
    }
  } catch(e) {}
  return opts;
}

async function updateLessonDropdown() {
  const subj = document.getElementById('adm-mcq-subject').value;
  const sel = document.getElementById('adm-mcq-lesson');
  if (!sel) return;
  try {
    const s = await db.ref('lessons').once('value');
    if (s.exists()) {
      const d = s.val();
      const filtered = Object.keys(d).filter(k => d[k].subjectId === subj);
      sel.innerHTML = filtered.map(k => `<option value="${k}">${d[k].title||k}</option>`).join('');
    }
  } catch(e) {}
}

async function uploadMCQImage(input, previewId, urlId) {
  const file = input.files[0];
  if (!file) return;
  showLoading(true);
  try {
    const ref = storage.ref('mcq-images/'+Date.now()+'_'+file.name);
    await ref.put(file);
    const url = await ref.getDownloadURL();
    document.getElementById(urlId).value = url;
    const prev = document.getElementById(previewId);
    if (prev) { prev.src = url; prev.style.display = 'block'; }
    showToast('Image uploaded! ✅');
  } catch(e) { showToast('Upload failed'); }
  showLoading(false);
}

function confirmDelete(path, key) {
  const modal = document.getElementById('confirm-modal');
  modal.style.display = 'flex';
  document.getElementById('confirm-cancel-btn').onclick = () => { modal.style.display = 'none'; };
  document.getElementById('confirm-ok-btn').onclick = async () => {
    modal.style.display = 'none';
    await db.ref(path+'/'+key).remove();
    showToast('Deleted ✅');
    renderAdmin();
  };
}

// Keep old functions for backward compatibility
async function getSubjectOptions() { return await getSubjectOptionsV2(); }
async function deleteItem(path, key) { confirmDelete(path, key); }
