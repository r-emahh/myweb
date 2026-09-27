param(
    [int]$Port = 8080
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host "Serving $ProjectRoot at http://127.0.0.1:$Port/"

if (Get-Command node -ErrorAction SilentlyContinue) {
    node -e "const http = require('http'); const fs = require('fs'); const path = require('path'); const mimeTypes = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' }; const server = http.createServer((req, res) => { let reqPath = decodeURIComponent(req.url === '/' ? 'index.html' : req.url.split('?')[0]); let p = path.join(process.cwd(), reqPath); fs.readFile(p, (err, data) => { if (err) { if (reqPath === '/favicon.ico') { fs.readFile(path.join(process.cwd(), 'public', 'logo.svg'), (err2, data2) => { if (!err2) { res.writeHead(200, {'Content-Type': 'image/svg+xml'}); res.end(data2); return; } res.writeHead(204); res.end(); }); return; } res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'}); res.end('Not Found'); } else { let ext = path.extname(p); let type = mimeTypes[ext] || 'application/octet-stream'; res.writeHead(200, {'Content-Type': type}); res.end(data); } }); }); server.listen($Port, '127.0.0.1');"
} else {
    python -m http.server $Port --bind 127.0.0.1
}