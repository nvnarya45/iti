// ===== Main App Module v2 =====
let currentView = 'home';

// Auth state observer
auth.onAuthStateChanged(async (user) => {
  if (user) {
    // No email verification blocking — direct login
    
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'block';
    const initial = (user.displayName || user.email || 'S')[0].toUpperCase();
    const avatarLetter = document.getElementById('sidebar-avatar-letter');
    if (avatarLetter) avatarLetter.textContent = initial;
    document.getElementById('topbar-avatar').textContent = initial;
    document.getElementById('sidebar-username').textContent = user.displayName || 'Student';
    document.getElementById('sidebar-email').textContent = user.email || '';
    if (typeof loadProfileToSidebar === 'function') loadProfileToSidebar();
    // Update email verified status in DB
    if (user.emailVerified) {
      try { await db.ref('users/' + user.uid + '/emailVerified').set(true); } catch(e) {}
    }
    // Check admin role
    try {
      const snap = await db.ref('users/' + user.uid + '/role').once('value');
      if (snap.val() === 'admin') {
        document.getElementById('admin-menu-item').style.display = 'flex';
      }
    } catch(e) {}
    // Load saved theme
    const savedTheme = localStorage.getItem('iti-theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.getElementById('theme-toggle').checked = true;
    }
    const savedLang = localStorage.getItem('iti-lang');
    if (savedLang === 'hi') document.getElementById('lang-toggle').checked = true;
    // Setup real-time listeners
    if (typeof setupRealtimeListeners === 'function') setupRealtimeListeners();
    navigateTo('home');
  } else {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('app-screen').style.display = 'none';
    showAuthView('login');
    if (typeof cleanupRealtimeListeners === 'function') cleanupRealtimeListeners();
  }
});

function navigateTo(view) {
  const lang = document.getElementById('lang-toggle') ? document.getElementById('lang-toggle').checked : false;
  currentView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
  const target = document.getElementById('view-' + view);
  if (target) target.classList.add('active-view');
  document.querySelectorAll('.sidebar-item[data-view]').forEach(item => {
    item.classList.toggle('active', item.dataset.view === view);
  });
  const titles = {
    home: 'ITI Vidhya',
    dashboard: lang ? 'डैशबोर्ड' : 'Dashboard',
    subjects: lang ? 'विषय' : 'Subjects',
    lessons: lang ? 'पाठ' : 'Lessons',
    'lesson-detail': lang ? 'पाठ विवरण' : 'Lesson Detail',
    'mcq-play': lang ? 'MCQ प्रश्न' : 'MCQ Practice',
    'mcq-result': lang ? 'परिणाम' : 'Result',
    quiz: lang ? 'क्विज़' : 'Quiz',
    'quiz-play': lang ? 'क्विज़' : 'Quiz',
    'quiz-result': lang ? 'परिणाम' : 'Result',
    'daily-practice': lang ? 'दैनिक अभ्यास' : 'Daily Practice',
    'random-quiz': lang ? 'रैंडम क्विज़' : 'Random Quiz',
    bookmarks: lang ? 'बुकमार्क' : 'Bookmarks',
    progress: lang ? 'प्रगति' : 'Progress',
    admin: lang ? 'एडमिन पैनल' : 'Admin Panel',
    search: lang ? 'खोज' : 'Search',
    certificate: lang ? 'प्रमाणपत्र' : 'Certificate',
    profile: lang ? 'प्रोफ़ाइल' : 'My Profile',
    contact: lang ? 'संपर्क करें' : 'Contact Us',
  };
  document.getElementById('topbar-title').textContent = titles[view] || 'ITI Vidhya';
  switch(view) {
    case 'home': renderHome(); break;
    case 'dashboard': renderDashboard(); break;
    case 'subjects': renderSubjects(); break;
    case 'lessons': renderSubjectLessons(); break;
    case 'quiz': renderQuizList(); break;
    case 'progress': renderProgress(); break;
    case 'admin': renderAdmin(); break;
    case 'search': renderSearch(); break;
    case 'certificate': renderCertificate(); break;
    case 'profile': renderProfile(); break;
    case 'daily-practice': if(typeof renderDailyPractice==='function') renderDailyPractice(); break;
    case 'bookmarks': if(typeof renderBookmarks==='function') renderBookmarks(); break;
    case 'contact': renderContactUs(); break;
  }
  toggleSidebar(false);
  window.scrollTo(0, 0);
}

