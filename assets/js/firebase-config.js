/**
 * Firebase Realtime Database Configuration & Cloud Sync
 * Đức Anh & Thuỳ Linh Wedding Platform
 */
const DEFAULT_FIREBASE_CONFIG = {
  // Điền thông tin Firebase của bạn ở đây hoặc dán vào mục Cấu hình trong trang Admin
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

(function() {
  function getFirebaseConfig() {
    try {
      const saved = localStorage.getItem('wedding_firebase_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.projectId || parsed.databaseURL)) return parsed;
      }
    } catch(e) {}
    if (DEFAULT_FIREBASE_CONFIG.projectId || DEFAULT_FIREBASE_CONFIG.databaseURL) {
      return DEFAULT_FIREBASE_CONFIG;
    }
    return null;
  }

  const config = getFirebaseConfig();
  if (config && typeof firebase !== 'undefined') {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(config);
      }
      const db = firebase.database();
      window.weddingFirebaseDb = db;
      console.log('🔥 Firebase Realtime Database connected successfully!');

      // Listen to wishes
      db.ref('wishes').on('value', snapshot => {
        try {
          const val = snapshot.val();
          if (val) {
            const list = Object.keys(val).map(k => ({ id: k, ...val[k] }));
            list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            localStorage.setItem('wedding_invite_wishes', JSON.stringify(list));
            window.dispatchEvent(new CustomEvent('wedding_wishes_synced', { detail: list }));
          }
        } catch(e) {
          console.warn('Sync wishes error:', e);
        }
      });

      // Listen to RSVPs
      db.ref('rsvps').on('value', snapshot => {
        try {
          const val = snapshot.val();
          if (val) {
            const list = Object.keys(val).map(k => ({ id: k, ...val[k] }));
            list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            localStorage.setItem('wedding_invite_rsvps', JSON.stringify(list));
            window.dispatchEvent(new CustomEvent('wedding_rsvps_synced', { detail: list }));
          }
        } catch(e) {
          console.warn('Sync RSVPs error:', e);
        }
      });

    } catch(err) {
      console.warn('Firebase init error:', err);
    }
  } else {
    console.log('Firebase: Not configured yet. Running in offline/local storage mode.');
  }
})();
