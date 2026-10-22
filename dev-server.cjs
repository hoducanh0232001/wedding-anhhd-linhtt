const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const BASE_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Route aliases
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  } else if (pathname === '/admin') {
    pathname = '/admin.html';
  }

  // API endpoint to save settings into assets/js/data.js
  if (req.method === 'POST' && pathname === '/api/save-settings') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const newSettings = JSON.parse(body);
        const dataJsPath = path.join(BASE_DIR, 'assets', 'js', 'data.js');
        if (fs.existsSync(dataJsPath)) {
          let content = fs.readFileSync(dataJsPath, 'utf8');
          const sMarker = 'const DEFAULT_SETTINGS = {';
          const eMarker = 'const DEFAULT_GUESTS = [';
          const sIdx = content.indexOf(sMarker);
          const eIdx = content.indexOf(eMarker, sIdx);
          if (sIdx !== -1 && eIdx !== -1) {
            const newCode = "const DEFAULT_SETTINGS = " + JSON.stringify(newSettings, null, 2) + ";\r\n\r\n";
            content = content.substring(0, sIdx) + newCode + content.substring(eIdx);
            fs.writeFileSync(dataJsPath, content, 'utf8');
          }
        }
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, message: 'Đã lưu và đồng bộ trực tiếp vào file data.js!' }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  const filePath = path.join(BASE_DIR, pathname);

  // Security check to avoid path traversal
  if (!filePath.startsWith(BASE_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <div style="font-family:sans-serif;text-align:center;padding:50px;">
          <h2>404 - Trang không tồn tại</h2>
          <p><a href="/index.html">Quay về trang Thiệp cưới</a> | <a href="/admin.html">Trang Quản trị</a></p>
        </div>
      `);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log('\n======================================================');
  console.log('🎉 THIỆP CƯỚI ONLINE - CHUNG ĐÔI "TENDER" TEMPLATE');
  console.log('   Đức Anh & Thuỳ Linh | 29.11.2026');
  console.log('======================================================');
  console.log(`\n👉 Thiệp cưới công khai (Public Invite):`);
  console.log(`   http://localhost:${PORT}/`);
  console.log(`\n⚙️ Trang Quản Lý Tùy Chỉnh (Admin Dashboard):`);
  console.log(`   http://localhost:${PORT}/admin.html (hoặc http://localhost:${PORT}/admin)`);
  console.log(`   Mã PIN đăng nhập mặc định: 123456`);
  console.log('======================================================\n');
});
