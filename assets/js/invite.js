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
  initScrollReveal();
  initAutoScrollControls();
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
  document.body.setAttribute('data-theme', WeddingDB.getThemeId());

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
  if (heroPolaroid) {
    heroPolaroid.src = (settings.wedding && settings.wedding.heroPhoto) || 
      (settings.gallery && settings.gallery[0] ? settings.gallery[0].src : 'assets/images/hero_couple.jpg');
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

// 3. Natural Botanical Petals & Champagne Gold Dust in Envelope Screen
function initAmbientPetals() {
  const container = document.getElementById('petals-container');
  if (!container) return;

  container.innerHTML = '';

  const petalTypes = ['rose-crimson', 'rose-blush', 'sakura-pink', 'ivory-jasmine'];
  const totalPetals = 24;
  const totalDust = 16;

  // 1. Organic botanical petals (natural 3D fluttering, replacing generic AI star emojis)
  for (let i = 0; i < totalPetals; i++) {
    const el = document.createElement('div');
    const pType = petalTypes[Math.floor(Math.random() * petalTypes.length)];
    el.className = `organic-petal ${pType}`;
    el.style.left = (Math.random() * 95) + '%';

    const scale = (Math.random() * 0.5 + 0.75).toFixed(2);
    el.style.width = Math.round(15 * scale) + 'px';
    el.style.height = Math.round(19 * scale) + 'px';

    const sway = Math.round(Math.random() * 80 - 40);
    el.style.setProperty('--sway', sway + 'px');

    const duration = (Math.random() * 6 + 9).toFixed(1);
    el.style.animationDuration = duration + 's';
    el.style.animationDelay = (-(Math.random() * 15)).toFixed(1) + 's';

    container.appendChild(el);
  }

  // 2. Soft glowing champagne golden dust (natural ambient lighting)
  for (let i = 0; i < totalDust; i++) {
    const dust = document.createElement('div');
    dust.className = 'organic-gold-dust';
    dust.style.left = (Math.random() * 95) + '%';

    const size = Math.round(Math.random() * 4 + 3);
    dust.style.width = size + 'px';
    dust.style.height = size + 'px';

    const sway = Math.round(Math.random() * 50 - 25);
    dust.style.setProperty('--sway', sway + 'px');

    const duration = (Math.random() * 7 + 10).toFixed(1);
    dust.style.animationDuration = duration + 's';
    dust.style.animationDelay = (-(Math.random() * 16)).toFixed(1) + 's';

    container.appendChild(dust);
  }
}

// 4. Envelope Opening & Audio Autoplay & Grand Wedding Fireworks
function initEnvelopeOpener() {
  const envelopeScreen = document.getElementById('envelope-screen');
  const btnOpen = document.getElementById('btn-open-envelope');
  const waxSeal = document.getElementById('wax-seal-btn');

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('open') === '1') {
    if (envelopeScreen) envelopeScreen.classList.add('opened');
    setTimeout(() => {
      document.querySelectorAll('.hero-quote-tender, .envelope-hero-box, .couple-names-block').forEach(el => el.classList.add('revealed'));
      startAutoScroll();
    }, 1800);
    return;
  }

  let isOpening = false;

  function handleOpenEnvelope(e) {
    if (isOpening) return;
    isOpening = true;

    // 1. Play music immediately within user click gesture
    playBackgroundMusic();

    // 2. Burst flowers and hearts ONLY on the outside envelope screen (Zero lag GPU animation)
    triggerEnvelopeFlowerBurst(e);

    // 3. Smoothly open envelope after brief bloom (420ms), transitioning to clean wedding card
    setTimeout(() => {
      if (envelopeScreen) envelopeScreen.classList.add('opened');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Reveal top viewport elements
      setTimeout(() => {
        document.querySelectorAll('.hero-quote-tender, .envelope-hero-box, .couple-names-block').forEach(el => el.classList.add('revealed'));
      }, 150);

      // 4. Auto-scroll starts smoothly after guest admires the hero header (2s)
      setTimeout(() => {
        startAutoScroll();
      }, 2000);
    }, 420);
  }

  if (btnOpen) btnOpen.addEventListener('click', handleOpenEnvelope);
  if (waxSeal) waxSeal.addEventListener('click', handleOpenEnvelope);
}