function toggleSidebar(force) {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const isOpen = force !== undefined ? !force : sidebar.classList.contains('open');
  sidebar.classList.toggle('open', !isOpen);
  overlay.classList.toggle('open', !isOpen);
}

function toggleTheme() {
  const isDark = document.getElementById('theme-toggle').checked;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  localStorage.setItem('iti-theme', isDark ? 'dark' : 'light');
}

function toggleLanguage() {
  const isHindi = document.getElementById('lang-toggle').checked;
  localStorage.setItem('iti-lang', isHindi ? 'hi' : 'en');
  navigateTo(currentView);
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function showLoading(show) {
  document.getElementById('loading-overlay').style.display = show ? 'flex' : 'none';
}

// ===== Contact Us Page =====
function renderContactUs() {
  const lang = document.getElementById('lang-toggle').checked;
  const el = document.getElementById('view-contact');
  el.innerHTML = `
    <div class="contact-page">
      <div class="contact-header">
        <img src="icons/icon-512.png" alt="ITI Vidhya" style="width:64px;height:64px;border-radius:14px;margin-bottom:12px;">
        <h2>${lang ? 'संपर्क करें' : 'Contact Us'}</h2>
        <p>${lang ? 'हमसे संपर्क करने के लिए नीचे दिए गए तरीके अपनाएं' : 'Get in touch with us through any of the options below'}</p>
      </div>

      <div class="contact-cards">
        <a href="tel:+919625952696" class="contact-card">
          <div class="contact-card-icon" style="background:linear-gradient(135deg,#30d158,#28a745);">
            <i class="fas fa-phone-alt"></i>
          </div>
          <div class="contact-card-info">
            <h4>${lang ? 'कॉल करें' : 'Call Us'}</h4>
            <p>+91 9625952696</p>
          </div>
          <i class="fas fa-chevron-right contact-card-arrow"></i>
        </a>

        <a href="https://wa.me/919625952696?text=Hello%20ITI%20Vidhya" target="_blank" class="contact-card">
          <div class="contact-card-icon" style="background:linear-gradient(135deg,#25D366,#128C7E);">
            <i class="fab fa-whatsapp"></i>
          </div>
          <div class="contact-card-info">
            <h4>${lang ? 'WhatsApp करें' : 'WhatsApp'}</h4>
            <p>+91 9625952696</p>
          </div>
          <i class="fas fa-chevron-right contact-card-arrow"></i>
        </a>

        <a href="mailto:itividhya25@gmail.com" class="contact-card">
          <div class="contact-card-icon" style="background:linear-gradient(135deg,#0a84ff,#6C5CE7);">
            <i class="fas fa-envelope"></i>
          </div>
          <div class="contact-card-info">
            <h4>${lang ? 'ईमेल करें' : 'Email Us'}</h4>
            <p>itividhya25@gmail.com</p>
          </div>
          <i class="fas fa-chevron-right contact-card-arrow"></i>
        </a>
      </div>

      <div class="contact-write-us">
        <h3><i class="fas fa-pen-fancy" style="color:var(--accent);"></i> ${lang ? 'हमें लिखें' : 'Write to Us'}</h3>
        <div class="contact-details-grid">
          <div class="contact-detail-item">
            <i class="fas fa-phone"></i>
            <div>
              <span class="label">${lang ? 'मोबाइल नंबर' : 'Mobile Number'}</span>
              <span class="value">9625952696</span>
            </div>
          </div>
          <div class="contact-detail-item">
            <i class="fas fa-envelope"></i>
            <div>
              <span class="label">${lang ? 'ईमेल' : 'Email'}</span>
              <span class="value">itividhya25@gmail.com</span>
            </div>
          </div>
        </div>
      </div>

      <div class="contact-footer-note">
        <i class="fas fa-info-circle"></i>
        <p>${lang ? 'हम 24 घंटे के भीतर आपको जवाब देंगे' : 'We typically respond within 24 hours'}</p>
      </div>
    </div>
  `;
}

// Splash screen removal
window.addEventListener('load', () => {
  setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    if (splash) splash.style.display = 'none';
  }, 2500);
});

if ('serviceWorker' in navigator) {
  // navigator.serviceWorker.register('sw.js').catch(() => {});
}
