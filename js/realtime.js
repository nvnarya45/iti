// ===== Real-Time Firebase Listeners =====
// Auto-update UI when data changes in Firebase

let realtimeListeners = [];

function setupRealtimeListeners() {
  // Clean up old listeners
  realtimeListeners.forEach(ref => ref.off());
  realtimeListeners = [];

  // Listen for MCQ changes
  const mcqRef = db.ref('mcqs');
  mcqRef.on('child_added', () => { if (currentView === 'mcq-play') return; /* don't interrupt active quiz */ });
  mcqRef.on('child_changed', () => { refreshCurrentView(); });
  mcqRef.on('child_removed', () => { refreshCurrentView(); });
  realtimeListeners.push(mcqRef);

  // Listen for subject changes
  const subjRef = db.ref('subjects');
  subjRef.on('value', () => { if (['home','subjects'].includes(currentView)) refreshCurrentView(); });
  realtimeListeners.push(subjRef);

  // Listen for lesson changes
  const lessonRef = db.ref('lessons');
  lessonRef.on('value', () => { if (['home','subjects','lessons'].includes(currentView)) refreshCurrentView(); });
  realtimeListeners.push(lessonRef);

  // Listen for user progress changes (own user)
  const uid = getUID();
  if (uid) {
    const progressRef = db.ref('users/' + uid + '/mcqProgress');
    progressRef.on('value', () => { if (['progress','dashboard'].includes(currentView)) refreshCurrentView(); });
    realtimeListeners.push(progressRef);

    const bookmarkRef = db.ref('users/' + uid + '/bookmarks');
    bookmarkRef.on('value', () => { if (currentView === 'bookmarks') refreshCurrentView(); });
    realtimeListeners.push(bookmarkRef);
  }
}

let refreshTimer = null;
function refreshCurrentView() {
  // Debounce to avoid too many re-renders
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    switch(currentView) {
      case 'home': renderHome(); break;
      case 'dashboard': renderDashboard(); break;
      case 'subjects': renderSubjects(); break;
      case 'lessons': renderSubjectLessons(); break;
      case 'progress': renderProgress(); break;
      case 'admin': renderAdmin(); break;
      case 'bookmarks': renderBookmarks(); break;
      case 'daily-practice': renderDailyPractice(); break;
    }
  }, 500);
}

function cleanupRealtimeListeners() {
  realtimeListeners.forEach(ref => ref.off());
  realtimeListeners = [];
}
