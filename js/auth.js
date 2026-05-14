// ===== Authentication Module v3 =====
// Features: Email/Password login, Mobile OTP login, Email verification, Phone verification

// ★ Default Admin Credentials ★
// Email:    admin@itividhya.com
// Password: Admin@123
const ADMIN_EMAIL = 'admin@itividhya.com';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_EMAILS = ['admin@itividhya.com']; // Add more admin emails here

let phoneConfirmationResult = null;
let recaptchaVerifier = null;
let currentAuthMode = 'email'; // 'email' or 'phone'

function showAuthView(view) {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('forgot-password-form').style.display = 'none';
  document.getElementById('forgot-username-form').style.display = 'none';
  document.getElementById('phone-login-form').style.display = 'none';
  document.getElementById('otp-verify-form').style.display = 'none';
  document.getElementById('email-verify-form').style.display = 'none';
  const sub = document.getElementById('auth-subtitle');
  if (view === 'login') {
    document.getElementById('login-form').style.display = 'block';
    sub.textContent = 'Welcome back! Sign in to continue';
    currentAuthMode = 'email';
  } else if (view === 'register') {
    document.getElementById('register-form').style.display = 'block';
    sub.textContent = 'Create your account to get started';
  } else if (view === 'forgot-password') {
    document.getElementById('forgot-password-form').style.display = 'block';
    sub.textContent = 'Enter your email to reset password';
  } else if (view === 'forgot-username') {
    document.getElementById('forgot-username-form').style.display = 'block';
    sub.textContent = 'We\'ll send your username to your email';
  } else if (view === 'phone-login') {
    document.getElementById('phone-login-form').style.display = 'block';
    sub.textContent = 'Login with your mobile number';
    currentAuthMode = 'phone';
    initRecaptcha();
  } else if (view === 'otp-verify') {
    document.getElementById('otp-verify-form').style.display = 'block';
    sub.textContent = 'Enter the OTP sent to your mobile';
  } else if (view === 'email-verify') {
    document.getElementById('email-verify-form').style.display = 'block';
    sub.textContent = 'Verify your email to continue';
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
      trade: 'electrician', role: 'admin', phone: '',
      emailVerified: true,
      createdAt: Date.now(), progress: {}, quizResults: {}
    });
    await auth.signOut(); // Sign out so user can login manually
  } catch (err) {
    // Account already exists or other error — that's fine
  }
}
// Run once on page load
ensureAdminAccount();

// ===== Initialize reCAPTCHA for Phone Auth =====
function initRecaptcha() {
  if (recaptchaVerifier) return;
  try {
    recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      }
    });
  } catch(e) {
    console.log('reCAPTCHA init error:', e);
  }
}

// ===== Email/Password Login =====
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-password').value;
  showLoading(true);
  try {
    const cred = await auth.signInWithEmailAndPassword(email, pass);
    // Auto-assign admin role if email is in admin list
    if (ADMIN_EMAILS.includes(email.toLowerCase())) {
      await db.ref('users/' + cred.user.uid + '/role').set('admin');
    }
    // Check email verification (skip for admin)
    if (!ADMIN_EMAILS.includes(email.toLowerCase()) && !cred.user.emailVerified) {
      showLoading(false);
      // Show email verification screen
      showAuthView('email-verify');
      document.getElementById('verify-email-display').textContent = email;
      return;
    }
    showToast('Login successful! ✅');
  } catch (err) {
    showToast(getAuthError(err.code));
  }
  showLoading(false);
});