// 5. Audio Player (Supports both Direct MP3/Audio and YouTube Video)
let audioObj = null;
let ytPlayer = null;
let ytPlayerReady = false;
let isYouTubeAudio = false;
let isAudioPlaying = false;
let pendingPlay = false;

function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/)|music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function initMusicPlayer(settings) {
  const toggleBtn = document.getElementById('music-toggle-btn');
  if (!toggleBtn) return;

  const musicUrl = settings && settings.wedding && settings.wedding.musicUrl ? settings.wedding.musicUrl.trim() : '';
  const ytVideoId = extractYouTubeId(musicUrl);

  if (ytVideoId) {
    isYouTubeAudio = true;
    setupYouTubePlayer(ytVideoId);
  } else {
    isYouTubeAudio = false;
    const audioSrc = musicUrl || 'https://assets.mixkit.co/music/preview/mixkit-wedding-waltz-piano-581.mp3';
    audioObj = new Audio(audioSrc);
    audioObj.loop = true;
    audioObj.preload = 'auto';
  }

  toggleBtn.addEventListener('click', () => {
    if (isAudioPlaying) {
      pauseBackgroundMusic();
    } else {
      playBackgroundMusic();
    }
  });

  // Resume on user interaction if initial autoplay was waiting for interaction
  const resumeOnGesture = () => {
    if (pendingPlay && !isAudioPlaying) {
      playBackgroundMusic();
    }
  };
  document.addEventListener('click', resumeOnGesture, { passive: true });
  document.addEventListener('touchstart', resumeOnGesture, { passive: true });
}

function setupYouTubePlayer(videoId) {
  let ytContainer = document.getElementById('youtube-audio-player');
  if (!ytContainer) {
    ytContainer = document.createElement('div');
    ytContainer.id = 'youtube-audio-player';
    ytContainer.style.cssText = 'position:fixed;bottom:-200px;right:-200px;width:10px;height:10px;opacity:0.001;pointer-events:none;z-index:-9999;';
    document.body.appendChild(ytContainer);
  }

  function createPlayer() {
    try {
      const playerVars = {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        loop: 1,
        playlist: videoId
      };
      if (window.location.protocol.startsWith('http')) {
        playerVars.origin = window.location.origin;
      }

      ytPlayer = new YT.Player('youtube-audio-player', {
        height: '1',
        width: '1',
        videoId: videoId,
        playerVars: playerVars,
        events: {
          onReady: function(e) {
            ytPlayerReady = true;
            try {
              if (ytPlayer && ytPlayer.unMute) ytPlayer.unMute();
              if (ytPlayer && ytPlayer.setVolume) ytPlayer.setVolume(100);
            } catch (err) {}
            if (pendingPlay) {
              playBackgroundMusic();
            }
          },
          onStateChange: function(event) {
            const toggleBtn = document.getElementById('music-toggle-btn');
            if (event.data === YT.PlayerState.PLAYING) {
              isAudioPlaying = true;
              pendingPlay = false;
              if (toggleBtn) {
                toggleBtn.classList.add('playing');
                toggleBtn.title = 'Tạm dừng nhạc';
              }
            } else if (event.data === YT.PlayerState.PAUSED) {
              isAudioPlaying = false;
              if (toggleBtn) {
                toggleBtn.classList.remove('playing');
                toggleBtn.title = 'Phát nhạc cưới';
              }
            } else if (event.data === YT.PlayerState.ENDED) {
              if (ytPlayer && typeof ytPlayer.seekTo === 'function') {
                ytPlayer.seekTo(0);
                ytPlayer.playVideo();
              }
            }
          },
          onError: function(e) {
            console.warn('YouTube audio playback error code:', e.data);
            startWebAudioHarpFallback();
          }
        }
      });
    } catch (err) {
      console.warn('Cannot init YT Player:', err);
      startWebAudioHarpFallback();
    }
  }

  if (window.YT && window.YT.Player) {
    createPlayer();
  } else {
    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function() {
      if (typeof prevReady === 'function') prevReady();
      createPlayer();
    };

    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }
  }
}

