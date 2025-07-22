var cls = require("./lib/class"),
    url = require('url'),
    http = require('http'),
    WebSocket = require('ws'),
    Utils = require('./utils'),
    _ = require('underscore'),
    WS = {},
    useBison = false;

module.exports = WS;

/**
 * Abstract Server and Connection classes
 */
var Server = cls.Class.extend({
    init: function(port) {
        this.port = port;
        this._connections = {};
        this._counter = 0;
    },

    onConnect: function(callback) {
        this.connection_callback = callback;
    },

    onError: function(callback) {
        this.error_callback = callback;
    },

    broadcast: function(message) {
        this.forEachConnection(function(connection) {
            connection.send(message);
        });
    },

    forEachConnection: function(callback) {
        _.each(this._connections, callback);
    },

    addConnection: function(connection) {
        this._connections[connection.id] = connection;
    },

    removeConnection: function(id) {
        delete this._connections[id];
    },

    getConnection: function(id) {
        return this._connections[id];
    }
});

var Connection = cls.Class.extend({
    init: function(id, connection, server) {
        this._connection = connection;
        this._server = server;
        this.id = id;
    },

    onClose: function(callback) {
        this.close_callback = callback;
    },

    listen: function(callback) {
        this.listen_callback = callback;
    },

    broadcast: function(message) {
        throw "Not implemented";
    },

    send: function(message) {
        var data;
        if(useBison) {
            // BISON encoding would go here
            data = JSON.stringify(message);
        } else {
            data = JSON.stringify(message);
        }
        this.sendUTF8(data);
    },

    sendUTF8: function(data) {
        if(this._connection.readyState === WebSocket.OPEN) {
            this._connection.send(data);
        }
    },

    close: function(logError) {
        if(logError) {
            console.log("Closing connection to "+this._connection._socket.remoteAddress+". Error: "+logError);
        }
        this._connection.close();
    }
});

/**
 * Modern WebSocket Server using ws package
 */
WS.MultiVersionWebsocketServer = Server.extend({
    init: function(port) {
        var self = this;
        this._super(port);

        // Create HTTP server
        this._httpServer = http.createServer(function(request, response) {
            var path = url.parse(request.url).pathname;
            switch(path) {
                case '/status':
                    if(self.status_callback) {
                        response.writeHead(200);
                        response.write(self.status_callback());
                        break;
                    }
                default:
                    response.writeHead(404);
            }
            response.end();
        });

        // Create WebSocket server
        this._wsServer = new WebSocket.Server({ 
            server: this._httpServer,
            path: '/ws'
        });

        this._wsServer.on('connection', function(ws, request) {
            // Add remoteAddress property
            ws._socket = { remoteAddress: request.socket.remoteAddress };
            
            var connection = new WS.WSConnection(self._createId(), ws, self);
            
            if(self.connection_callback) {
                self.connection_callback(connection);
            }
            self.addConnection(connection);
        });

        this._httpServer.listen(port, function() {
            console.log("Server is listening on port "+port);
        });
    },

    _createId: function() {
        return '5' + Utils.random(99) + '' + (this._counter++);
    },

    onRequestStatus: function(status_callback) {
        this.status_callback = status_callback;
    }
});

/**
 * Connection class for modern ws package
 */
WS.WSConnection = Connection.extend({
    init: function(id, connection, server) {
        var self = this;
        this._super(id, connection, server);

        this._connection.on('message', function(message, isBinary) {
            if(self.listen_callback) {
                if(!isBinary) {
                    var data = message.toString();
                    if(useBison) {
                        // BISON decoding would go here
                        self.listen_callback(JSON.parse(data));
                    } else {
                        try {
                            self.listen_callback(JSON.parse(data));
                        } catch(e) {
                            if(e instanceof SyntaxError) {
                                self.close("Received message was not valid JSON.");
                            } else {
                                throw e;
                            }
                        }
                    }
                }
            }
        });

        this._connection.on('close', function() {
            if(self.close_callback) {
                self.close_callback();
            }
            self._server.removeConnection(self.id);
        });

        this._connection.on('error', function(error) {
            console.log('WebSocket error:', error);
            if(self.close_callback) {
                self.close_callback();
            }
            self._server.removeConnection(self.id);
        });
    }
});