// ===== Main App Module v2 =====
let currentView = 'home';

// Auth state observer
auth.onAuthStateChanged(async (user) => {
  if (user) {
    // Check email verification for non-admin users
    const isAdmin = ADMIN_EMAILS.includes((user.email || '').toLowerCase());
    if (!isAdmin && !user.emailVerified) {
      document.getElementById('auth-screen').style.display = 'flex';
      document.getElementById('app-screen').style.display = 'none';
      showAuthView('email-verify');
      document.getElementById('verify-email-display').textContent = user.email;
      return;
    }
    
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
