// ===== Profile Module =====
const TRADE_OPTIONS = [
  { value: 'electrician', label: 'Electrician', labelHi: 'इलेक्ट्रीशियन' },
  { value: 'fitter', label: 'Fitter', labelHi: 'फिटर' },
  { value: 'turner', label: 'Turner', labelHi: 'टर्नर' },
  { value: 'welder', label: 'Welder', labelHi: 'वेल्डर' },
  { value: 'copa', label: 'COPA', labelHi: 'COPA' },
  { value: 'mechanic', label: 'Mechanic', labelHi: 'मैकेनिक' },
  { value: 'plumber', label: 'Plumber', labelHi: 'प्लंबर' },
  { value: 'carpenter', label: 'Carpenter', labelHi: 'बढ़ई' },
];

async function renderProfile() {
  const lang = document.getElementById('lang-toggle').checked;
  const uid = getUID();
  if (!uid) return;

  let u = { name: '', username: '', email: '', trade: 'electrician', semester: '1st', photoURL: '', phone: '', phoneVerified: false, emailVerified: false };
  try {
    const snap = await db.ref('users/' + uid).once('value');
    if (snap.exists()) u = { ...u, ...snap.val() };
  } catch(e) {}

  const initial = (u.name || 'S')[0].toUpperCase();
  const el = document.getElementById('view-profile');
  el.innerHTML = `
    <div class="profile-hero">
      <div class="profile-dp-wrap" onclick="document.getElementById('dp-input').click()">
        ${u.photoURL
          ? `<img class="profile-dp" src="${u.photoURL}" alt="Profile" id="profile-dp-img">`
          : `<div class="profile-dp-placeholder" id="profile-dp-img">${initial}</div>`}
        <div class="profile-dp-edit"><i class="fas fa-camera"></i></div>
      </div>
      <input type="file" id="dp-input" accept="image/*" style="display:none" onchange="uploadProfilePhoto(this)">
      <div class="profile-name" id="profile-display-name">${u.name || 'Student'}</div>
      <div class="profile-trade">${getTradeLabel(u.trade, lang)}</div>
      <div class="profile-meta">${u.email} • ${lang ? 'सेमेस्टर' : 'Semester'}: ${u.semester || '1st'}</div>
      <div class="profile-verify-badges">
        <span class="verify-badge ${u.emailVerified || (auth.currentUser && auth.currentUser.emailVerified) ? 'verified' : 'unverified'}">
          <i class="fas ${u.emailVerified || (auth.currentUser && auth.currentUser.emailVerified) ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
          ${lang ? 'ईमेल' : 'Email'} ${u.emailVerified || (auth.currentUser && auth.currentUser.emailVerified) ? '✓' : '✗'}
        </span>
        ${u.phone ? `<span class="verify-badge ${u.phoneVerified ? 'verified' : 'unverified'}">
          <i class="fas ${u.phoneVerified ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
          ${lang ? 'फ़ोन' : 'Phone'} ${u.phoneVerified ? '✓' : '✗'}
        </span>` : ''}
      </div>
    </div>

    <div class="profile-form-card">
      <h4><i class="fas fa-user-edit" style="color:var(--accent)"></i> ${lang ? 'प्रोफ़ाइल संपादित करें' : 'Edit Profile'}</h4>
      <div class="input-group"><i class="fas fa-user"></i><input type="text" id="prof-name" value="${u.name || ''}" placeholder="${lang ? 'पूरा नाम' : 'Full Name'}"></div>
      <div class="input-group"><i class="fas fa-at"></i><input type="text" id="prof-username" value="${u.username || ''}" placeholder="${lang ? 'उपयोगकर्ता नाम' : 'Username'}"></div>
      <div class="input-group"><i class="fas fa-mobile-alt"></i><input type="tel" id="prof-phone" value="${u.phone || ''}" placeholder="${lang ? 'मोबाइल नंबर' : 'Mobile Number (e.g. +919876543210)'}" maxlength="13"></div>
      <div class="input-group"><i class="fas fa-tools"></i>
        <select id="prof-trade">
          ${TRADE_OPTIONS.map(t => `<option value="${t.value}" ${u.trade === t.value ? 'selected' : ''}>${lang ? t.labelHi : t.label}</option>`).join('')}
        </select>
      </div>
      <div class="input-group"><i class="fas fa-calendar"></i>
        <select id="prof-semester">
          <option value="1st" ${u.semester === '1st' ? 'selected' : ''}>1st ${lang ? 'सेमेस्टर' : 'Semester'}</option>
          <option value="2nd" ${u.semester === '2nd' ? 'selected' : ''}>2nd ${lang ? 'सेमेस्टर' : 'Semester'}</option>
          <option value="3rd" ${u.semester === '3rd' ? 'selected' : ''}>3rd ${lang ? 'सेमेस्टर' : 'Semester'}</option>
          <option value="4th" ${u.semester === '4th' ? 'selected' : ''}>4th ${lang ? 'सेमेस्टर' : 'Semester'}</option>
        </select>
      </div>
      <button class="btn-primary" onclick="saveProfile()"><i class="fas fa-save"></i> ${lang ? 'सहेजें' : 'Save Profile'}</button>
    </div>

    <div class="profile-form-card">
      <h4><i class="fas fa-shield-alt" style="color:var(--warning)"></i> ${lang ? 'खाता' : 'Account'}</h4>
      <p style="font-size:.82rem;color:var(--text2);margin-bottom:12px;">${lang ? 'ईमेल' : 'Email'}: ${u.email}</p>
      <p style="font-size:.82rem;color:var(--text2);margin-bottom:12px;">${lang ? 'मोबाइल' : 'Mobile'}: ${u.phone || (lang ? 'जोड़ा नहीं गया' : 'Not added')}</p>
      <p style="font-size:.82rem;color:var(--text2);margin-bottom:12px;">${lang ? 'भूमिका' : 'Role'}: ${u.role || 'student'}</p>
      <p style="font-size:.82rem;color:var(--text2);">${lang ? 'शामिल हुए' : 'Joined'}: ${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</p>
    </div>
  `;
}

