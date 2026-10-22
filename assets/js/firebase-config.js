/**
 * Firebase Realtime Database Configuration & Cloud Sync
 * Đức Anh & Thuỳ Linh Wedding Platform
 */
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDJrKNMi8Rl6DpwryTCNeP0hIFp3Ph4KO8",
  authDomain: "wedding-anh-linh.firebaseapp.com",
  databaseURL: "https://wedding-anh-linh-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wedding-anh-linh",
  storageBucket: "wedding-anh-linh.firebasestorage.app",
  messagingSenderId: "555487538238",
  appId: "1:555487538238:web:eac53ad5099f1c107d756f",
  measurementId: "G-Q9MCJRZ91Q"
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
    return DEFAULT_FIREBASE_CONFIG;
  }

  const config = getFirebaseConfig();
  if (config && config.projectId && typeof firebase !== 'undefined') {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(config);
      }
      const db = firebase.database();
      window.weddingFirebaseDb = db;
      console.log('🔥 Firebase Realtime Database connected successfully:', config.projectId);

      // 1. Listen to wishes in Realtime
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
      }, err => {
        console.warn('Realtime Database listen wishes warning:', err.message);
      });

      // 3. Listen to Settings (Music, Venue, Photos...) in Realtime
      db.ref('settings').on('value', snapshot => {
        try {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            localStorage.setItem('wedding_invite_settings', JSON.stringify(val));
            window.dispatchEvent(new CustomEvent('wedding_settings_updated', { detail: val }));
          }
        } catch(e) {
          console.warn('Sync settings error:', e);
        }
      });

      
      // 4. Listen to Guests in Realtime & Cloud Sync
      db.ref('guests').on('value', snapshot => {
        try {
          const val = snapshot.val();
          if (val) {
            let list = [];
            if (Array.isArray(val)) {
              list = val.filter(Boolean);
            } else if (typeof val === 'object') {
              list = Object.keys(val).map(k => ({ id: k, ...val[k] }));
            }
            localStorage.setItem('wedding_invite_guests', JSON.stringify(list));
            window.dispatchEvent(new CustomEvent('wedding_guests_synced', { detail: list }));
          } else {
            // If Firebase has no guests yet, but local device has guests, upload them!
            const localSaved = localStorage.getItem('wedding_invite_guests');
            if (localSaved) {
              try {
                const localList = JSON.parse(localSaved);
                if (Array.isArray(localList) && localList.length > 0) {
                  const map = {};
                  localList.forEach(g => { if (g && g.id) map[g.id] = g; });
                  db.ref('guests').set(map).catch(() => {});
                }
              } catch(e) {}
            }
          }
        } catch(e) {
          console.warn('Sync guests error:', e);
        }
      });

      // 2. Listen to RSVPs in Realtime
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
      }, err => {
        console.warn('Realtime Database listen RSVPs warning:', err.message);
      });

    } catch(err) {
      console.warn('Firebase init error:', err);
    }
  } else {
    console.log('Firebase: Waiting for configuration...');
  }
})();
