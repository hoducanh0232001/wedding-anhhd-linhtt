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
  console.log(`\n💌 Link thiệp cá nhân hoá cho khách mời demo (Personalized):`);
  console.log(`   http://localhost:${PORT}/?to=Nguy%E1%BB%85n+V%C4%83n+Nam&prefix=Anh`);
  console.log(`   http://localhost:${PORT}/?to=L%C3%AA+Thu%E1%BB%B3+Dung&prefix=B%E1%BA%A1n`);
  console.log(`   http://localhost:${PORT}/?to=Gia+%C4%91%C3%ACnh+B%C3%A1c+Th%C3%A0nh&prefix=Gia+%C4%91%C3%ACnh`);
  console.log(`\n⚙️ Trang Quản Lý Tùy Chỉnh (Admin Dashboard):`);
  console.log(`   http://localhost:${PORT}/admin.html (hoặc http://localhost:${PORT}/admin)`);
  console.log(`   Mã PIN đăng nhập mặc định: 123456`);
  console.log('======================================================\n');
});
