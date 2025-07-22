var http = require('http'),
    path = require('path'),
    fs = require('fs'),
    url = require('url');

var HttpServer = function(port) {
    this.port = port;
    this.server = null;
};

HttpServer.prototype.start = function() {
    var self = this;
    
    this.server = http.createServer(function(req, res) {
        self.handleRequest(req, res);
    });
    
    this.server.listen(this.port, '0.0.0.0', function() {
        console.log('HTTP server listening on port ' + self.port);
    });
};

HttpServer.prototype.handleRequest = function(req, res) {
    var parsedUrl = url.parse(req.url);
    var pathname = parsedUrl.pathname;
    
    // Default to index.html for root requests
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // Security: prevent directory traversal
    if (pathname.includes('..')) {
        this.send404(res);
        return;
    }
    
    // Determine file path
    var filePath;
    if (pathname.startsWith('/config/')) {
        filePath = path.join('./client', pathname);
    } else if (pathname.startsWith('/files/')) {
        filePath = path.join('./client', pathname);
    } else if (pathname.startsWith('/maps/')) {
        filePath = path.join('./client', pathname);
    } else if (pathname.startsWith('/audio/')) {
        filePath = path.join('./client', pathname);
    } else if (pathname.startsWith('/css/')) {
        filePath = path.join('./client', pathname);
    } else if (pathname.startsWith('/js/')) {
        filePath = path.join('./client', pathname);
    } else if (pathname.startsWith('/img/')) {
        filePath = path.join('./client', pathname);
    } else if (pathname.startsWith('/fonts/')) {
        filePath = path.join('./client', pathname);
    } else {
        filePath = path.join('./client', pathname);
    }
    
    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            this.send404(res);
            return;
        }
        
        this.serveFile(filePath, res);
    });
};

HttpServer.prototype.serveFile = function(filePath, res) {
    var ext = path.extname(filePath).toLowerCase();
    var contentType = this.getContentType(ext);
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            this.send500(res);
            return;
        }
        
        res.writeHead(200, {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end(data);
    });
};

HttpServer.prototype.getContentType = function(ext) {
    var mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.wav': 'audio/wav',
        '.mp3': 'audio/mpeg',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.txt': 'text/plain'
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
};

HttpServer.prototype.send404 = function(res) {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('404 Not Found');
};

HttpServer.prototype.send500 = function(res) {
    res.writeHead(500, {'Content-Type': 'text/plain'});
    res.end('500 Internal Server Error');
};

module.exports = HttpServer;