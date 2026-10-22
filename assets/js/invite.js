/**
 * Wedding Invitation Interactions & Dynamic Renderer
 * Chung Đôi "Tender" Theme - Đức Anh & Thuỳ Linh
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Load Wedding Data from DB
  const settings = WeddingDB.getSettings();
  initDynamicContent(settings);
  initPersonalizedGuest(settings);
  initAmbientPetals();
  initMusicPlayer(settings);
  initEnvelopeOpener();
  initRSVPForm();
  initWishesList();
});

// Helper: Toast notification
function showToast(message) {
  let toast = document.getElementById('toast-tender');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-tender';
    toast.className = 'toast-tender';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

// 1. Dynamic Content Binding from settings
function initDynamicContent(settings) {
  // Short names (for envelope & hero)
  const groomShortEls = document.querySelectorAll('.bind-groom-short');
  groomShortEls.forEach(el => el.textContent = settings.couple.groom.shortName || 'Đức Anh');

  const brideShortEls = document.querySelectorAll('.bind-bride-short');
  brideShortEls.forEach(el => el.textContent = settings.couple.bride.shortName || 'Thuỳ Linh');

  // Full names
  const groomNameEls = document.querySelectorAll('.bind-groom-name');
  groomNameEls.forEach(el => el.textContent = settings.couple.groom.fullName || 'Nguyễn Đức Anh');

  const brideNameEls = document.querySelectorAll('.bind-bride-name');
  brideNameEls.forEach(el => el.textContent = settings.couple.bride.fullName || 'Trần Thuỳ Linh');

  // Parents
  const groomFather = document.getElementById('groom-father-display');
  if (groomFather) groomFather.textContent = settings.couple.groom.father || 'Nguyễn Văn Hùng';
  const groomMother = document.getElementById('groom-mother-display');
  if (groomMother) groomMother.textContent = settings.couple.groom.mother || 'Trần Thị Mai';

  const brideFather = document.getElementById('bride-father-display');
  if (brideFather) brideFather.textContent = settings.couple.bride.father || 'Trần Quốc Tuấn';
  const brideMother = document.getElementById('bride-mother-display');
  if (brideMother) brideMother.textContent = settings.couple.bride.mother || 'Lê Thu Hà';

  // Dates & Venue
  const dateTexts = document.querySelectorAll('.bind-date-text');
  dateTexts.forEach(el => el.textContent = settings.wedding.dateText);

  const lunarTexts = document.querySelectorAll('.bind-lunar-date');
  lunarTexts.forEach(el => el.textContent = settings.wedding.lunarDateText);

  const venueTitle = document.getElementById('wedding-venue-title');
  if (venueTitle) venueTitle.textContent = settings.wedding.venueName;

  const venueDesc = document.getElementById('wedding-venue-desc');
  if (venueDesc) venueDesc.textContent = settings.wedding.venueAddress;

  const heroQuote = document.getElementById('hero-quote-text');
  if (heroQuote && settings.wedding.heroQuote) {
    heroQuote.textContent = settings.wedding.heroQuote;
  }

  const thankQuote = document.getElementById('thankyou-quote-text');
  if (thankQuote && settings.wedding.thankYouQuote) {
    thankQuote.textContent = `“${settings.wedding.thankYouQuote}”`;
  }

  // Polaroid hero image
  const heroPolaroid = document.getElementById('hero-polaroid-img');
  if (heroPolaroid && settings.gallery && settings.gallery[0]) {
    heroPolaroid.src = settings.gallery[0].src;
  }

  // Banking
  const groomBank = settings.banking ? settings.banking.groom : null;
  const brideBank = settings.banking ? settings.banking.bride : null;

  if (groomBank) {
    const groomQr = document.getElementById('groom-qr-img');
    if (groomQr && groomBank.qrUrl) groomQr.src = groomBank.qrUrl;
    const groomStk = document.getElementById('groom-stk');
    if (groomStk) groomStk.textContent = groomBank.accountNumber;
  }

  if (brideBank) {
    const brideQr = document.getElementById('bride-qr-img');
    if (brideQr && brideBank.qrUrl) brideQr.src = brideBank.qrUrl;
    const brideStk = document.getElementById('bride-stk');
    if (brideStk) brideStk.textContent = brideBank.accountNumber;
  }
}

// 2. Guest Personalization via URL Parameters
function initPersonalizedGuest(settings) {
  const urlParams = new URLSearchParams(window.location.search);
  const guestParam = urlParams.get('to') || urlParams.get('guest');
  const prefixParam = urlParams.get('prefix') || urlParams.get('xungho');
  const guestId = urlParams.get('id');

  let guestName = 'Quý Khách';
  let guestPrefix = 'Thân Mời';

  if (guestId) {
    const guests = WeddingDB.getGuests();
    const found = guests.find(g => g.id === guestId);
    if (found) {
      guestName = found.name;
      guestPrefix = found.prefix ? found.prefix : 'Thân Mời';
    }
  } else if (guestParam) {
    guestName = decodeURIComponent(guestParam);
    if (prefixParam) {
      guestPrefix = decodeURIComponent(prefixParam);
    }
  }

  // Bind to Envelope
  const envGuestLabel = document.getElementById('envelope-guest-label');
  if (envGuestLabel) envGuestLabel.textContent = guestPrefix;

  const envGuestName = document.getElementById('envelope-guest-name');
  if (envGuestName) envGuestName.textContent = guestName;

  // Auto-fill RSVP name input
  const rsvpNameInput = document.getElementById('rsvp-name');
  if (rsvpNameInput && guestName !== 'Quý Khách') {
    rsvpNameInput.value = guestName;
  }
}

// 3. Ambient Petals & Hearts in Envelope Screen
function initAmbientPetals() {
  const container = document.getElementById('petals-container');
  if (!container) return;

  const icons = ['🌸', '✨', '❤️', '🍃', '💍'];
  const count = 18;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'falling-heart';
    el.textContent = icons[Math.floor(Math.random() * icons.length)];
    el.style.left = Math.random() * 95 + '%';
    el.style.fontSize = Math.random() * 12 + 14 + 'px';
    el.style.setProperty('--sway', (Math.random() * 60 - 30) + 'px');
    el.style.animationDuration = (Math.random() * 8 + 10) + 's';
    el.style.animationDelay = -(Math.random() * 12) + 's';
    container.appendChild(el);
  }
}

// 4. Envelope Opening & Audio Autoplay
function initEnvelopeOpener() {
  const envelopeScreen = document.getElementById('envelope-screen');
  const btnOpen = document.getElementById('btn-open-envelope');
  const waxSeal = document.getElementById('wax-seal-btn');

  // Check URL if already open
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('open') === '1') {
    if (envelopeScreen) envelopeScreen.classList.add('opened');
    return;
  }

  function openEnvelope() {
    if (!envelopeScreen) return;
    envelopeScreen.classList.add('opened');
    playBackgroundMusic();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (btnOpen) btnOpen.addEventListener('click', openEnvelope);
  if (waxSeal) waxSeal.addEventListener('click', openEnvelope);
}

// 5. Audio Player
let audioObj = null;
let isAudioPlaying = false;

function initMusicPlayer(settings) {
  const toggleBtn = document.getElementById('music-toggle-btn');
  if (!toggleBtn) return;

  const audioSrc = settings.wedding.musicUrl || 'https://assets.mixkit.co/music/preview/mixkit-wedding-waltz-piano-581.mp3';
  audioObj = new Audio(audioSrc);
  audioObj.loop = true;
  audioObj.preload = 'auto';

  toggleBtn.addEventListener('click', () => {
    if (isAudioPlaying) {
      pauseBackgroundMusic();
    } else {
      playBackgroundMusic();
    }
  });
}

function playBackgroundMusic() {
  const toggleBtn = document.getElementById('music-toggle-btn');
  if (!audioObj) return;

  audioObj.play().then(() => {
    isAudioPlaying = true;
    if (toggleBtn) {
      toggleBtn.classList.add('playing');
      toggleBtn.title = 'Tạm dừng nhạc';
    }
  }).catch(e => {
    console.log('Audio autoplay prevented or offline:', e);
    startWebAudioHarpFallback();
  });
}

function pauseBackgroundMusic() {
  const toggleBtn = document.getElementById('music-toggle-btn');
  if (audioObj) audioObj.pause();
  isAudioPlaying = false;
  if (toggleBtn) {
    toggleBtn.classList.remove('playing');
    toggleBtn.title = 'Phát nhạc cưới';
  }
  stopWebAudioHarpFallback();
}

// Gentle Web Audio API ambient chime fallback
let audioCtx = null;
let harpInterval = null;

function startWebAudioHarpFallback() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    audioCtx = new AudioContext();
    const chords = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63];
    let noteIdx = 0;

    harpInterval = setInterval(() => {
      if (!isAudioPlaying || !audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(chords[noteIdx % chords.length], audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.8);
      noteIdx++;
    }, 1200);

    isAudioPlaying = true;
    const toggleBtn = document.getElementById('music-toggle-btn');
    if (toggleBtn) toggleBtn.classList.add('playing');
  } catch (err) {
    console.warn(err);
  }
}

function stopWebAudioHarpFallback() {
  if (harpInterval) {
    clearInterval(harpInterval);
    harpInterval = null;
  }
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
}

// 6. Lightbox View
window.openLightboxImage = function(src) {
  const modal = document.getElementById('lightbox-modal');
  const imgEl = document.getElementById('lightbox-img');
  if (modal && imgEl) {
    imgEl.src = src;
    modal.classList.add('active');
  }
};

window.closeLightbox = function() {
  const modal = document.getElementById('lightbox-modal');
  if (modal) {
    modal.classList.remove('active');
  }
};

// 7. VietQR Tab Switcher & Copy STK
window.toggleGiftTab = function(tab) {
  const groomBox = document.getElementById('gift-groom-box');
  const brideBox = document.getElementById('gift-bride-box');
  const btnGroom = document.getElementById('tab-groom-btn');
  const btnBride = document.getElementById('tab-bride-btn');

  if (tab === 'groom') {
    if (groomBox) groomBox.style.display = 'block';
    if (brideBox) brideBox.style.display = 'none';
    if (btnGroom) {
      btnGroom.style.background = 'var(--primary)';
      btnGroom.style.color = '#fff';
    }
    if (btnBride) {
      btnBride.style.background = 'transparent';
      btnBride.style.color = 'var(--primary)';
    }
  } else {
    if (groomBox) groomBox.style.display = 'none';
    if (brideBox) brideBox.style.display = 'block';
    if (btnBride) {
      btnBride.style.background = 'var(--primary)';
      btnBride.style.color = '#fff';
    }
    if (btnGroom) {
      btnGroom.style.background = 'transparent';
      btnGroom.style.color = 'var(--primary)';
    }
  }
};

window.copyStk = function(stk) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(stk).then(() => {
      showToast(`Đã sao chép số tài khoản: ${stk}`);
    }).catch(() => {
      showToast(`Số tài khoản: ${stk}`);
    });
  } else {
    showToast(`Số tài khoản: ${stk}`);
  }
};

// 8. Add to Google Calendar
window.addToGoogleCalendar = function(title, date, time, location) {
  const startDateTime = `${date.replace(/-/g, '')}T${time.replace(/:/g, '')}00`;
  const endDateTime = `${date.replace(/-/g, '')}T140000`;
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDateTime}/${endDateTime}&details=Đức+Anh+%26+Thuỳ+Linh+Wedding&location=${encodeURIComponent(location)}`;
  window.open(url, '_blank');
};

// 9. Wishes Book Renderer
function initWishesList() {
  const container = document.getElementById('wishes-display-box') || document.getElementById('wishes-list-container');
  if (!container) return;

  const wishes = WeddingDB.getWishes();
  container.innerHTML = '';

  wishes.forEach(w => {
    const card = document.createElement('div');
    card.className = 'wish-note-item';
    card.style.cssText = 'padding:10px 12px;margin-bottom:8px;background:rgba(255,255,255,0.7);border-radius:6px;border-left:3px solid var(--primary);font-size:13px;';
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <strong style="color:var(--primary);font-size:13px;">${w.name}</strong>
        <span style="font-size:11px;color:rgba(81,20,25,0.6);">${w.timestamp || ''}</span>
      </div>
      <p style="color:#333;margin:0;line-height:1.4;">${w.message}</p>
    `;
    container.appendChild(card);
  });
}

// 10. RSVP Form Submission
function initRSVPForm() {
  const form = document.getElementById('wedding-rsvp-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('rsvp-name');
    const phoneInput = document.getElementById('rsvp-phone');
    const attendInput = document.getElementById('rsvp-attend');
    const countInput = document.getElementById('rsvp-count');
    const wishInput = document.getElementById('rsvp-wish');

    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const attendance = attendInput ? attendInput.value : 'yes';
    const count = parseInt(countInput ? countInput.value : '1', 10);
    const wish = wishInput ? wishInput.value.trim() : '';

    if (!name) {
      alert('Vui lòng nhập họ tên của bạn!');
      return;
    }

    const rsvpData = {
      name,
      phone,
      attendance,
      party: 'Nhà Trai & Nhà Gái',
      guestCount: count,
      wish
    };

    WeddingDB.addRSVP(rsvpData);

    if (wish) {
      WeddingDB.addWish({
        name,
        relation: attendance === 'yes' ? 'Khách quý tham dự' : 'Bạn bè gửi lời chúc',
        message: wish
      });
      initWishesList();
    }

    fireConfetti();
    showToast('Xác nhận tham dự thành công! Cảm ơn bạn rất nhiều ❤');

    // Reset wish input
    if (wishInput) wishInput.value = '';
  });
}

// 11. Confetti Animation
function fireConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const confettiCount = 100;
  const particles = [];
  const colors = ['#511419', '#c9a24a', '#e5c97d', '#8a252d', '#ffffff'];

  for (let i = 0; i < confettiCount; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      w: Math.random() * 8 + 4,
      h: Math.random() * 8 + 4,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.7) * 18,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: Math.random() * 360,
      tilt: Math.random() * 10 - 5
    });
  }

  let frames = 0;
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4;
      p.angle += 4;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.angle * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    frames++;
    if (frames < 120) {
      requestAnimationFrame(render);
    } else {
      canvas.remove();
    }
  }
  render();
}