// ===== Registration with Mobile Number =====
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const username = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const pass = document.getElementById('reg-password').value;
  const confirm = document.getElementById('reg-confirm').value;
  const trade = document.getElementById('reg-trade').value;
  if (pass !== confirm) { showToast('Passwords do not match!'); return; }
  if (!trade) { showToast('Please select a trade'); return; }
  
  // Validate phone number if provided
  if (phone && !isValidPhone(phone)) {
    showToast('Enter a valid mobile number (10 digits)');
    return;
  }

  showLoading(true);
  try {
    const cred = await auth.createUserWithEmailAndPassword(email, pass);
    await cred.user.updateProfile({ displayName: name });
    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
    
    // Format phone with country code for Firebase
    const formattedPhone = phone ? formatPhoneNumber(phone) : '';
    
    await db.ref('users/' + cred.user.uid).set({
      name, username, email, trade, 
      phone: formattedPhone,
      role: isAdmin ? 'admin' : 'student',
      emailVerified: false,
      phoneVerified: false,
      createdAt: Date.now(), progress: {}, quizResults: {}
    });

    // Send email verification
    try {
      await cred.user.sendEmailVerification();
      showToast('Account created! Verification email sent 📧');
    } catch(verifyErr) {
      showToast('Account created! Please verify your email 📧');
    }

    // Sign out so user has to verify email first
    await auth.signOut();
    showAuthView('login');
    
  } catch (err) {
    showToast(getAuthError(err.code));
  }
  showLoading(false);
});

// ===== Phone Number Login (OTP) =====
document.getElementById('phone-login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const phone = document.getElementById('phone-login-number').value.trim();
  
  if (!isValidPhone(phone)) {
    showToast('Enter a valid 10-digit mobile number');
    return;
  }

  const formattedPhone = formatPhoneNumber(phone);
  showLoading(true);

  // First check if this phone number exists in our database
  try {
    const snap = await db.ref('users').orderByChild('phone').equalTo(formattedPhone).once('value');
    if (!snap.exists()) {
      showToast('No account found with this mobile number. Please register first.');
      showLoading(false);
      return;
    }
  } catch(e) {
    showToast('Error checking phone number');
    showLoading(false);
    return;
  }

  try {
    initRecaptcha();
    phoneConfirmationResult = await auth.signInWithPhoneNumber(formattedPhone, recaptchaVerifier);
    showToast('OTP sent to ' + formattedPhone + ' 📱');
    showAuthView('otp-verify');
    document.getElementById('otp-phone-display').textContent = formattedPhone;
    // Start OTP timer
    startOtpTimer();
  } catch (err) {
    showToast(getPhoneAuthError(err.code));
    // Reset recaptcha on error
    recaptchaVerifier = null;
  }
  showLoading(false);
});

// ===== OTP Verification =====
document.getElementById('otp-verify-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const otp = getOTPValue();
  if (otp.length !== 6) {
    showToast('Enter complete 6-digit OTP');
    return;
  }
  showLoading(true);
  try {
    const result = await phoneConfirmationResult.confirm(otp);
    // Phone auth successful - now link with existing account or update
    const phoneUser = result.user;
    const phoneNumber = phoneUser.phoneNumber;
    
    // Find the user data by phone number
    const snap = await db.ref('users').orderByChild('phone').equalTo(phoneNumber).once('value');
    if (snap.exists()) {
      const userData = Object.entries(snap.val())[0];
      const existingUid = userData[0];
      const existingData = userData[1];
      
      // Update phone verified status
      await db.ref('users/' + existingUid + '/phoneVerified').set(true);
      
      // If the phone auth created a different user, we need to merge
      if (phoneUser.uid !== existingUid) {
        // Copy user data to the phone auth user
        await db.ref('users/' + phoneUser.uid).set({
          ...existingData,
          phoneVerified: true,
          phoneUid: phoneUser.uid
        });
      }
    }
    
    showToast('Phone verified! Login successful ✅');
  } catch (err) {
    showToast('Invalid OTP. Please try again.');
  }
  showLoading(false);
});

// ===== Email Verification Actions =====
async function resendVerificationEmail() {
  const user = auth.currentUser;
  if (!user) {
    showToast('Please login first');
    return;
  }
  showLoading(true);
  try {
    await user.sendEmailVerification();
    showToast('Verification email sent! Check your inbox 📧');
  } catch(e) {
    if (e.code === 'auth/too-many-requests') {
      showToast('Too many requests. Please wait a few minutes.');
    } else {
      showToast('Error sending verification email');
    }
  }
  showLoading(false);
}

async function checkEmailVerified() {
  const user = auth.currentUser;
  if (!user) return;
  showLoading(true);
  try {
    await user.reload();
    if (user.emailVerified) {
      // Update database
      await db.ref('users/' + user.uid + '/emailVerified').set(true);
      showToast('Email verified! ✅');
      // Auth state will auto-update the UI
      window.location.reload();
    } else {
      showToast('Email not yet verified. Check your inbox.');
    }
  } catch(e) {
    showToast('Error checking verification status');
  }
  showLoading(false);
}

