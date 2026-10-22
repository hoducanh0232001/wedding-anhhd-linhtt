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
  initCountdown(settings.wedding.date + 'T' + settings.wedding.time);
  initGalleryLightbox(settings.gallery);
  initRSVPForm();
  initWishesList();
  initWishSuggestionsModal();
  initGiftBoxTabs(settings);
  initEnvelopeOpener();
});

// Helper: Toast notification
function showToast(message) {
  let toast = document.getElementById('toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notice';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// 1. Dynamic Content Binding from settings
function initDynamicContent(settings) {
  // Couple Names
  const coupleNamesEl = document.querySelectorAll('.bind-couple-names');
  coupleNamesEl.forEach(el => {
    el.innerHTML = `${settings.couple.groom.shortName} <span class="amp">&</span> ${settings.couple.bride.shortName}`;
  });

  const groomNameEl = document.querySelectorAll('.bind-groom-name');
  groomNameEl.forEach(el => el.textContent = settings.couple.groom.fullName);

  const brideNameEl = document.querySelectorAll('.bind-bride-name');
  brideNameEl.forEach(el => el.textContent = settings.couple.bride.fullName);

  // Photos
  const heroImg = document.getElementById('hero-bg-img');
  if (heroImg && settings.gallery && settings.gallery[0]) {
    heroImg.src = settings.gallery[0].src;
  }
  const groomImg = document.getElementById('groom-portrait-img');
  if (groomImg) groomImg.src = settings.couple.groom.photo;
  const brideImg = document.getElementById('bride-portrait-img');
  if (brideImg) brideImg.src = settings.couple.bride.photo;

  // Bios & Parents
  const groomBio = document.getElementById('groom-bio');
  if (groomBio) groomBio.textContent = settings.couple.groom.bio;
  const brideBio = document.getElementById('bride-bio');
  if (brideBio) brideBio.textContent = settings.couple.bride.bio;

  const groomParents = document.getElementById('groom-parents');
  if (groomParents) {
    groomParents.textContent = `Ông: ${settings.couple.groom.father} — Bà: ${settings.couple.groom.mother}`;
  }
  const brideParents = document.getElementById('bride-parents');
  if (brideParents) {
    brideParents.textContent = `Ông: ${settings.couple.bride.father} — Bà: ${settings.couple.bride.mother}`;
  }

  // Dates & Venue
  const dateTexts = document.querySelectorAll('.bind-date-text');
  dateTexts.forEach(el => el.textContent = settings.wedding.dateText);

  const lunarTexts = document.querySelectorAll('.bind-lunar-date');
  lunarTexts.forEach(el => el.textContent = settings.wedding.lunarDateText);

  const heroQuote = document.getElementById('hero-quote-text');
  if (heroQuote) heroQuote.textContent = `“${settings.wedding.heroQuote}”`;

  const thankQuote = document.getElementById('thankyou-quote-text');
  if (thankQuote) thankQuote.textContent = `“${settings.wedding.thankYouQuote}”`;

  // Render Events
  renderEvents(settings.events);

  // Render Story
  renderStories(settings.stories);

  // Render Gallery
  renderGallery(settings.gallery);
}

// 2. Guest Personalization via URL Parameters
function initPersonalizedGuest(settings) {
  const urlParams = new URLSearchParams(window.location.search);
  const guestParam = urlParams.get('to') || urlParams.get('guest');
  const prefixParam = urlParams.get('prefix') || urlParams.get('xungho');
  const guestId = urlParams.get('id');

  let guestName = 'Quý Khách';
  let guestPrefix = 'Thân Mời';
  let customGreeting = 'Sự hiện diện của bạn là niềm vinh hạnh to lớn và là món quà ý nghĩa nhất dành cho chúng mình!';

  if (guestId) {
    const guests = WeddingDB.getGuests();
    const found = guests.find(g => g.id === guestId);
    if (found) {
      guestName = found.name;
      guestPrefix = found.prefix ? found.prefix : 'Thân Mời';
      if (found.customMessage) customGreeting = found.customMessage;
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

  // Bind to Guest Card section
  const guestCardPrefix = document.getElementById('guest-card-salutation');
  if (guestCardPrefix) guestCardPrefix.textContent = guestPrefix;

  const guestCardName = document.getElementById('guest-card-name');
  if (guestCardName) guestCardName.textContent = guestName;

  const guestCardMessage = document.getElementById('guest-card-message');
  if (guestCardMessage) guestCardMessage.textContent = customGreeting;

  // Auto-fill RSVP name input
  const rsvpNameInput = document.getElementById('rsvp-name');
  if (rsvpNameInput && guestName !== 'Quý Khách') {
    rsvpNameInput.value = guestName;
  }
}

// 3. Ambient Petals & Hearts in Envelope Screen
function initAmbientPetals() {
  const container = document.querySelector('.ambient-petals-container');
  if (!container) return;

  const icons = ['🌸', '✨', '❤️', '🍃', '💍'];
  const count = 18;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'falling-item';
    el.textContent = icons[Math.floor(Math.random() * icons.length)];
    el.style.left = Math.random() * 95 + '%';
    el.style.fontSize = Math.random() * 12 + 14 + 'px';
    el.style.setProperty('--sway', (Math.random() * 60 - 30) + 'px');
    el.style.animationDuration = (Math.random() * 10 + 12) + 's';
    el.style.animationDelay = -(Math.random() * 15) + 's';
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
    // Attempt play background music
    playBackgroundMusic();
    // Smooth scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (btnOpen) btnOpen.addEventListener('click', openEnvelope);
  if (waxSeal) waxSeal.addEventListener('click', openEnvelope);
}

// 5. Audio Player (with romantic melody fallback)
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
    // If external audio fails, Web Audio API gentle synth fallback
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

// Gentle Web Audio API romantic ambient chime if mp3 fails
let audioCtx = null;
let harpInterval = null;

function startWebAudioHarpFallback() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    audioCtx = new AudioContext();
    const chords = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63]; // C-E-G-C gentle waltz
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

// 6. Live Countdown Clock
function initCountdown(targetDateStr) {
  const daysEl = document.getElementById('count-days');
  const hoursEl = document.getElementById('count-hours');
  const minsEl = document.getElementById('count-mins');
  const secsEl = document.getElementById('count-secs');

  if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

  const targetTime = new Date(targetDateStr).getTime();

  function update() {
    const now = new Date().getTime();
    const diff = targetTime - now;

    if (diff <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minsEl.textContent = '00';
      secsEl.textContent = '00';
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent = String(d).padStart(2, '0');
    hoursEl.textContent = String(h).padStart(2, '0');
    minsEl.textContent = String(m).padStart(2, '0');
    secsEl.textContent = String(s).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

// 7. Render Events List
function renderEvents(events) {
  const container = document.getElementById('events-container');
  if (!container) return;

  container.innerHTML = '';
  events.forEach(ev => {
    const card = document.createElement('div');
    card.className = `event-card ${ev.isPrimary ? 'primary' : ''}`;
    card.innerHTML = `
      <span class="event-badge">${ev.badge}</span>
      <h3 class="event-title">${ev.title}</h3>
      <div class="event-details">
        <div class="event-detail-row">
          <svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
          <strong>Thời gian:</strong> ${ev.time} — ${ev.dateText}
        </div>
        <div class="event-detail-row">
          <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          <strong>Địa điểm:</strong> ${ev.venue}
        </div>
        <div class="event-detail-row">
          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v2h-2zm0-10h2v8h-2z"/></svg>
          <span>${ev.address}</span>
        </div>
      </div>
      <div class="event-actions">
        <a href="${ev.mapUrl}" target="_blank" rel="noopener" class="btn-primary btn-sm">
          <svg style="width:14px;height:14px;fill:currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          Chỉ đường Google Maps
        </a>
        <button class="btn-secondary btn-sm" onclick="addToGoogleCalendar('${encodeURIComponent(ev.title)}', '${ev.date}', '${ev.time}', '${encodeURIComponent(ev.venue + ', ' + ev.address)}')">
          <svg style="width:14px;height:14px;fill:currentColor" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5z"/></svg>
          Thêm vào lịch
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Calendar link helper
window.addToGoogleCalendar = function(title, date, time, location) {
  const startDateTime = `${date.replace(/-/g, '')}T${time.replace(/:/g, '')}00`;
  const endDateTime = `${date.replace(/-/g, '')}T140000`;
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateTime}/${endDateTime}&details=Đức+Anh+%26+Thuỳ+Linh+Wedding&location=${location}`;
  window.open(url, '_blank');
};

// 8. Render Love Story
function renderStories(stories) {
  const container = document.getElementById('story-timeline-container');
  if (!container) return;

  container.innerHTML = '';
  stories.forEach(story => {
    const item = document.createElement('div');
    item.className = 'timeline-item';
    item.innerHTML = `
      <div class="timeline-node">❤</div>
      <div class="timeline-content">
        <img class="timeline-img" src="${story.photo}" alt="${story.title}" loading="lazy" />
        <div class="timeline-date">${story.year}</div>
        <h4 class="timeline-title">${story.title}</h4>
        <p class="timeline-desc">${story.description}</p>
      </div>
    `;
    container.appendChild(item);
  });
}

// 9. Render Gallery & Lightbox
function renderGallery(gallery) {
  const container = document.getElementById('gallery-grid-container');
  if (!container) return;

  container.innerHTML = '';
  gallery.forEach((img, idx) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML = `
      <img src="${img.src}" alt="${img.caption}" loading="lazy" />
      <div class="gallery-overlay">
        <span>🔍 Phóng to</span>
      </div>
    `;
    item.addEventListener('click', () => openLightbox(idx, gallery));
    container.appendChild(item);
  });
}

let currentLightboxIndex = 0;
let currentGalleryList = [];

function initGalleryLightbox(gallery) {
  currentGalleryList = gallery;
  const modal = document.getElementById('lightbox-modal');
  const closeBtn = document.getElementById('lightbox-close-btn');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!modal || !modal.classList.contains('active')) return;
    if (e.key === 'Escape') modal.classList.remove('active');
    if (e.key === 'ArrowRight') nextLightboxImage();
    if (e.key === 'ArrowLeft') prevLightboxImage();
  });
}

function openLightbox(index, gallery) {
  currentLightboxIndex = index;
  currentGalleryList = gallery;
  const modal = document.getElementById('lightbox-modal');
  const imgEl = document.getElementById('lightbox-img');
  const captionEl = document.getElementById('lightbox-caption');

  if (modal && imgEl) {
    const item = gallery[index];
    imgEl.src = item.src;
    if (captionEl) captionEl.textContent = item.caption;
    modal.classList.add('active');
  }
}

function nextLightboxImage() {
  if (!currentGalleryList.length) return;
  currentLightboxIndex = (currentLightboxIndex + 1) % currentGalleryList.length;
  openLightbox(currentLightboxIndex, currentGalleryList);
}

function prevLightboxImage() {
  if (!currentGalleryList.length) return;
  currentLightboxIndex = (currentLightboxIndex - 1 + currentGalleryList.length) % currentGalleryList.length;
  openLightbox(currentLightboxIndex, currentGalleryList);
}

// 10. RSVP Form Submission
function initRSVPForm() {
  const form = document.getElementById('wedding-rsvp-form');
  const successBox = document.getElementById('rsvp-success-box');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form['rsvp-name'].value.trim();
    const phone = form['rsvp-phone'].value.trim();
    const attendance = form['rsvp-attend'].value;
    const party = form['rsvp-party'].value;
    const count = parseInt(form['rsvp-count'].value || '1', 10);
    const wish = form['rsvp-wish'].value.trim();

    if (!name) {
      alert('Vui lòng điền họ và tên của bạn.');
      return;
    }

    const rsvpData = {
      name,
      phone,
      attendance,
      party,
      guestCount: count,
      wish
    };

    WeddingDB.addRSVP(rsvpData);

    // If wish was written, add to public wishes book
    if (wish) {
      WeddingDB.addWish({
        name,
        relation: attendance === 'yes' ? 'Khách quý tham dự' : 'Bạn bè gửi lời chúc',
        message: wish
      });
      initWishesList();
    }

    // Trigger celebratory confetti
    fireConfetti();

    // Show success view
    form.style.display = 'none';
    if (successBox) {
      successBox.classList.add('active');
      const summary = document.getElementById('rsvp-success-summary');
      if (summary) {
        summary.innerHTML = `
          <p style="font-weight:600;color:var(--primary);margin-bottom:8px;">Cảm ơn <strong>${name}</strong>!</p>
          <p>${attendance === 'yes' ? `Chúng mình rất vui và háo hức chờ đón bạn (${count} người) đến chung vui!` : 'Rất tiếc vì bạn không thể đến, nhưng chúng mình vô cùng trân trọng tình cảm và lời chúc của bạn!'}</p>
        `;
      }
    }

    showToast('Xác nhận tham dự thành công! Cảm ơn bạn rất nhiều ❤');
  });
}

// Festive confetti animation using canvas
function fireConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const confettiCount = 120;
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
      p.vy += 0.4; // gravity
      p.angle += 4;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.angle * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    frames++;
    if (frames < 140) {
      requestAnimationFrame(render);
    } else {
      canvas.remove();
    }
  }
  render();
}

