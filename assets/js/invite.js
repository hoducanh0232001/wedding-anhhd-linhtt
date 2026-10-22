/**
 * Wedding Invitation Interactions & Dynamic Renderer
 * Chung Đôi "Tender" Theme - Đức Anh & Thuỳ Linh
 * Includes 3D Cylindrical Revolver Carousel ("Băng đạn xoay xoay"), Countdown, Audio, etc.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 0. Apply Selected Theme
  const activeThemeId = WeddingDB.getThemeId();
  document.body.setAttribute('data-theme', activeThemeId);

  // 1. Load Wedding Data from DB
  const settings = WeddingDB.getSettings();
  initDynamicContent(settings);
  initPersonalizedGuest(settings);
  initAmbientPetals();
  initMusicPlayer(settings);
  initEnvelopeOpener();
  initCountdown(settings.wedding.date + 'T' + settings.wedding.time);
  initGallery(settings.gallery);
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
  if (!settings) settings = WeddingDB.getSettings();

  // Short names (for envelope)
  const groomShortEls = document.querySelectorAll('.bind-groom-short');
  groomShortEls.forEach(el => el.textContent = settings.couple.groom.shortName || 'Đức Anh');

  const brideShortEls = document.querySelectorAll('.bind-bride-short');
  brideShortEls.forEach(el => el.textContent = settings.couple.bride.shortName || 'Thuỳ Linh');

  // Full names (for hero & ceremony cards)
  const groomNameEls = document.querySelectorAll('.bind-groom-name');
  groomNameEls.forEach(el => el.textContent = settings.couple.groom.fullName || 'Hồ Đức Anh');

  const brideNameEls = document.querySelectorAll('.bind-bride-name');
  brideNameEls.forEach(el => el.textContent = settings.couple.bride.fullName || 'Thái Thuỳ Linh');

  // Parents
  const groomFather = document.getElementById('groom-father-display');
  if (groomFather) groomFather.textContent = settings.couple.groom.father || 'Hồ Xuân Tươi';
  const groomMother = document.getElementById('groom-mother-display');
  if (groomMother) groomMother.textContent = settings.couple.groom.mother || 'Vũ Thị Tươi';

  const brideFather = document.getElementById('bride-father-display');
  if (brideFather) brideFather.textContent = settings.couple.bride.father || 'Thái Đức Tuyển';
  const brideMother = document.getElementById('bride-mother-display');
  if (brideMother) brideMother.textContent = settings.couple.bride.mother || 'Nguyễn Thị Tố Hoài';

  // Addresses
  const groomAddress = document.getElementById('groom-address-display');
  if (groomAddress) groomAddress.textContent = settings.couple.groom.address || '18LK 15 Khu đô thị Phú Lương, Văn Phú, Hà Đông';
  const brideAddress = document.getElementById('bride-address-display');
  if (brideAddress) brideAddress.textContent = settings.couple.bride.address || 'Số 2 ngõ 4 Đường Thống Nhất, Phú Nhiêu, Phú Xuyên, Hà Nội';

  // Dates & Venue
  const weddingDateStr = settings.wedding.date || '2026-11-29';
  const weddingTimeStr = settings.wedding.time || '11:00';
  const weddingDateObj = new Date(`${weddingDateStr}T${weddingTimeStr}`);

  const daysOfWeek = ['CHỦ NHẬT', 'THỨ HAI', 'THỨ BA', 'THỨ TƯ', 'THỨ NĂM', 'THỨ SÁU', 'THỨ BẢY'];
  const dayOfWeek = !isNaN(weddingDateObj) ? daysOfWeek[weddingDateObj.getDay()] : 'CHỦ NHẬT';
  const dayNum = !isNaN(weddingDateObj) ? String(weddingDateObj.getDate()).padStart(2, '0') : '29';
  const monthNum = !isNaN(weddingDateObj) ? String(weddingDateObj.getMonth() + 1).padStart(2, '0') : '11';
  const yearNum = !isNaN(weddingDateObj) ? String(weddingDateObj.getFullYear()) : '2026';

  // Ceremony Big Date Box
  const dayOfWeekEl = document.getElementById('ceremony-dayofweek');
  if (dayOfWeekEl) dayOfWeekEl.textContent = dayOfWeek;

  const dayNumEl = document.getElementById('ceremony-day-num');
  if (dayNumEl) dayNumEl.textContent = dayNum;

  const monthYearEl = document.getElementById('ceremony-month-year');
  if (monthYearEl) monthYearEl.textContent = `THÁNG ${monthNum} / ${yearNum}`;

  // Reception time display
  const receptionTimeEl = document.getElementById('reception-time-display');
  if (receptionTimeEl) {
    receptionTimeEl.textContent = `${weddingTimeStr} — ${dayOfWeek}, ${dayNum} THÁNG ${monthNum} NĂM ${yearNum}`;
  }

  const receptionGuestTimeEl = document.getElementById('reception-guest-time-display');
  if (receptionGuestTimeEl) {
    receptionGuestTimeEl.textContent = `(ĐÓN TIẾP KHÁCH QUÝ: ${settings.wedding.receptionTime || '10:30'})`;
  }

  // Mini Calendar Widget
  renderMiniCalendar(weddingDateStr);

  const dateTexts = document.querySelectorAll('.bind-date-text');
  dateTexts.forEach(el => el.textContent = settings.wedding.dateText || `${dayOfWeek}, ${dayNum} Tháng ${monthNum}, ${yearNum}`);

  const lunarTexts = document.querySelectorAll('.bind-lunar-date');
  lunarTexts.forEach(el => el.textContent = settings.wedding.lunarDateText || 'Tức Ngày 21 Tháng 10 Năm Bính Ngọ');

  const venueTitle = document.getElementById('wedding-venue-title');
  if (venueTitle) venueTitle.textContent = settings.wedding.venueName || 'Trung tâm tiệc cưới Hoàng Gia Palace (Cơ sở 1)';

  const venueDesc = document.getElementById('wedding-venue-desc');
  if (venueDesc) venueDesc.textContent = settings.wedding.venueAddress || 'Tầng 2, Tòa nhà Victoria, KĐT Văn Phú, Quận Hà Đông, Hà Nội';

  // Google Maps button & iframe
  const mapBtn = document.getElementById('wedding-map-btn');
  if (mapBtn && settings.wedding.mapUrl) {
    mapBtn.href = settings.wedding.mapUrl;
  }

  const mapIframe = document.getElementById('wedding-map-iframe');
  if (mapIframe && (settings.wedding.venueName || settings.wedding.venueAddress)) {
    const q = encodeURIComponent(`${settings.wedding.venueName || ''} ${settings.wedding.venueAddress || ''}`.trim());
    mapIframe.src = `https://maps.google.com/maps?q=${q}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  // Timeline
  const timelineReception = document.getElementById('timeline-reception-time');
  if (timelineReception) {
    timelineReception.textContent = `${settings.wedding.receptionTime || '10:30'} — ĐÓN TIẾP KHÁCH QUÝ`;
  }

  const timelineCeremony = document.getElementById('timeline-ceremony-time');
  if (timelineCeremony) {
    timelineCeremony.textContent = `${weddingTimeStr} — LỄ THÀNH HÔN & CẮT BÁNH`;
  }

  // Quotes
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
    if (groomStk) groomStk.textContent = groomBank.accountNumber || '0988889999';
    const groomBankName = document.getElementById('groom-bank-name');
    if (groomBankName) groomBankName.textContent = groomBank.bankName || 'MB Bank (Ngân hàng Quân Đội)';
    const groomHolder = document.getElementById('groom-holder');
    if (groomHolder) groomHolder.textContent = groomBank.accountName || settings.couple.groom.fullName || 'HO DUC ANH';
  }

  if (brideBank) {
    const brideQr = document.getElementById('bride-qr-img');
    if (brideQr && brideBank.qrUrl) brideQr.src = brideBank.qrUrl;
    const brideStk = document.getElementById('bride-stk');
    if (brideStk) brideStk.textContent = brideBank.accountNumber || '9988776655';
    const brideBankName = document.getElementById('bride-bank-name');
    if (brideBankName) brideBankName.textContent = brideBank.bankName || 'Vietcombank (Ngoại Thương)';
    const brideHolder = document.getElementById('bride-holder');
    if (brideHolder) brideHolder.textContent = brideBank.accountName || settings.couple.bride.fullName || 'THAI THUY LINH';
  }

  // Footer
  const footerCoupleNames = document.getElementById('footer-couple-names');
  if (footerCoupleNames) {
    footerCoupleNames.textContent = `${settings.couple.groom.fullName} & ${settings.couple.bride.fullName}`;
  }

  const footerWeddingDate = document.getElementById('footer-wedding-date');
  if (footerWeddingDate) {
    footerWeddingDate.textContent = `${dayNum} . ${monthNum} . ${yearNum}`;
  }

  // Document Title
  if (settings.couple.groom.fullName && settings.couple.bride.fullName) {
    document.title = `${settings.couple.groom.fullName} & ${settings.couple.bride.fullName} | Thiệp Cưới Online`;
  }

  // Live Countdown Re-init
  initCountdown(`${weddingDateStr}T${weddingTimeStr}`);

  // Show/Hide Bank / QR Section
  const giftSection = document.getElementById('section-gift');
  if (giftSection) {
    if (settings.showBank === false) {
      giftSection.style.display = 'none';
    } else {
      giftSection.style.display = 'block';
    }
  }
}

// Helper: Render Dynamic Mini-Calendar
function renderMiniCalendar(dateStr) {
  const tbody = document.getElementById('mini-cal-tbody');
  const monthTitle = document.getElementById('mini-cal-month-title');
  if (!tbody) return;

  const weddingDate = new Date(dateStr);
  if (isNaN(weddingDate)) return;

  const year = weddingDate.getFullYear();
  const month = weddingDate.getMonth(); // 0-indexed
  const weddingDay = weddingDate.getDate();

  if (monthTitle) {
    monthTitle.textContent = `Tháng ${month + 1}`;
  }

  // First day of month (0: Sunday, 1: Monday, ..., 6: Saturday)
  const firstDay = new Date(year, month, 1).getDay();
  // Monday = 0, Tuesday = 1, ..., Sunday = 6
  const startOffset = (firstDay + 6) % 7;
  const totalDays = new Date(year, month + 1, 0).getDate();

  let html = '<tr>';
  let dayCol = 0;

  for (let i = 0; i < startOffset; i++) {
    html += '<td></td>';
    dayCol++;
  }

  for (let d = 1; d <= totalDays; d++) {
    if (dayCol === 7) {
      html += '</tr><tr>';
      dayCol = 0;
    }

    if (d === weddingDay) {
      html += `<td class="active-day"><span class="cal-heart" title="Ngày cưới: ${weddingDay} Tháng ${month + 1}"><svg class="cal-heart-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg><span class="cal-heart-number">${d}</span></span></td>`;
    } else {
      html += `<td>${d}</td>`;
    }
    dayCol++;
  }

  if (dayCol > 0 && dayCol < 7) {
    for (let i = dayCol; i < 7; i++) {
      html += '<td></td>';
    }
  }
  html += '</tr>';

  tbody.innerHTML = html;
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

let countdownTimer = null;

// 6. Live Countdown Clock
function initCountdown(targetDateStr) {
  const daysEl = document.getElementById('count-days');
  const hoursEl = document.getElementById('count-hours');
  const minsEl = document.getElementById('count-mins');
  const secsEl = document.getElementById('count-secs');

  if (!daysEl || !hoursEl || !minsEl || !secsEl) return;
  if (countdownTimer) clearInterval(countdownTimer);

  function update() {
    const target = new Date(targetDateStr).getTime();
    const now = Date.now();
    const diff = target - now;

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
  countdownTimer = setInterval(update, 1000);
}

// 7. 3D CYLINDRICAL ARC COVERFLOW CAROUSEL (Khớp 100% Ảnh Yêu Cầu & Counter X/16)
let currentGalleryList = [];
let currentLightboxIdx = 0;
let carouselActiveIdx = 0;
let carouselAutoTimer = null;
let carouselIsHovered = false;

function initGallery(gallery) {
  const track = document.getElementById('carousel-cards-track');
  const counter = document.getElementById('carousel-page-counter');
  const prevBtn = document.getElementById('carousel-prev-btn');
  const nextBtn = document.getElementById('carousel-next-btn');
  const stage = document.getElementById('carousel-3d-stage');

  if (!track || !gallery || !Array.isArray(gallery) || gallery.length === 0) return;

  currentGalleryList = gallery;
  track.innerHTML = '';
  const count = gallery.length;
  carouselActiveIdx = 0;

  const cards = [];

  gallery.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'carousel-3d-card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', item.caption || `Ảnh cưới ${idx + 1}`);

    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.caption || `Ảnh cưới ${idx + 1}`;
    img.loading = 'lazy';
    card.appendChild(img);

    card.addEventListener('click', () => {
      if (idx === carouselActiveIdx) {
        // Bấm ảnh giữa để phóng to xem Lightbox
        openLightbox(idx);
      } else {
        // Bấm ảnh hai bên để xoay đến vị trí giữa
        carouselActiveIdx = idx;
        render3DCarousel();
        resetCarouselAutoTimer();
      }
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (idx === carouselActiveIdx) {
          openLightbox(idx);
        } else {
          carouselActiveIdx = idx;
          render3DCarousel();
          resetCarouselAutoTimer();
        }
      }
    });

    track.appendChild(card);
    cards.push(card);
  });

  function render3DCarousel() {
    const isMobile = window.innerWidth < 640;
    
    // Spacing constants tuned to match user's screenshot
    const transXStep = isMobile ? 85 : 110;
    const transZStep = isMobile ? 80 : 90;
    const rotateStep = 32;

    cards.forEach((card, idx) => {
      let l = idx - carouselActiveIdx;
      // Wrap-around circular math
      if (l > count / 2) l -= count;
      else if (l < -count / 2) l += count;

      const o = Math.abs(l);

      if (o > 3) {
        card.style.opacity = '0';
        card.style.visibility = 'hidden';
        card.style.pointerEvents = 'none';
        card.style.zIndex = '0';
      } else {
        card.style.visibility = 'visible';
        card.style.pointerEvents = 'auto';

        let scale = 1;
        let opacity = 1;
        let translateX = 0;
        let translateZ = 0;
        let rotateY = 0;
        let zIndex = 50 - o * 10;

        if (o === 0) {
          scale = 1;
          opacity = 1;
          translateX = 0;
          translateZ = 0;
          rotateY = 0;
          card.classList.add('active-center');
        } else {
          card.classList.remove('active-center');
          scale = Math.max(0.64, 1 - 0.12 * o);
          opacity = Math.max(0.35, 1 - 0.18 * o);
          translateX = (l > 0 ? 1 : -1) * (transXStep + (o - 1) * (isMobile ? 65 : 85));
          translateZ = -(transZStep + (o - 1) * (isMobile ? 70 : 80));
          rotateY = (l > 0 ? -1 : 1) * (rotateStep + (o - 1) * 10);
        }

        card.style.transform = `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
        card.style.opacity = opacity;
        card.style.zIndex = zIndex;
      }
    });

    if (counter) {
      counter.textContent = `${carouselActiveIdx + 1} / ${count}`;
    }
  }

  function nextSlide() {
    carouselActiveIdx = (carouselActiveIdx + 1) % count;
    render3DCarousel();
  }

  function prevSlide() {
    carouselActiveIdx = (carouselActiveIdx - 1 + count) % count;
    render3DCarousel();
  }

  function resetCarouselAutoTimer() {
    if (carouselAutoTimer) clearInterval(carouselAutoTimer);
    if (!carouselIsHovered) {
      carouselAutoTimer = setInterval(nextSlide, 3500);
    }
  }

  if (nextBtn) {
    nextBtn.onclick = (e) => {
      e.stopPropagation();
      nextSlide();
      resetCarouselAutoTimer();
    };
  }

  if (prevBtn) {
    prevBtn.onclick = (e) => {
      e.stopPropagation();
      prevSlide();
      resetCarouselAutoTimer();
    };
  }

  // Hover pause
  if (stage) {
    stage.addEventListener('mouseenter', () => {
      carouselIsHovered = true;
      if (carouselAutoTimer) clearInterval(carouselAutoTimer);
    });
    stage.addEventListener('mouseleave', () => {
      carouselIsHovered = false;
      resetCarouselAutoTimer();
    });

    // Touch Swipe Support
    let touchStartX = 0;
    let touchStartY = 0;
    stage.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      if (carouselAutoTimer) clearInterval(carouselAutoTimer);
    }, { passive: true });

    stage.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
      resetCarouselAutoTimer();
    }, { passive: true });
  }

  window.addEventListener('resize', () => {
    render3DCarousel();
  });

  // Initial render & timer
  render3DCarousel();
  resetCarouselAutoTimer();
}

// 8. LIGHTBOX VIEW WITH SMOOTH NAVIGATION
window.openLightbox = function(idx) {
  if (!currentGalleryList || currentGalleryList.length === 0) return;
  currentLightboxIdx = (idx + currentGalleryList.length) % currentGalleryList.length;

  const modal = document.getElementById('lightbox-modal');
  const imgEl = document.getElementById('lightbox-img');
  if (modal && imgEl) {
    imgEl.src = currentGalleryList[currentLightboxIdx].src;
    imgEl.alt = currentGalleryList[currentLightboxIdx].caption || 'Ảnh cưới';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.openLightboxImage = function(src) {
  const foundIdx = currentGalleryList.findIndex(item => item.src === src);
  if (foundIdx !== -1) {
    openLightbox(foundIdx);
  } else {
    const modal = document.getElementById('lightbox-modal');
    const imgEl = document.getElementById('lightbox-img');
    if (modal && imgEl) {
      imgEl.src = src;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }
};

window.prevLightbox = function(e) {
  if (e) e.stopPropagation();
  openLightbox(currentLightboxIdx - 1);
};

window.nextLightbox = function(e) {
  if (e) e.stopPropagation();
  openLightbox(currentLightboxIdx + 1);
};

window.closeLightbox = function(e) {
  if (e && e.target && e.target.closest('#lightbox-img, .lightbox-nav')) {
    return;
  }
  const modal = document.getElementById('lightbox-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

// Keyboard listener for Lightbox navigation
document.addEventListener('keydown', (e) => {
  const modal = document.getElementById('lightbox-modal');
  if (!modal || !modal.classList.contains('active')) return;

  if (e.key === 'Escape') {
    closeLightbox();
  } else if (e.key === 'ArrowLeft') {
    prevLightbox();
  } else if (e.key === 'ArrowRight') {
    nextLightbox();
  }
});

// Bật / Tắt mã QR Mừng Cưới (Accordion Toggle)
window.toggleQrBox = function() {
  const container = document.getElementById('collapsible-qr-container');
  const btn = document.getElementById('btn-toggle-qr');
  const text = document.getElementById('toggle-qr-text');
  if (!container || !btn) return;

  const isCollapsed = container.classList.contains('collapsed');
  if (isCollapsed) {
    container.classList.remove('collapsed');
    btn.classList.add('active');
    if (text) text.textContent = 'Thu gọn / Ẩn mã QR';
  } else {
    container.classList.add('collapsed');
    btn.classList.remove('active');
    if (text) text.textContent = 'Mở mã QR Mừng Cưới';
  }
};

window.toggleQuickWishes = function() {
  const popover = document.getElementById('quick-wishes-popover');
  if (!popover) return;
  if (popover.style.display === 'none' || !popover.style.display) {
    popover.style.display = 'block';
  } else {
    popover.style.display = 'none';
  }
};

window.fillQuickWish = function(text) {
  const wishTextarea = document.getElementById('rsvp-wish');
  if (wishTextarea) {
    wishTextarea.value = text;
    wishTextarea.focus();
    showToast(`Đã chọn lời chúc: "${text}"`);
    const popover = document.getElementById('quick-wishes-popover');
    if (popover) popover.style.display = 'none';
  }
};

// 9. VietQR Tab Switcher & Copy STK
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

window.copyGroomStk = function() {
  const settings = WeddingDB.getSettings();
  const stk = settings.banking?.groom?.accountNumber || '0988889999';
  window.copyStk(stk);
};

window.copyBrideStk = function() {
  const settings = WeddingDB.getSettings();
  const stk = settings.banking?.bride?.accountNumber || '9988776655';
  window.copyStk(stk);
};

// 10. Add to Google Calendar
window.addToGoogleCalendar = function(title, date, time, location) {
  const startDateTime = `${(date || '2026-11-29').replace(/-/g, '')}T${(time || '11:00').replace(/:/g, '')}00`;
  const endDateTime = `${(date || '2026-11-29').replace(/-/g, '')}T140000`;
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDateTime}/${endDateTime}&details=${encodeURIComponent(title)}&location=${encodeURIComponent(location)}`;
  window.open(url, '_blank');
};

window.addActiveWeddingToCalendar = function() {
  const settings = WeddingDB.getSettings();
  const title = `Lễ Thành Hôn ${settings.couple.groom.fullName || 'Hồ Đức Anh'} & ${settings.couple.bride.fullName || 'Thái Thuỳ Linh'}`;
  const date = settings.wedding.date || '2026-11-29';
  const time = settings.wedding.time || '11:00';
  const location = `${settings.wedding.venueName || ''} - ${settings.wedding.venueAddress || ''}`.trim();
  window.addToGoogleCalendar(title, date, time, location);
};

// 11. Wishes Book Renderer
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function initWishesList() {
  const container = document.getElementById('wishes-display-box') || document.getElementById('wishes-list-container');
  if (!container) return;

  const wishes = WeddingDB.getWishes();
  container.innerHTML = '';

  wishes.forEach(w => {
    const card = document.createElement('div');
    card.className = 'wish-item-card';
    card.innerHTML = `
      <div class="wish-item-header">
        <strong class="wish-item-name">${escapeHtml(w.name || 'Khách quý')}</strong>
        <span class="wish-item-time">${escapeHtml(w.timestamp || '')}</span>
      </div>
      <p class="wish-item-text">${escapeHtml(w.message || '')}</p>
    `;
    container.appendChild(card);
  });
}

// 12. RSVP Form Submission
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

    if (wishInput) wishInput.value = '';
  });
}

// 13. Confetti Animation
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

// 12. Real-time synchronization when admin saves in another tab or same window
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEYS.SETTINGS) {
    const updated = WeddingDB.getSettings();
    initDynamicContent(updated);
  }
});

window.addEventListener('wedding_settings_updated', (e) => {
  initDynamicContent(e.detail || WeddingDB.getSettings());
});
