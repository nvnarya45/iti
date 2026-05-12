// ===== Main App Module =====
let currentView = 'home';

// Auth state observer
auth.onAuthStateChanged(async (user) => {
  if (user) {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'block';
    // Set user info
    const initial = (user.displayName || user.email || 'S')[0].toUpperCase();
    const avatarLetter = document.getElementById('sidebar-avatar-letter');
    if (avatarLetter) avatarLetter.textContent = initial;
    document.getElementById('topbar-avatar').textContent = initial;
    document.getElementById('sidebar-username').textContent = user.displayName || 'Student';
    document.getElementById('sidebar-email').textContent = user.email || '';
    // Load full profile data to sidebar
    if (typeof loadProfileToSidebar === 'function') loadProfileToSidebar();
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
    // Default view is HOME (simple lesson list for students)
    navigateTo('home');
  } else {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('app-screen').style.display = 'none';
  }
});

function navigateTo(view) {
  const lang = document.getElementById('lang-toggle') ? document.getElementById('lang-toggle').checked : false;
  currentView = view;
  // Hide all views
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
  const target = document.getElementById('view-' + view);
  if (target) target.classList.add('active-view');
  // Update sidebar active
  document.querySelectorAll('.sidebar-item[data-view]').forEach(item => {
    item.classList.toggle('active', item.dataset.view === view);
  });
  // Update topbar title
  const titles = {
    home: 'ITI Vidhya',
    dashboard: lang ? 'डैशबोर्ड' : 'Dashboard',
    subjects: lang ? 'विषय' : 'Subjects',
    lessons: lang ? 'पाठ' : 'Lessons',
    'lesson-detail': lang ? 'पाठ विवरण' : 'Lesson Detail',
    quiz: lang ? 'क्विज़' : 'Quiz',
    'quiz-play': lang ? 'क्विज़' : 'Quiz',
    'quiz-result': lang ? 'परिणाम' : 'Result',
    progress: lang ? 'प्रगति' : 'Progress',
    admin: lang ? 'एडमिन पैनल' : 'Admin Panel',
    search: lang ? 'खोज' : 'Search',
    certificate: lang ? 'प्रमाणपत्र' : 'Certificate',
    profile: lang ? 'प्रोफ़ाइल' : 'My Profile',
  };
  document.getElementById('topbar-title').textContent = titles[view] || 'ITI Vidhya';
  // Render view
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

// Service Worker for offline (optional)
if ('serviceWorker' in navigator) {
  // navigator.serviceWorker.register('sw.js').catch(() => {});
}