function playBackgroundMusic() {
  const toggleBtn = document.getElementById('music-toggle-btn');

  if (isYouTubeAudio) {
    if (ytPlayer && ytPlayerReady && typeof ytPlayer.playVideo === 'function') {
      try {
        ytPlayer.unMute();
        ytPlayer.playVideo();
        isAudioPlaying = true;
        pendingPlay = false;
        if (toggleBtn) {
          toggleBtn.classList.add('playing');
          toggleBtn.title = 'Tạm dừng nhạc';
        }
      } catch (err) {
        console.warn('YouTube play failed:', err);
        startWebAudioHarpFallback();
      }
    } else {
      pendingPlay = true;
    }
    return;
  }

  if (!audioObj) return;

  audioObj.play().then(() => {
    isAudioPlaying = true;
    pendingPlay = false;
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
  pendingPlay = false;

  if (isYouTubeAudio) {
    if (ytPlayer && ytPlayerReady && typeof ytPlayer.pauseVideo === 'function') {
      try {
        ytPlayer.pauseVideo();
      } catch (err) {
        console.warn('YouTube pause error:', err);
      }
    }
    isAudioPlaying = false;
    if (toggleBtn) {
      toggleBtn.classList.remove('playing');
      toggleBtn.title = 'Phát nhạc cưới';
    }
    stopWebAudioHarpFallback();
    return;
  }

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

    showToast('Xác nhận tham dự thành công! Cảm ơn bạn rất nhiều ❤');

    if (wishInput) wishInput.value = '';
  });
}

// 13. Floral & Heart Burst ON OUTSIDE SCREEN ONLY (Zero-lag GPU CSS Particles)
function triggerEnvelopeFlowerBurst(e) {
  const container = document.getElementById('envelope-burst-container');
  if (!container) return;

  container.innerHTML = '';

  let originX = window.innerWidth / 2;
  let originY = window.innerHeight * 0.58;

  if (e && e.clientX && e.clientY) {
    originX = e.clientX;
    originY = e.clientY;
  } else {
    const btn = document.getElementById('btn-open-envelope');
    if (btn) {
      const rect = btn.getBoundingClientRect();
      originX = rect.left + rect.width / 2;
      originY = rect.top + rect.height / 2;
    }
  }

  const stickers = ['🌸', '🌹', '🌺', '🌷', '💐', '❤️', '💖', '💕', '💗', '💝', '✨'];
  const particleCount = 26;

  for (let i = 0; i < particleCount; i++) {
    const item = document.createElement('div');
    item.className = 'envelope-burst-item';
    item.textContent = stickers[Math.floor(Math.random() * stickers.length)];

    item.style.left = `${originX}px`;
    item.style.top = `${originY}px`;

    const angle = (i / particleCount) * 2 * Math.PI + (Math.random() * 0.35 - 0.17);
    const distance = Math.random() * 180 + 120;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance - 35;
    const rot = Math.round(Math.random() * 120 - 60) + 'deg';
    const scale = (Math.random() * 0.5 + 1.15).toFixed(2);
    const size = Math.round(Math.random() * 8 + 24) + 'px';

    item.style.fontSize = size;
    item.style.setProperty('--dx', `${Math.round(dx)}px`);
    item.style.setProperty('--dy', `${Math.round(dy)}px`);
    item.style.setProperty('--rot', rot);
    item.style.setProperty('--scale', scale);

    container.appendChild(item);
  }
}

function fireConfetti() {
  // Silent fallback
}

