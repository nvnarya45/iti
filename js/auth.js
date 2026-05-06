// ===== Authentication Module =====

// ★ Default Admin Credentials ★
// Email:    admin@itividhya.com
// Password: Admin@123
const ADMIN_EMAIL = 'admin@itividhya.com';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_EMAILS = ['admin@itividhya.com']; // Add more admin emails here

function showAuthView(view) {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('forgot-password-form').style.display = 'none';
  document.getElementById('forgot-username-form').style.display = 'none';
  const sub = document.getElementById('auth-subtitle');
  if (view === 'login') {
    document.getElementById('login-form').style.display = 'block';
    sub.textContent = 'Welcome back! Sign in to continue';
  } else if (view === 'register') {
    document.getElementById('register-form').style.display = 'block';
    sub.textContent = 'Create your account to get started';
  } else if (view === 'forgot-password') {
    document.getElementById('forgot-password-form').style.display = 'block';
    sub.textContent = 'Enter your email to reset password';
  } else if (view === 'forgot-username') {
    document.getElementById('forgot-username-form').style.display = 'block';
    sub.textContent = 'We\'ll send your username to your email';
  }
}

function togglePassword(id, btn) {
  const inp = document.getElementById(id);
  const icon = btn.querySelector('i');
  if (inp.type === 'password') {
    inp.type = 'text'; icon.className = 'fas fa-eye-slash';
  } else {
    inp.type = 'password'; icon.className = 'fas fa-eye';
  }
}

// Auto-create admin account if it doesn't exist yet
async function ensureAdminAccount() {
  try {
    await auth.createUserWithEmailAndPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    const user = auth.currentUser;
    await user.updateProfile({ displayName: 'Admin' });
    await db.ref('users/' + user.uid).set({
      name: 'Admin', username: 'admin', email: ADMIN_EMAIL,
      trade: 'electrician', role: 'admin',
      createdAt: Date.now(), progress: {}, quizResults: {}
    });
    await auth.signOut(); // Sign out so user can login manually
  } catch (err) {
    // Account already exists or other error — that's fine
  }
}
// Run once on page load
ensureAdminAccount();

// Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-password').value;
  showLoading(true);
  try {
    await auth.signInWithEmailAndPassword(email, pass);
    // Auto-assign admin role if email is in admin list
    if (ADMIN_EMAILS.includes(email.toLowerCase())) {
      await db.ref('users/' + auth.currentUser.uid + '/role').set('admin');
    }
    showToast('Login successful! ✅');
  } catch (err) {
    showToast(getAuthError(err.code));
  }
  showLoading(false);
});

// Register
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const username = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-password').value;
  const confirm = document.getElementById('reg-confirm').value;
  const trade = document.getElementById('reg-trade').value;
  if (pass !== confirm) { showToast('Passwords do not match!'); return; }
  if (!trade) { showToast('Please select a trade'); return; }
  showLoading(true);
  try {
    const cred = await auth.createUserWithEmailAndPassword(email, pass);
    await cred.user.updateProfile({ displayName: name });
    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
    await db.ref('users/' + cred.user.uid).set({
      name, username, email, trade, role: isAdmin ? 'admin' : 'student',
      createdAt: Date.now(), progress: {}, quizResults: {}
    });
    showToast('Account created successfully! 🎉');
  } catch (err) {
    showToast(getAuthError(err.code));
  }
  showLoading(false);
});

// Forgot Password
document.getElementById('forgot-password-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('forgot-email').value.trim();
  showLoading(true);
  try {
    await auth.sendPasswordResetEmail(email);
    showToast('Password reset email sent! 📧');
    showAuthView('login');
  } catch (err) {
    showToast(getAuthError(err.code));
  }
  showLoading(false);
});

// Forgot Username
document.getElementById('forgot-username-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('forgot-user-email').value.trim();
  showLoading(true);
  try {
    const snap = await db.ref('users').orderByChild('email').equalTo(email).once('value');
    if (snap.exists()) {
      const data = Object.values(snap.val())[0];
      showToast('Your username: ' + data.username);
    } else {
      showToast('No account found with this email');
    }
  } catch (err) {
    showToast('Error finding account');
  }
  showLoading(false);
});

function logoutUser() {
  auth.signOut();
  toggleSidebar();
  showToast('Logged out successfully');
}

function getAuthError(code) {
  const map = {
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/email-already-in-use': 'Email already registered',
    'auth/weak-password': 'Password must be at least 6 characters',
    'auth/invalid-email': 'Invalid email address',
    'auth/too-many-requests': 'Too many attempts. Try again later',
  };
  return map[code] || 'Authentication error. Please try again.';
}
