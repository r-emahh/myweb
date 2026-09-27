param(
    [int]$Port = 8080
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host "Serving $ProjectRoot at http://127.0.0.1:$Port/"

if (Get-Command node -ErrorAction SilentlyContinue) {
    node -e "const http = require('http'); const fs = require('fs'); const path = require('path'); const server = http.createServer((req, res) => { let p = path.join(process.cwd(), decodeURIComponent(req.url === '/' ? 'index.html' : req.url.split('?')[0])); fs.readFile(p, (err, data) => { if (err) { res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'}); res.end('Not Found'); } else { let ext = path.extname(p); let type = ext === '.html' ? 'text/html' : (ext === '.js' ? 'text/javascript' : (ext === '.css' ? 'text/css' : 'application/octet-stream')); res.writeHead(200, {'Content-Type': type}); res.end(data); } }); }); server.listen($Port, '127.0.0.1');"
} else {
    python -m http.server $Port --bind 127.0.0.1
}