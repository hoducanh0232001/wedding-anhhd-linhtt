const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const rootDir = process.cwd();

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// 1. Explicitly serve /assets from process.cwd()
app.use('/assets', express.static(path.join(rootDir, 'assets'), {
  maxAge: '1h',
  etag: true
}));

// 2. Admin portal route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(rootDir, 'admin.html'));
});

// Realtime Firebase DB + Local Cache for dynamic OpenGraph tags
const FIREBASE_SETTINGS_URL = 'https://wedding-anh-linh-default-rtdb.asia-southeast1.firebasedatabase.app/settings.json';
let cachedSettings = null;
let lastSettingsFetchTime = 0;
const CACHE_TTL_MS = 10000; // 10 seconds cache to instantly reflect admin changes

async function getWeddingSettings() {
  const now = Date.now();
  if (cachedSettings && (now - lastSettingsFetchTime < CACHE_TTL_MS)) {
    return cachedSettings;
  }

  // 1. Fetch live settings directly from Firebase Realtime Database
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const fbRes = await fetch(FIREBASE_SETTINGS_URL, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (fbRes.ok) {
      const fbData = await fbRes.json();
      if (fbData && typeof fbData === 'object' && (fbData.events || fbData.wedding)) {
        cachedSettings = fbData;
        lastSettingsFetchTime = now;
        return fbData;
      }
    }
  } catch (err) {
    // Firebase fetch error or timeout, gracefully fallback to local file
  }

  // 2. Fallback to local data.js
  try {
    let dataJsPath = path.join(__dirname, 'assets', 'js', 'data.js');
    if (!fs.existsSync(dataJsPath)) {
      dataJsPath = path.join(rootDir, 'assets', 'js', 'data.js');
    }
    if (fs.existsSync(dataJsPath)) {
      const content = fs.readFileSync(dataJsPath, 'utf8');
      const sMarker = 'const DEFAULT_SETTINGS =';
      const sIdx = content.indexOf(sMarker);
      if (sIdx !== -1) {
        const jsonStart = content.indexOf('{', sIdx);
        const eMarker = 'const DEFAULT_GUESTS';
        const eIdx = content.indexOf(eMarker, jsonStart);
        if (jsonStart !== -1 && eIdx !== -1) {
          let jsonStr = content.substring(jsonStart, eIdx).trim();
          if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1).trim();
          cachedSettings = JSON.parse(jsonStr);
          lastSettingsFetchTime = now;
          return cachedSettings;
        }
      }
    }
  } catch (err) {
    console.error('Error reading settings from data.js:', err.message);
  }
  return cachedSettings || null;
}

