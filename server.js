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

// 2. Serve any root files (admin.html, index.html)
app.use(express.static(rootDir, {
  maxAge: '1h',
  etag: true
}));

// 3. Admin portal route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(rootDir, 'admin.html'));
});

// 4. Main invitation route
app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
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

// 5. Fallback: only return index.html for page routes, NOT for broken asset files
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