// 11. Wishes Book Renderer
function initWishesList() {
  const container = document.getElementById('wishes-list-container');
  if (!container) return;

  const wishes = WeddingDB.getWishes();
  container.innerHTML = '';

  wishes.forEach(w => {
    const card = document.createElement('div');
    card.className = 'wish-card';
    card.innerHTML = `
      <div class="wish-header">
        <div>
          <span class="wish-author">${w.name}</span>
          ${w.relation ? `<span class="wish-relation">${w.relation}</span>` : ''}
        </div>
        <span class="wish-time">${w.timestamp}</span>
      </div>
      <p class="wish-body">${w.message}</p>
    `;
    container.appendChild(card);
  });
}

// 12. Wish Suggestions Modal
function initWishSuggestionsModal() {
  const modal = document.getElementById('wish-suggestions-modal');
  const openBtn = document.getElementById('btn-open-suggestions');
  const closeBtn = document.getElementById('btn-close-suggestions');
  const container = document.getElementById('suggestions-list');
  const rsvpWishTextarea = document.getElementById('rsvp-wish');

  if (!modal || !openBtn || !container) return;

  openBtn.addEventListener('click', () => {
    container.innerHTML = '';
    const all = [
      ...AI_WISH_SUGGESTIONS.friends,
      ...AI_WISH_SUGGESTIONS.colleagues,
      ...AI_WISH_SUGGESTIONS.elders
    ];

    all.forEach(wishText => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';
      item.textContent = wishText;
      item.addEventListener('click', () => {
        if (rsvpWishTextarea) {
          rsvpWishTextarea.value = wishText;
          modal.classList.remove('active');
          showToast('Đã chọn lời chúc!');
        }
      });
      container.appendChild(item);
    });

    modal.classList.add('active');
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
}

// 13. Gift Box Tabs & QR Codes
function initGiftBoxTabs(settings) {
  const tabs = document.querySelectorAll('.gift-tab-btn');
  const contents = document.querySelectorAll('.gift-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const activeContent = document.getElementById(`gift-content-${target}`);
      if (activeContent) activeContent.classList.add('active');
    });
  });

  // Bind Bank Data
  const groomBank = settings.banking.groom;
  const brideBank = settings.banking.bride;

  const groomQr = document.getElementById('groom-qr-img');
  if (groomQr) groomQr.src = groomBank.qrUrl;
  const groomBankName = document.getElementById('groom-bank-name');
  if (groomBankName) groomBankName.textContent = groomBank.bankName;
  const groomAccNum = document.getElementById('groom-acc-number');
  if (groomAccNum) groomAccNum.textContent = groomBank.accountNumber;
  const groomAccName = document.getElementById('groom-acc-name');
  if (groomAccName) groomAccName.textContent = groomBank.accountName;

  const brideQr = document.getElementById('bride-qr-img');
  if (brideQr) brideQr.src = brideBank.qrUrl;
  const brideBankName = document.getElementById('bride-bank-name');
  if (brideBankName) brideBankName.textContent = brideBank.bankName;
  const brideAccNum = document.getElementById('bride-acc-number');
  if (brideAccNum) brideAccNum.textContent = brideBank.accountNumber;
  const brideAccName = document.getElementById('bride-acc-name');
  if (brideAccName) brideAccName.textContent = brideBank.accountName;

  // Copy Buttons
  window.copyToClipboard = function(text, label = 'số tài khoản') {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`Đã sao chép ${label}: ${text}`);
    }).catch(() => {
      showToast(`Số tài khoản: ${text}`);
    });
  };
}
