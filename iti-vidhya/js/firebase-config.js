// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBY0nqRGsqMMDFTENPoT3es5NQZpUTGRe0",
  authDomain: "energy-meter-data-37caf.firebaseapp.com",
  databaseURL: "https://energy-meter-data-37caf-default-rtdb.firebaseio.com",
  projectId: "energy-meter-data-37caf",
  storageBucket: "energy-meter-data-37caf.firebasestorage.app",
  messagingSenderId: "525817374062",
  appId: "1:525817374062:web:c815bdd169e60c1c98cd7f"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

// Enable offline persistence
db.goOnline();

// Helper to get current user ID
function getUID() {
  return auth.currentUser ? auth.currentUser.uid : null;
}
