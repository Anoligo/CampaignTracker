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

// Simple server-side include processor
function processIncludes(content, baseDir) {
    const includeRegex = /<!--#include\s+file="([^"]+)"\s*-->/g;
    return content.replace(includeRegex, (_, includePath) => {
        const full = path.join(baseDir, includePath);
        try {
            const inc = fs.readFileSync(full, 'utf8');
            return processIncludes(inc, path.dirname(full));
        } catch (err) {
            console.error(`Error including ${includePath}:`, err);
            return '';
        }
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
    
    // Map URL paths to file system paths
    let fullPath;
    
    // Map specific directories
    if (filePath.startsWith('/dist/')) {
        fullPath = path.join(__dirname, filePath.substring(1)); // Remove leading slash
    } else if (filePath.startsWith('/scripts/')) {
        fullPath = path.join(__dirname, filePath.substring(1)); // Remove leading slash
    } else if (filePath === '/') {
        fullPath = path.join(__dirname, 'index.html');
    } else {
        fullPath = path.join(__dirname, filePath);
    }
    
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
    
    // Check if the path is a directory and look for index.js
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
        const indexPath = path.join(fullPath, 'index.js');
        console.log(`Directory requested: ${fullPath}`);
        console.log(`Looking for index file at: ${indexPath}`);
        
        if (fs.existsSync(indexPath)) {
            console.log(`Found index file: ${indexPath}`);
            fullPath = indexPath;
            contentType = 'application/javascript';
        } else {
            console.error(`Index file not found in directory: ${fullPath}`);
            res.writeHead(403);
            res.end('Directory listing not allowed');
            return;
        }
    }

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
            let output = content;
            if (ext === '.html') {
                output = processIncludes(content.toString(), path.dirname(fullPath));
            }
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(output, 'utf-8');
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
