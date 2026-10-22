const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve all static assets (CSS, JS, Images, Fonts, etc.)
app.use(express.static(__dirname, {
  maxAge: '1h',
  etag: true
}));

// Explicit route for admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Explicit route for invitation
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Fallback for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Wedding Invitation Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
