import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// Polyfill for global.fetch if needed
if (!global.fetch) {
    global.fetch = fetch;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Recursively process include directives in HTML files
function processIncludes(content) {
    const includeRegex = /<!--\s*include:(.*?)\s*-->/g;
    return content.replace(includeRegex, (_, includePath) => {
        const file = path.join(__dirname, 'templates', includePath.trim());
        if (!fs.existsSync(file)) {
            return `<!-- Missing include: ${includePath.trim()} -->`;
        }
        const included = fs.readFileSync(file, 'utf8');
        return processIncludes(included);
    });
}

// Set up CORS headers
const setCorsHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
};

const server = http.createServer(async (req, res) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        setCorsHeaders(res);
        res.writeHead(204);
        res.end();
        return;
    }
    
    // Special handling for uuid library
    if (req.url === '/uuid.min.js') {
        try {
            const response = await fetch('https://cdn.jsdelivr.net/npm/uuid@9.0.0/dist/umd/uuid.min.js');
            const content = await response.text();
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.end(content);
            return;
        } catch (error) {
            console.error('Error fetching uuid library:', error);
            res.writeHead(500);
            res.end('Error loading uuid library');
            return;
        }
    }

    // Set CORS headers for all responses
    setCorsHeaders(res);

    // Handle API routes
    if (req.url.startsWith('/api/')) {
        // Handle API routes here if needed
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
        return;
    }

    // Serve static files
    let filePath = req.url === '/' ? '/index.html' : req.url;
    
    // Remove query parameters
    filePath = filePath.split('?')[0];
    
    // Resolve the file path
    const fullPath = path.join(__dirname, filePath);
    const ext = path.extname(fullPath);
    
    // Default content type
    let contentType = 'text/html';
    
    // Set content type based on file extension
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.mjs': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.ico': 'image/x-icon'
    };
    
    contentType = mimeTypes[ext] || 'application/octet-stream';
    
    // Read the file
    fs.readFile(fullPath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found
                fs.readFile(path.join(__dirname, '404.html'), (err, content) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content || '404 Not Found');
                });
            } else {
                // Server error
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            // Success - serve the file
            if (ext === '.html') {
                const processed = processIncludes(content.toString());
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(processed, 'utf-8');
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