// 14. Grand Wedding Fireworks Celebration (Pháo Hoa Mừng Ngày Chung Đôi)
function launchWeddingFireworks() {
  let canvas = document.getElementById('wedding-fireworks-canvas');
  if (canvas) canvas.remove();

  canvas = document.createElement('canvas');
  canvas.id = 'wedding-fireworks-canvas';
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99998';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const onResize = () => {
    if (canvas && canvas.parentNode) {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
  };
  window.addEventListener('resize', onResize);

  // Romantic wedding firework palettes
  const goldPalette = ['#ffd700', '#ffea75', '#ffffff', '#f5d061', '#fff8e7', '#f39c12'];
  const rosePalette = ['#ff6b81', '#f472b6', '#fbcfe8', '#ff4757', '#ffffff', '#e84393'];
  const royalPalette = ['#e63946', '#ff7675', '#ffd700', '#fbc531', '#ffffff'];
  const champagnePalette = ['#f7d794', '#f5cd79', '#ffffff', '#eccc68', '#ff6b6b'];

  const rockets = [];
  const sparks = [];

  class Rocket {
    constructor(startX, startY, targetX, targetY, colors, isHeart = false) {
      this.x = startX;
      this.y = startY;
      this.targetX = targetX;
      this.targetY = targetY;
      this.colors = colors;
      this.isHeart = isHeart;
      this.speed = Math.random() * 2 + 11;
      this.angle = Math.atan2(targetY - startY, targetX - startX);
      this.coordinates = [];
      this.coordinateCount = 4;
      while (this.coordinateCount--) {
        this.coordinates.push([this.x, this.y]);
      }
    }

    update(index) {
      this.coordinates.pop();
      this.coordinates.unshift([this.x, this.y]);

      const vx = Math.cos(this.angle) * this.speed;
      const vy = Math.sin(this.angle) * this.speed;

      this.x += vx;
      this.y += vy;

      // Rocket spark trail
      if (Math.random() < 0.65) {
        sparks.push(new Spark(this.x, this.y, (Math.random() - 0.5) * 1.5, Math.random() * 1.5, '#ffd700', 0.85, 0.05, 1.6, false));
      }

      // Check apex arrival
      if (Math.hypot(this.targetX - this.x, this.targetY - this.y) <= this.speed || this.y <= this.targetY) {
        this.explode();
        rockets.splice(index, 1);
      }
    }

    draw() {
      ctx.beginPath();
      ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
      ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2.4;
      ctx.stroke();
    }

    explode() {
      if (this.isHeart) {
        createHeartBurst(this.targetX, this.targetY, this.colors);
      } else {
        createPeonyBurst(this.targetX, this.targetY, this.colors);
      }
    }
  }

  class Spark {
    constructor(x, y, vx, vy, color, alpha = 1, decay = 0.016, size = 2.5, flickers = true) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.color = color;
      this.alpha = alpha;
      this.decay = decay;
      this.size = size;
      this.flickers = flickers;
      this.gravity = 0.085;
      this.friction = 0.972;
      this.coordinates = [];
      this.coordinateCount = 3;
      while (this.coordinateCount--) {
        this.coordinates.push([this.x, this.y]);
      }
    }

    update(index) {
      this.coordinates.pop();
      this.coordinates.unshift([this.x, this.y]);

      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vy += this.gravity;

      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;

      if (this.alpha <= 0) {
        sparks.splice(index, 1);
      }
    }

    draw() {
      ctx.save();
      const drawAlpha = this.flickers && Math.random() < 0.28 ? this.alpha * 0.35 : this.alpha;
      ctx.globalAlpha = Math.max(0, drawAlpha);

      // Sparkling light streak
      ctx.beginPath();
      ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
      ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.size;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Glowing spark head
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.75, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  function createPeonyBurst(cx, cy, colors) {
    const sparkCount = Math.min(85, Math.floor(width / 12) + 50);
    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.PI * 2 / sparkCount) * i + (Math.random() - 0.5) * 0.35;
      const speed = Math.random() * 6.5 + 1.8;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const decay = Math.random() * 0.012 + 0.012;
      const size = Math.random() * 1.8 + 1.8;
      sparks.push(new Spark(cx, cy, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 1, decay, size, true));
    }
  }

  function createHeartBurst(cx, cy, colors) {
    const heartPoints = 72;
    for (let i = 0; i < heartPoints; i++) {
      const t = (Math.PI * 2 / heartPoints) * i;
      // Mathematical Heart Curve
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      const speedScale = 0.28 + (Math.random() - 0.5) * 0.035;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const decay = Math.random() * 0.01 + 0.012;
      sparks.push(new Spark(cx, cy, hx * speedScale, hy * speedScale, color, 1, decay, 2.6, true));
    }
  }

  // Choreographed series of wedding fireworks launches
  const launches = [
    { delay: 60, x: width * 0.50, targetY: height * 0.32, colors: goldPalette, heart: true },
    { delay: 450, x: width * 0.25, targetY: height * 0.28, colors: rosePalette, heart: false },
    { delay: 750, x: width * 0.75, targetY: height * 0.30, colors: champagnePalette, heart: false },
    { delay: 1250, x: width * 0.40, targetY: height * 0.22, colors: royalPalette, heart: true },
    { delay: 1450, x: width * 0.60, targetY: height * 0.24, colors: goldPalette, heart: false },
    { delay: 1950, x: width * 0.20, targetY: height * 0.34, colors: rosePalette, heart: false },
    { delay: 2200, x: width * 0.80, targetY: height * 0.26, colors: champagnePalette, heart: false },
    { delay: 2600, x: width * 0.50, targetY: height * 0.18, colors: goldPalette, heart: true }
  ];

  launches.forEach(launch => {
    setTimeout(() => {
      if (!canvas || !canvas.parentNode) return;
      const startX = launch.x + (Math.random() - 0.5) * 40;
      rockets.push(new Rocket(startX, height + 10, launch.x, launch.targetY, launch.colors, launch.heart));
    }, launch.delay);
  });

  let animId = null;
  const startTime = Date.now();

  function loop() {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    for (let i = rockets.length - 1; i >= 0; i--) {
      rockets[i].draw();
      rockets[i].update(i);
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      sparks[i].draw();
      sparks[i].update(i);
    }

    // Auto cleanup after sequence finishes
    if (Date.now() - startTime > 6500 && rockets.length === 0 && sparks.length === 0) {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      if (canvas && canvas.parentNode) canvas.remove();
      return;
    }

    animId = requestAnimationFrame(loop);
  }

  animId = requestAnimationFrame(loop);
}

