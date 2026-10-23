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

// 3. Main invitation route with dynamic Open Graph injection for social crawlers (Facebook, Zalo, iMessage)
app.get('/', (req, res) => {
  const indexPath = path.join(rootDir, 'index.html');
  const guestParam = req.query.to || req.query.guest || req.query.name;
  const prefixParam = req.query.prefix || req.query.xungho;

  if (!guestParam && !prefixParam) {
    return res.sendFile(indexPath);
  }

  try {
    let html = fs.readFileSync(indexPath, 'utf8');
    const guestName = (guestParam || 'Quý Khách').replace(/\+/g, ' ').trim();
    const guestPrefix = (prefixParam || 'Thân Mời').replace(/\+/g, ' ').trim();

    const customTitle = `Thiệp Cưới Đức Anh & Thuỳ Linh — Kính Mời: ${guestPrefix} ${guestName}`;
    const customDesc = `Trân trọng kính mời ${guestPrefix} ${guestName} đến tham dự lễ thành hôn của Đức Anh & Thuỳ Linh vào 11:00 Chủ Nhật, ngày 29/11/2026 tại Hoàng Gia Palace Hà Đông, Hà Nội.`;
    const fullUrl = `https://wedding-anhhd-linhtt.vercel.app${req.originalUrl}`;

    html = html
      .replace(/<title>.*?<\/title>/, `<title>${customTitle}</title>`)
      .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${customTitle}" />`)
      .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${customDesc}" />`)
      .replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${fullUrl}" />`)
      .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${customDesc}" />`)
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