// 3. Main invitation route with dynamic Open Graph injection for social crawlers (Facebook, Zalo, iMessage)
app.get('/', async (req, res) => {
  const indexPath = path.join(rootDir, 'index.html');
  const guestParam = (req.query.to || req.query.guest || req.query.name || '').trim();
  const prefixParam = (req.query.prefix || req.query.xungho || '').trim();
  const sideParam = (req.query.side || req.query.tiec || req.query.event || '').toLowerCase().trim();
  const isBride = ['bride', 'gai', 'nhagai', 'vuquy', 'nha-gai'].includes(sideParam);
  const isGroom = ['groom', 'trai', 'nhatrai', 'tanhon', 'nha-trai'].includes(sideParam);

  try {
    let html = fs.readFileSync(indexPath, 'utf8');

    const settings = await getWeddingSettings();
    const groomName = settings?.couple?.groom?.shortName || settings?.couple?.groom?.fullName || 'Đức Anh';
    const brideName = settings?.couple?.bride?.shortName || settings?.couple?.bride?.fullName || 'Thuỳ Linh';

    let event = null;
    let ceremonyName = 'Lễ Thành Hôn';
    let coupleTitle = `${groomName} & ${brideName}`;

    if (isBride) {
      event = settings?.events?.find(e => e.type === 'bride');
      ceremonyName = (event?.title && event.title.includes('Vu Quy')) ? 'Lễ Vu Quy' : (event?.title || 'Lễ Vu Quy');
      coupleTitle = `${brideName} & ${groomName}`;
    } else if (isGroom) {
      event = settings?.events?.find(e => e.type === 'groom');
      ceremonyName = (event?.title && event.title.includes('Tân Hôn')) ? 'Lễ Tân Hôn' : (event?.title || 'Lễ Tân Hôn');
      coupleTitle = `${groomName} & ${brideName}`;
    } else {
      event = settings?.events?.find(e => e.type === 'main' || e.isPrimary) || settings?.events?.[0];
      ceremonyName = (event?.title && event.title.includes('Thành Hôn')) ? 'Lễ Thành Hôn' : (event?.title || 'Lễ Thành Hôn');
      coupleTitle = `${groomName} & ${brideName}`;
    }

    // Thời gian, ngày tháng & địa điểm lấy 100% từ config (event / wedding settings)
    const timeVal = event?.time || settings?.wedding?.time || '';
    const dateTextVal = event?.dateText || settings?.wedding?.dateText || '';
    const dateVal = event?.date || settings?.wedding?.date || '';

    const eventTime = timeVal ? `vào ${timeVal}` : '';
    const eventDate = dateTextVal ? `${dateTextVal}` : (dateVal ? `ngày ${dateVal}` : '');
    const timeAndDate = [eventTime, eventDate].filter(Boolean).join(' ');

    const venue = event?.venue || event?.venueName || settings?.wedding?.venueName || '';
    const address = event?.address || event?.venueAddress || settings?.wedding?.venueAddress || '';
    let locationStr = '';
    if (venue && address) {
      locationStr = `tại ${venue} (${address})`;
    } else if (venue || address) {
      locationStr = `tại ${venue || address}`;
    }

    // Format xưng hô khách mời tự nhiên:
    // Nếu có tên khách: "Trân trọng kính mời Anh Minh..."
    // Nếu không có tên khách: "Trân trọng kính mời Quý Khách..." (không bị lặp "Thân Mời Quý Khách")
    let guestDisplay = 'Quý Khách';
    if (guestParam) {
      const cleanName = guestParam.replace(/\+/g, ' ').trim();
      const cleanPrefix = prefixParam ? prefixParam.replace(/\+/g, ' ').trim() : 'Thân Mời';
      guestDisplay = `${cleanPrefix} ${cleanName}`.trim();
    }

    const customTitle = guestParam
      ? `Thiệp Cưới (${ceremonyName}) ${coupleTitle} — Kính Mời: ${guestDisplay}`
      : `${ceremonyName} | ${coupleTitle} — Thiệp Cưới Online`;

    // Xoá bỏ hoàn toàn ngày, giờ, địa điểm trong description theo yêu cầu để tránh sai lệch
    const customDesc = guestParam
      ? `Kính mời: ${guestDisplay}`
      : `Thiệp cưới online — ${coupleTitle}`;

    const fullUrl = `https://wedding-anhhd-linhtt.vercel.app${req.originalUrl}`;

    html = html
      .replace(/<title>.*?<\/title>/, `<title>${customTitle}</title>`)
      .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${customTitle}" />`)
      .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${customDesc}" />`)
      .replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${fullUrl}" />`)
      .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${customDesc}" />`)
      .replace(/<meta itemprop="name" content=".*?" \/>/, `<meta itemprop="name" content="${customTitle}" />`)
      .replace(/<meta itemprop="description" content=".*?" \/>/, `<meta itemprop="description" content="${customDesc}" />`)
      .replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${customTitle}" />`)
      .replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${customDesc}" />`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  } catch (err) {
    return res.sendFile(indexPath);
  }
});

// Endpoint to save settings directly into assets/js/data.js
app.post('/api/save-settings', (req, res) => {
  try {
    const newSettings = req.body;
    if (!newSettings || typeof newSettings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings' });
    }

    const dataJsPath = path.join(rootDir, 'assets', 'js', 'data.js');
    if (fs.existsSync(dataJsPath)) {
      let content = fs.readFileSync(dataJsPath, 'utf8');
      const sMarker = 'const DEFAULT_SETTINGS = {';
      const eMarker = 'const DEFAULT_GUESTS = [';
      const sIdx = content.indexOf(sMarker);
      const eIdx = content.indexOf(eMarker, sIdx);

      if (sIdx !== -1 && eIdx !== -1) {
        const newCode = `const DEFAULT_SETTINGS = ${JSON.stringify(newSettings, null, 2)};\r\n\r\n`;
        content = content.substring(0, sIdx) + newCode + content.substring(eIdx);
        fs.writeFileSync(dataJsPath, content, 'utf8');
        cachedSettings = newSettings;
        lastSettingsMtime = Date.now();
      }
    }

    res.json({ success: true, message: 'Đã lưu và đồng bộ trực tiếp vào file data.js!' });
  } catch (err) {
    console.error('Error saving settings to file:', err);
    res.status(500).json({ error: err.message });
  }
});

// Route to resolve Google Maps short links
app.get('/api/resolve-map', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).json({ error: 'Missing url' });
  try {
    const response = await fetch(targetUrl, { redirect: 'follow' });
    res.json({ finalUrl: response.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Serve any other root static files with index: false so routes take precedence
app.use(express.static(rootDir, {
  index: false,
  maxAge: '1h',
  etag: true
}));

// 6. Fallback: only return index.html for page routes, NOT for broken asset files
app.get('*', (req, res) => {
  if (req.path.includes('.')) {
    return res.status(404).send('Asset not found');
  }
  res.sendFile(path.join(rootDir, 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Wedding Invitation Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
