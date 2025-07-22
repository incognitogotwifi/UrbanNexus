define(['renderer', 'map', 'player', 'gameclient'], function(Renderer, Map, Player, GameClient) {
    'use strict';
    
    var Game = function(app) {
        this.app = app;
        this.ready = false;
        this.started = false;
        
        this.renderer = null;
        this.map = null;
        this.player = null;
        this.client = null;
        
        this.entities = {};
        this.players = {};
        
        this.mouse = { x: 0, y: 0 };
        
        // Game callbacks
        this.onGameStart = null;
        this.onDisconnect = null;
        
        console.log('Game initialized');
    };
    
    Game.prototype.setup = function($gameContainer, $canvas) {
        this.$gameContainer = $gameContainer;
        this.$canvas = $canvas;
        
        this.setupRenderer();
        this.setupEventHandlers();
        
        console.log('Game setup complete');
    };
    
    Game.prototype.setupRenderer = function() {
        this.renderer = new Renderer(this);
        this.renderer.initCanvas();
        this.renderer.initMap();
    };
    
    Game.prototype.setupEventHandlers = function() {
        var self = this;
        
        // Mouse events
        this.$canvas.on('click', function(e) {
            self.handleClick(e);
        });
        
        // Keyboard events
        $(document).on('keydown', function(e) {
            self.handleKeyDown(e);
        });
    };
    
    Game.prototype.start = function(playerName) {
        var self = this;
        
        console.log('Starting game with player name:', playerName);
        
        // Initialize game client
        this.client = new GameClient(this);
        
        this.client.onConnected = function() {
            console.log('Connected to server');
            self.client.sendHello(playerName);
        };
        
        this.client.onMessage = function(message) {
            self.handleServerMessage(message);
        };
        
        this.client.onDisconnected = function() {
            console.log('Disconnected from server');
            if (self.onDisconnect) {
                self.onDisconnect();
            }
        };
        
        this.client.onError = function(error) {
            console.error('Client error:', error);
        };
        
        // Connect to server
        this.client.connect();
        
        this.started = true;
        if (this.onGameStart) {
            this.onGameStart();
        }
    };
    
    Game.prototype.handleServerMessage = function(message) {
        var messageType = message[0];
        
        console.log('Received message:', message);
        
        switch (messageType) {
            case 0: // WELCOME
                this.handleWelcome(message);
                break;
            case 1: // SPAWN
                this.handleSpawn(message);
                break;
            case 2: // DESPAWN
                this.handleDespawn(message);
                break;
            case 3: // MOVE
                this.handleMove(message);
                break;
            case 8: // CHAT
                this.handleChat(message);
                break;
            default:
                console.log('Unknown message type:', messageType);
        }
    };
    
    Game.prototype.handleWelcome = function(message) {
        var playerId = message[1];
        var x = message[2];
        var y = message[3];
        var hp = message[4];
        
        console.log('Welcome message - Player ID:', playerId, 'Position:', x, y, 'HP:', hp);
        
        // Create player
        this.player = new Player(playerId, 'player', x, y);
        this.player.name = 'Player';
        this.player.hitPoints = hp;
        
        // Add to entities
        this.entities[playerId] = this.player;
        this.players[playerId] = this.player;
        
        // Center camera on player
        if (this.renderer && this.renderer.camera) {
            this.renderer.camera.setTarget(this.player);
        }
        
        console.log('Player created and added to game');
    };
    
    Game.prototype.handleSpawn = function(message) {
        var entityId = message[1];
        var type = message[2];
        var x = message[3];
        var y = message[4];
        var name = message[5];
        
        console.log('Spawn message - Entity:', entityId, 'Type:', type, 'Position:', x, y, 'Name:', name);
        
        // Create entity based on type
        var entity;
        if (type === 'player') {
            entity = new Player(entityId, type, x, y);
            entity.name = name || 'Player';
            this.players[entityId] = entity;
        } else {
            // For other entity types, create basic entity
            entity = {
                id: entityId,
                type: type,
                x: x,
                y: y,
                name: name
            };
        }
        
        this.entities[entityId] = entity;
        console.log('Entity spawned:', entity);
    };
    
    Game.prototype.handleDespawn = function(message) {
        var entityId = message[1];
        
        console.log('Despawn message - Entity:', entityId);
        
        delete this.entities[entityId];
        delete this.players[entityId];
    };
    
    Game.prototype.handleMove = function(message) {
        var entityId = message[1];
        var x = message[2];
        var y = message[3];
        
        var entity = this.entities[entityId];
        if (entity) {
            entity.x = x;
            entity.y = y;
            console.log('Entity moved:', entityId, 'to', x, y);
        }
    };
    
    Game.prototype.handleChat = function(message) {
        var playerId = message[1];
        var text = message[2];
        
        console.log('Chat from player', playerId, ':', text);
        
        // Show chat message (simple implementation)
        var $chatArea = $('#chat-area');
        if ($chatArea.length === 0) {
            $chatArea = $('<div id="chat-area" style="position: absolute; bottom: 10px; left: 10px; background: rgba(0,0,0,0.8); color: white; padding: 10px; max-width: 300px; max-height: 200px; overflow-y: auto;"></div>');
            this.$gameContainer.append($chatArea);
        }
        
        $chatArea.append('<div>' + playerId + ': ' + text + '</div>');
        $chatArea.scrollTop($chatArea[0].scrollHeight);
    };
    
    Game.prototype.handleClick = function(e) {
        if (!this.player || !this.client) return;
        
        var rect = this.$canvas[0].getBoundingClientRect();
        var x = Math.floor((e.clientX - rect.left) / 2); // Adjust for scaling
        var y = Math.floor((e.clientY - rect.top) / 2);
        
        console.log('Click at:', x, y);
        
        // Send move command to server
        this.client.sendMove(x, y);
    };
    
    Game.prototype.handleKeyDown = function(e) {
        if (!this.client) return;
        
        // Enter key - open chat
        if (e.which === 13) {
            var message = prompt('Enter message:');
            if (message) {
                this.client.sendChat(message);
            }
        }
    };
    
    Game.prototype.run = function() {
        if (this.renderer) {
            this.renderer.render();
        }
    };
    
    return Game;
});