function getTradeLabel(value, hindi) {
  const t = TRADE_OPTIONS.find(o => o.value === value);
  return t ? (hindi ? t.labelHi : t.label) : value;
}

async function saveProfile() {
  const uid = getUID();
  const lang = document.getElementById('lang-toggle').checked;
  if (!uid) return;
  const name = document.getElementById('prof-name').value.trim();
  const username = document.getElementById('prof-username').value.trim();
  const phone = document.getElementById('prof-phone').value.trim();
  const trade = document.getElementById('prof-trade').value;
  const semester = document.getElementById('prof-semester').value;
  if (!name) { showToast(lang ? 'नाम दर्ज करें' : 'Enter your name'); return; }
  showLoading(true);
  try {
    await db.ref('users/' + uid).update({ name, username, trade, semester, phone });
    await auth.currentUser.updateProfile({ displayName: name });
    // Update sidebar
    document.getElementById('sidebar-username').textContent = name;
    document.getElementById('sidebar-trade').textContent = getTradeLabel(trade, lang);
    const letter = document.getElementById('sidebar-avatar-letter');
    if (letter) letter.textContent = name[0].toUpperCase();
    showToast(lang ? 'प्रोफ़ाइल सहेजा! ✅' : 'Profile saved! ✅');
  } catch(e) { showToast('Error saving profile'); }
  showLoading(false);
}

async function uploadProfilePhoto(input) {
  const file = input.files[0];
  if (!file) return;
  const uid = getUID();
  if (!uid) return;
  showLoading(true);
  try {
    const ref = storage.ref('profilePhotos/' + uid + '/' + Date.now() + '_' + file.name);
    await ref.put(file);
    const url = await ref.getDownloadURL();
    await db.ref('users/' + uid + '/photoURL').set(url);
    // Update UI
    const dpImg = document.getElementById('profile-dp-img');
    if (dpImg) {
      if (dpImg.tagName === 'IMG') {
        dpImg.src = url;
      } else {
        dpImg.outerHTML = `<img class="profile-dp" src="${url}" alt="Profile" id="profile-dp-img">`;
      }
    }
    // Update sidebar avatar
    const sidebarImg = document.getElementById('sidebar-avatar-img');
    const sidebarLetter = document.getElementById('sidebar-avatar-letter');
    if (sidebarImg) { sidebarImg.src = url; sidebarImg.style.display = 'block'; }
    if (sidebarLetter) sidebarLetter.style.display = 'none';
    showToast('Photo updated! 📸');
  } catch(e) { showToast('Error uploading photo'); }
  showLoading(false);
}

// Update sidebar with profile data on login
async function loadProfileToSidebar() {
  const uid = getUID();
  if (!uid) return;
  try {
    const snap = await db.ref('users/' + uid).once('value');
    if (!snap.exists()) return;
    const u = snap.val();
    const lang = document.getElementById('lang-toggle').checked;
    document.getElementById('sidebar-username').textContent = u.name || 'Student';
    document.getElementById('sidebar-email').textContent = u.email || '';
    document.getElementById('sidebar-trade').textContent = getTradeLabel(u.trade, lang);
    const letter = document.getElementById('sidebar-avatar-letter');
    if (letter) letter.textContent = (u.name || 'S')[0].toUpperCase();
    if (u.photoURL) {
      const sImg = document.getElementById('sidebar-avatar-img');
      const sLetter = document.getElementById('sidebar-avatar-letter');
      if (sImg) { sImg.src = u.photoURL; sImg.style.display = 'block'; }
      if (sLetter) sLetter.style.display = 'none';
    }
  } catch(e) {}
}