// Global hook for user interaction or testing
window.launchWeddingFireworks = launchWeddingFireworks;

// 12. Real-time synchronization when admin saves in another tab or same window
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEYS.SETTINGS) {
    const updated = WeddingDB.getSettings();
    document.body.setAttribute('data-theme', WeddingDB.getThemeId());
    initDynamicContent(updated);
    if (updated.gallery) initGallery(updated.gallery);
  }
});

window.addEventListener('wedding_settings_updated', (e) => {
  const updated = e.detail || WeddingDB.getSettings();
  document.body.setAttribute('data-theme', WeddingDB.getThemeId());
  initDynamicContent(updated);
  if (updated.gallery) initGallery(updated.gallery);
});

// 15. Scroll-triggered Text & Section Reveal (IntersectionObserver)
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) return;

  const revealSelectors = [
    // Header elements
    '.hero-quote-tender',
    '.envelope-hero-box',
    '.couple-names-block',

    // Main Ceremony Card elements
    '#section-ceremony .card-title-gold',
    '#section-ceremony .family-grid',
    '#section-ceremony .announcement-text',
    '#section-ceremony .couple-ceremony-names',
    '#section-ceremony .ceremony-date-block',
    '#section-ceremony .ceremony-lunar-date',

    // Gallery section
    '#section-gallery .section-title-tender',
    '#section-gallery .carousel-3d-stage',

    // Reception card
    '.reception-card-section .card-title-gold',
    '.reception-card-section .reception-time-str',
    '.reception-card-section #reception-guest-time-display',
    '.reception-card-section .mini-calendar-wrapper',
    '.reception-card-section .countdown-container',
    '.reception-card-section .btn-rsvp-pill',

    // Map section
    '.map-section-tender .section-title-tender',
    '.map-section-tender .venue-box',
    '.map-section-tender .map-card-tender',
    '.map-section-tender .btn-map-gold',

    // Timeline section
    '.timeline-section-tender .card-title-gold',
    '.timeline-section-tender .timeline-icon-row',

    // RSVP & Guestbook
    '.papernote-card-title',
    '.papernote-card-subtitle',
    '#wedding-rsvp-form',
    '.wishes-feed-wrapper',

    // Gift section
    '.gift-section-tender .section-title-tender',
    '.gift-section-tender .section-subtitle-tender',
    '#btn-toggle-qr',
    '#collapsible-qr-container',

    // Footer
    '.thank-you-note',
    '#footer-couple-names',
    '#footer-wedding-date'
  ];

  const elements = document.querySelectorAll(revealSelectors.join(', '));
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  // Stagger delays for cascading elements within containers
  document.querySelectorAll('.timeline-icon-row').forEach((row, idx) => {
    row.style.transitionDelay = `${(idx * 0.12).toFixed(2)}s`;
  });

  elements.forEach(el => {
    el.classList.add('scroll-reveal');
    observer.observe(el);
  });
}

