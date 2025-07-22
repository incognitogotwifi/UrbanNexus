define([], function() {
    'use strict';
    
    var GameClient = function(game) {
        this.game = game;
        this.connection = null;
        this.connected = false;
        this.connecting = false;
        
        this.playerId = null;
        this.playerName = null;
        
        // Connection settings
        this.host = window.location.hostname || 'localhost';
        this.port = 5000;
        this.secure = window.location.protocol === 'https:';
        
        // Callbacks
        this.onConnected = null;
        this.onDisconnected = null;
        this.onMessage = null;
        this.onError = null;
        
        // Message handlers
        this.messageHandlers = {};
        this.initializeMessageHandlers();
    };
    
    GameClient.prototype.initializeMessageHandlers = function() {
        var self = this;
        
        // Message type constants
        var Messages = {
            WELCOME: 0,
            SPAWN: 1,
            DESPAWN: 2,
            MOVE: 3,
            CHAT: 9
        };
        
        this.messageHandlers[Messages.WELCOME] = function(message) {
            self.handleWelcome(message);
        };
        
        this.messageHandlers[Messages.SPAWN] = function(message) {
            self.handleSpawn(message);
        };
        
        this.messageHandlers[Messages.DESPAWN] = function(message) {
            self.handleDespawn(message);
        };
        
        this.messageHandlers[Messages.MOVE] = function(message) {
            self.handleMove(message);
        };
        
        this.messageHandlers[Messages.CHAT] = function(message) {
            self.handleChat(message);
        };
    };
    
    GameClient.prototype.connect = function() {
        if (this.connecting || this.connected) return;
        
        this.connecting = true;
        
        try {
            var protocol = this.secure ? 'wss:' : 'ws:';
            var url = protocol + '//' + this.host + ':' + this.port + '/ws';
            
            this.connection = new WebSocket(url);
            this.setupConnectionHandlers();
        } catch (e) {
            console.error('Failed to connect:', e);
            this.handleConnectionError(e);
        }
    };
    
    GameClient.prototype.setupConnectionHandlers = function() {
        var self = this;
        
        this.connection.onopen = function() {
            self.handleConnectionOpen();
        };
        
        this.connection.onmessage = function(event) {
            self.handleMessage(event.data);
        };
        
        this.connection.onclose = function(event) {
            self.handleConnectionClose(event);
        };
        
        this.connection.onerror = function(error) {
            self.handleConnectionError(error);
        };
    };
    
    GameClient.prototype.handleConnectionOpen = function() {
        console.log('Connected to game server');
        this.connected = true;
        this.connecting = false;
        
        if (this.onConnected) {
            this.onConnected();
        }
    };
    
    GameClient.prototype.handleMessage = function(data) {
        try {
            var message = JSON.parse(data);
            var messageType = message[0];
            
            if (this.messageHandlers[messageType]) {
                this.messageHandlers[messageType](message);
            } else {
                console.log('Unknown message type:', messageType, message);
            }
            
            if (this.onMessage) {
                this.onMessage(message);
            }
        } catch (error) {
            console.error('Error parsing message:', error, data);
        }
    };
    
    GameClient.prototype.handleConnectionClose = function(event) {
        console.log('Disconnected from server:', event.code, event.reason);
        this.connected = false;
        this.connecting = false;
        
        if (this.onDisconnected) {
            this.onDisconnected();
        }
    };
    
    GameClient.prototype.handleConnectionError = function(error) {
        console.error('Connection error:', error);
        this.connected = false;
        this.connecting = false;
        
        if (this.onError) {
            this.onError(error);
        }
    };
    
    // Message sending methods
    GameClient.prototype.sendMessage = function(message) {
        if (this.connected && this.connection.readyState === WebSocket.OPEN) {
            this.connection.send(JSON.stringify(message));
        } else {
            console.warn('Cannot send message - not connected');
        }
    };
    
    GameClient.prototype.sendHello = function(playerName) {
        this.sendMessage([0, playerName, 1, 1]); // HELLO message
    };
    
    GameClient.prototype.sendMove = function(x, y) {
        this.sendMessage([3, x, y]); // MOVE message
    };
    
    GameClient.prototype.sendChat = function(text) {
        this.sendMessage([9, text]); // CHAT message
    };
    
    // Message handlers (can be overridden by game)
    GameClient.prototype.handleWelcome = function(message) {
        console.log('Received welcome message:', message);
    };
    
    GameClient.prototype.handleSpawn = function(message) {
        console.log('Received spawn message:', message);
    };
    
    GameClient.prototype.handleDespawn = function(message) {
        console.log('Received despawn message:', message);
    };
    
    GameClient.prototype.handleMove = function(message) {
        console.log('Received move message:', message);
    };
    
    GameClient.prototype.handleChat = function(message) {
        console.log('Received chat message:', message);
    };
    
    return GameClient;
});