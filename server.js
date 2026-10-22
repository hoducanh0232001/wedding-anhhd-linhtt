const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const rootDir = process.cwd();

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