// 16. Cinematic Auto-Scroll Experience
let isAutoScrolling = false;
let autoScrollAnimId = null;
let userIsInteracting = false;
let userPauseTimeout = null;

function startAutoScroll() {
  if (isAutoScrolling) return;
  isAutoScrolling = true;

  const toggleBtn = document.getElementById('autoscroll-toggle-btn');
  if (toggleBtn) {
    toggleBtn.classList.add('active');
    toggleBtn.title = 'Tạm dừng tự cuộn trang';
  }

  function scrollStep() {
    if (!isAutoScrolling) return;

    if (!userIsInteracting) {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY >= maxScroll - 6) {
        stopAutoScroll();
        return;
      }
      // Gentle reading cruise speed (~55px/s)
      window.scrollBy(0, 0.95);
    }

    autoScrollAnimId = requestAnimationFrame(scrollStep);
  }

  autoScrollAnimId = requestAnimationFrame(scrollStep);
}

function stopAutoScroll() {
  isAutoScrolling = false;
  if (autoScrollAnimId) {
    cancelAnimationFrame(autoScrollAnimId);
    autoScrollAnimId = null;
  }
  const toggleBtn = document.getElementById('autoscroll-toggle-btn');
  if (toggleBtn) {
    toggleBtn.classList.remove('active');
    toggleBtn.title = 'Bật tự động cuộn thiệp';
  }
}

function toggleAutoScroll() {
  if (isAutoScrolling) {
    stopAutoScroll();
    showToast('Đã dừng tự cuộn');
  } else {
    startAutoScroll();
    showToast('Bắt đầu tự cuộn thiệp cưới...');
  }
}

function initAutoScrollControls() {
  const toggleBtn = document.getElementById('autoscroll-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleAutoScroll();
    });
  }

  // Gracefully pause while guest is touching or scrolling manually
  function pauseOnUserTouch() {
    if (!isAutoScrolling) return;
    userIsInteracting = true;
    clearTimeout(userPauseTimeout);
    // Automatically resumes 3.5s after guest stops touching
    userPauseTimeout = setTimeout(() => {
      userIsInteracting = false;
    }, 3500);
  }

  ['touchstart', 'touchmove', 'wheel', 'mousedown'].forEach(evt => {
    window.addEventListener(evt, pauseOnUserTouch, { passive: true });
  });
}
