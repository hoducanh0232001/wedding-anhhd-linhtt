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

// Cache settings to minimize disk reads
let cachedSettings = null;
let lastSettingsMtime = 0;

function getWeddingSettings() {
  try {
    const dataJsPath = path.join(rootDir, 'assets', 'js', 'data.js');
    if (!fs.existsSync(dataJsPath)) return null;

    const stat = fs.statSync(dataJsPath);
    if (cachedSettings && stat.mtimeMs === lastSettingsMtime) {
      return cachedSettings;
    }

    const content = fs.readFileSync(dataJsPath, 'utf8');
    const sMarker = 'const DEFAULT_SETTINGS =';
    const sIdx = content.indexOf(sMarker);
    if (sIdx === -1) return null;

    const jsonStart = content.indexOf('{', sIdx);
    const eMarker = 'const DEFAULT_GUESTS';
    const eIdx = content.indexOf(eMarker, jsonStart);

    if (jsonStart !== -1 && eIdx !== -1) {
      let jsonStr = content.substring(jsonStart, eIdx).trim();
      if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1).trim();
      cachedSettings = JSON.parse(jsonStr);
      lastSettingsMtime = stat.mtimeMs;
      return cachedSettings;
    }
  } catch (err) {
    console.error('Error reading settings from data.js:', err.message);
  }
  return cachedSettings || null;
}

// 3. Main invitation route with dynamic Open Graph injection for social crawlers (Facebook, Zalo, iMessage)
app.get('/', (req, res) => {
  const indexPath = path.join(rootDir, 'index.html');
  const guestParam = req.query.to || req.query.guest || req.query.name;
  const prefixParam = req.query.prefix || req.query.xungho;
  const sideParam = (req.query.side || req.query.tiec || req.query.event || '').toLowerCase().trim();
  const isBride = ['bride', 'gai', 'nhagai', 'vuquy', 'nha-gai'].includes(sideParam);
  const isGroom = ['groom', 'trai', 'nhatrai', 'tanhon', 'nha-trai'].includes(sideParam);

  if (!guestParam && !prefixParam && !isBride && !isGroom) {
    return res.sendFile(indexPath);
  }

  try {
    let html = fs.readFileSync(indexPath, 'utf8');
    const guestName = (guestParam || 'Quý Khách').replace(/\+/g, ' ').trim();
    const guestPrefix = (prefixParam || 'Thân Mời').replace(/\+/g, ' ').trim();

    const settings = getWeddingSettings();
    const groomName = settings?.couple?.groom?.shortName || 'Đức Anh';
    const brideName = settings?.couple?.bride?.shortName || 'Thuỳ Linh';

    let event = null;
    let ceremonyName = 'Lễ Thành Hôn';
    let coupleTitle = `${groomName} & ${brideName}`;

    if (isBride) {
      event = settings?.events?.find(e => e.type === 'bride');
      ceremonyName = 'Lễ Vu Quy';
      coupleTitle = `${brideName} & ${groomName}`;
    } else if (isGroom) {
      event = settings?.events?.find(e => e.type === 'groom');
      ceremonyName = 'Lễ Tân Hôn';
      coupleTitle = `${groomName} & ${brideName}`;
    } else {
      event = settings?.events?.find(e => e.type === 'main' || e.isPrimary) || settings?.events?.[0];
      ceremonyName = 'Lễ Thành Hôn';
      coupleTitle = `${groomName} & ${brideName}`;
    }

    const eventTime = event?.time ? `vào ${event.time}` : '';
    const eventDate = event?.dateText ? `${event.dateText}` : (event?.date ? `ngày ${event.date}` : '');
    const timeAndDate = [eventTime, eventDate].filter(Boolean).join(' ');

    const venue = event?.venue || '';
    const address = event?.address || '';
    let locationStr = '';
    if (venue && address) {
      locationStr = `tại ${venue} (${address})`;
    } else if (venue || address) {
      locationStr = `tại ${venue || address}`;
    }

    const customTitle = guestParam
      ? `Thiệp Cưới (${ceremonyName}) ${coupleTitle} — Kính Mời: ${guestPrefix} ${guestName}`
      : `${ceremonyName} | ${coupleTitle} — Thiệp Cưới Online`;

    const customDesc = `Trân trọng kính mời ${guestPrefix} ${guestName} đến tham dự ${ceremonyName} của ${coupleTitle}${timeAndDate ? ` ${timeAndDate}` : ''}${locationStr ? ` ${locationStr}` : ''}.`.replace(/\s+/g, ' ').trim();

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