async function logoutFromVerification() {
  await auth.signOut();
  showAuthView('login');
}

// ===== OTP Input Handling =====
function getOTPValue() {
  let otp = '';
  for (let i = 1; i <= 6; i++) {
    const el = document.getElementById('otp-' + i);
    if (el) otp += el.value;
  }
  return otp;
}

function handleOtpInput(el, nextId) {
  if (el.value.length === 1 && nextId) {
    document.getElementById(nextId).focus();
  }
}

function handleOtpKeydown(e, prevId) {
  if (e.key === 'Backspace' && e.target.value === '' && prevId) {
    document.getElementById(prevId).focus();
  }
}

// Handle paste for OTP
function handleOtpPaste(e) {
  e.preventDefault();
  const paste = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
  for (let i = 0; i < 6; i++) {
    const el = document.getElementById('otp-' + (i + 1));
    if (el) el.value = paste[i] || '';
  }
  if (paste.length === 6) {
    document.getElementById('otp-6').focus();
  }
}

// OTP Timer
let otpTimerInterval = null;
function startOtpTimer() {
  let seconds = 60;
  const display = document.getElementById('otp-timer');
  if (!display) return;
  if (otpTimerInterval) clearInterval(otpTimerInterval);
  
  const resendBtn = document.getElementById('otp-resend-btn');
  if (resendBtn) resendBtn.style.display = 'none';
  
  display.textContent = `Resend OTP in ${seconds}s`;
  display.style.display = 'block';
  
  otpTimerInterval = setInterval(() => {
    seconds--;
    display.textContent = `Resend OTP in ${seconds}s`;
    if (seconds <= 0) {
      clearInterval(otpTimerInterval);
      display.style.display = 'none';
      if (resendBtn) resendBtn.style.display = 'inline-block';
    }
  }, 1000);
}

async function resendOTP() {
  const phone = document.getElementById('otp-phone-display').textContent;
  if (!phone) return;
  showLoading(true);
  try {
    recaptchaVerifier = null;
    initRecaptcha();
    phoneConfirmationResult = await auth.signInWithPhoneNumber(phone, recaptchaVerifier);
    showToast('OTP resent! 📱');
    startOtpTimer();
  } catch(e) {
    showToast('Error resending OTP. Try again later.');
    recaptchaVerifier = null;
  }
  showLoading(false);
}

// ===== Forgot Password =====
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

// ===== Forgot Username =====
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

// ===== Helper Functions =====
function isValidPhone(phone) {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  // Accept 10 digit Indian number or with +91
  return /^(\+91)?[6-9]\d{9}$/.test(cleaned);
}

function formatPhoneNumber(phone) {
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+91')) return cleaned;
  if (cleaned.startsWith('91') && cleaned.length === 12) return '+' + cleaned;
  if (cleaned.length === 10) return '+91' + cleaned;
  return '+91' + cleaned;
}

function getAuthError(code) {
  const map = {
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/email-already-in-use': 'Email already registered',
    'auth/weak-password': 'Password must be at least 6 characters',
    'auth/invalid-email': 'Invalid email address',
    'auth/too-many-requests': 'Too many attempts. Try again later',
    'auth/invalid-credential': 'Invalid email or password',
    'auth/network-request-failed': 'Network error. Check your connection',
  };
  return map[code] || 'Authentication error. Please try again.';
}

function getPhoneAuthError(code) {
  const map = {
    'auth/invalid-phone-number': 'Invalid phone number format',
    'auth/missing-phone-number': 'Phone number is required',
    'auth/quota-exceeded': 'SMS quota exceeded. Try again later',
    'auth/too-many-requests': 'Too many attempts. Try again later',
    'auth/captcha-check-failed': 'reCAPTCHA verification failed. Refresh and try again',
    'auth/invalid-verification-code': 'Invalid OTP code',
    'auth/code-expired': 'OTP expired. Request a new one',
  };
  return map[code] || 'Phone authentication error. Please try again.';
}
