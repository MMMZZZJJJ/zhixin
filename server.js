const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

function loadEnvFile(envPath) {
    if (!fs.existsSync(envPath)) {
        return;
    }

    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) {
            continue;
        }
        const separatorIndex = line.indexOf('=');
        if (separatorIndex <= 0) {
            continue;
        }
        const key = line.slice(0, separatorIndex).trim();
        const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
        if (!(key in process.env)) {
            process.env[key] = value;
        }
    }
}

loadEnvFile(path.join(__dirname, '.env'));

const PORT = Number(process.env.PORT || 8080);
const ROOT_DIR = path.join(__dirname, 'frontend');
const DJANGO_API_BASE_URL = String(process.env.DJANGO_API_BASE_URL || 'http://127.0.0.1:8000/api').trim();
const PASSWORD_MIN_LENGTH = Number(process.env.PASSWORD_MIN_LENGTH || 10);

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function send(res, status, body, contentType = 'text/plain; charset=utf-8') {
    res.writeHead(status, {
        'Content-Type': contentType,
        'Cache-Control': 'no-store'
    });
    res.end(body);
}

function getStaticCacheControl(ext) {
    if (ext === '.html') {
        return 'no-store';
    }
    if (ext === '.js' || ext === '.css') {
        return 'public, max-age=3600';
    }
    if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'].includes(ext)) {
        return 'public, max-age=86400';
    }
    return 'no-store';
}

function getSafeFilePath(urlPath) {
    const cleanPath = decodeURIComponent(urlPath.split('?')[0]);
    const resolvedPath = path.resolve(ROOT_DIR, `.${cleanPath}`);
    if (!resolvedPath.startsWith(ROOT_DIR)) {
        return null;
    }
    return resolvedPath;
}

function serveStatic(req, res, parsedUrl) {
    if (parsedUrl.pathname === '/') {
        res.writeHead(302, {
            Location: '/login/login.html',
            'Cache-Control': 'no-store'
        });
        res.end();
        return;
    }

    let filePath = getSafeFilePath(parsedUrl.pathname);
    if (!filePath) {
        send(res, 403, 'Forbidden');
        return;
    }

    fs.stat(filePath, (err, stat) => {
        if (err) {
            send(res, 404, 'Not Found');
            return;
        }

        if (stat.isDirectory()) {
            filePath = path.join(filePath, 'index.html');
        }

        fs.readFile(filePath, (readErr, data) => {
            if (readErr) {
                send(res, 404, 'Not Found');
                return;
            }
            const ext = path.extname(filePath).toLowerCase();
            const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
            res.writeHead(200, {
                'Content-Type': mimeType,
                'Cache-Control': getStaticCacheControl(ext)
            });
            res.end(data);
        });
    });
}

function serveRuntimeConfig(res) {
    const payload = `window.RUNTIME_CONFIG = ${JSON.stringify({
        apiBaseUrl: DJANGO_API_BASE_URL,
        passwordMinLength: PASSWORD_MIN_LENGTH
    })};\n`;
    send(res, 200, payload, 'application/javascript; charset=utf-8');
}

const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    if (parsedUrl.pathname === '/runtime-config.js') {
        serveRuntimeConfig(res);
        return;
    }
    if (parsedUrl.pathname.startsWith('/api/')) {
        send(res, 404, `API requests should be sent to Django at ${DJANGO_API_BASE_URL}`);
        return;
    }
    serveStatic(req, res, parsedUrl);
});

server.listen(PORT, () => {
    process.stdout.write(`Server running on http://localhost:${PORT}\n`);
});
