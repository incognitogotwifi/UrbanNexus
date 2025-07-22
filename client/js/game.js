define(['renderer', 'map', 'player', 'gameclient', 'camera', 'chathandler', 'audio', 'storage'], 
function(Renderer, Map, Player, GameClient, Camera, ChatHandler, Audio, Storage) {
    'use strict';
    
    var Game = function(app) {
        this.app = app;
        this.ready = false;
        this.started = false;
        this.hasNeverStarted = true;
        
        this.renderer = null;
        this.map = null;
        this.player = null;
        this.camera = null;
        this.chatHandler = null;
        this.audio = null;
        this.storage = null;
        this.client = null;
        
        this.entities = [];
        this.players = [];
        this.mobs = [];
        this.items = [];
        this.npcs = [];
        this.chests = [];
        
        this.selectedX = 0;
        this.selectedY = 0;
        this.selectedCellVisible = false;
        
        this.targetColor = 'rgba(255, 255, 255, 0.5)';
        this.targetBorderColor = 'rgba(255, 255, 255, 1.0)';
        
        this.mouse = {
            x: 0,
            y: 0
        };
        
        this.time = 0;
        this.lastTime = new Date();
        
        this.nbPlayers = 0;
        this.playerPopulation = {};
        
        // Game callbacks
        this.onGameStart = null;
        this.onDisconnect = null;
        
        this.initializeGame();
    };
    
    Game.prototype.setup = function($gameContainer, $canvases) {
        this.$gameContainer = $gameContainer;
        
        this.setupRenderer();
        this.setupEventHandlers();
    };
    
    Game.prototype.setupRenderer = function() {
        this.renderer = new Renderer(this);
        this.renderer.initCanvas();
    };
    
    Game.prototype.setupEventHandlers = function() {
        var self = this;
        
        // Mouse events
        this.renderer.onMouseMove(function(x, y) {
            self.setMouseCoordinates(x, y);
        });
        
        this.renderer.onMouseClick(function(x, y) {
            self.handleMouseClick(x, y);
        });
        
        // Keyboard events
        $(document).keydown(function(e) {
            self.handleKeyDown(e);
        });
    };
    
    Game.prototype.initializeGame = function() {
        this.storage = new Storage();
        this.audio = new Audio(this);
        this.chatHandler = new ChatHandler(this);
        this.camera = new Camera(this.renderer);
        
        // Load game configuration
        this.loadGameData();
    };
    
    Game.prototype.loadGameData = function() {
        var self = this;
        
        // Load sprites data
        $.getJSON('sprites.json', function(data) {
            self.sprites = data;
            self.checkReady();
        });
        
        // Load map data
        $.getJSON('maps/world_client.json', function(data) {
            self.map = new Map(data);
            self.checkReady();
        }).fail(function() {
            // Fallback to default map if file doesn't exist
            self.map = new Map({
                width: 172,
                height: 314,
                tilewidth: 16,
                tileheight: 16,
                layers: [],
                tilesets: []
            });
            self.checkReady();
        });
        
        // Load audio data
        $.getJSON('audio.json', function(data) {
            self.audioData = data;
            self.checkReady();
        });
    };
    
    Game.prototype.checkReady = function() {
        if (this.sprites && this.map && this.audioData) {
            this.ready = true;
            this.renderer.loadSprites(this.sprites);
        }
    };
    
    Game.prototype.connect = function(name) {
        if (!this.ready) {
            setTimeout(this.connect.bind(this, name), 100);
            return;
        }
        
        this.client = new GameClient(this);
        this.client.connect(name);
        
        var self = this;
        this.client.onConnected(function() {
            self.start();
        });
        
        this.client.onDisconnected(function() {
            self.stop();
        });
        
        this.client.onPlayerSpawn(function(player) {
            self.addPlayer(player);
        });
        
        this.client.onPlayerDespawn(function(playerId) {
            self.removePlayer(playerId);
        });
        
        this.client.onEntitySpawn(function(entity) {
            self.addEntity(entity);
        });
        
        this.client.onEntityDespawn(function(entityId) {
            self.removeEntity(entityId);
        });
    };
    
    Game.prototype.start = function() {
        this.started = true;
        this.hasNeverStarted = false;
        
        if (this.onGameStart) {
            this.onGameStart();
        }
        
        this.tick();
    };
    
    Game.prototype.stop = function() {
        this.started = false;
        
        if (this.onDisconnect) {
            this.onDisconnect();
        }
    };
    
    Game.prototype.run = function() {
        if (!this.started) {
            return;
        }
        
        this.updateGame();
        this.renderer.render();
    };
    
    Game.prototype.tick = function() {
        if (!this.started) {
            return;
        }
        
        var self = this;
        var currentTime = new Date();
        var timeDiff = currentTime - this.lastTime;
        
        this.time += timeDiff;
        this.lastTime = currentTime;
        
        // Update entities
        this.entities.forEach(function(entity) {
            if (entity.update) {
                entity.update(timeDiff);
            }
        });
        
        // Update player
        if (this.player) {
            this.player.update(timeDiff);
        }
        
        setTimeout(function() {
            self.tick();
        }, 1000 / 50); // 50 FPS
    };
    
    Game.prototype.updateGame = function() {
        // Update camera position
        if (this.player && this.camera) {
            this.camera.centerOn(this.player);
        }
    };
    
    Game.prototype.setMouseCoordinates = function(x, y) {
        this.mouse.x = x;
        this.mouse.y = y;
        
        if (this.camera) {
            var pos = this.camera.screenToWorld(x, y);
            this.selectedX = pos.x;
            this.selectedY = pos.y;
            this.selectedCellVisible = true;
        }
    };
    
    Game.prototype.handleMouseClick = function(x, y) {
        if (!this.started || !this.player) {
            return;
        }
        
        var pos = this.camera.screenToWorld(x, y);
        var gridX = Math.floor(pos.x / 32);
        var gridY = Math.floor(pos.y / 32);
        
        // Check for entity at click position
        var entity = this.getEntityAt(gridX, gridY);
        
        if (entity) {
            this.handleEntityClick(entity);
        } else {
            // Move to position
            this.player.moveTo(gridX, gridY);
            if (this.client) {
                this.client.sendMove(gridX, gridY);
            }
        }
    };
    
    Game.prototype.handleEntityClick = function(entity) {
        if (entity.type === 'mob') {
            this.player.attack(entity);
            if (this.client) {
                this.client.sendAttack(entity.id);
            }
        } else if (entity.type === 'item') {
            if (this.client) {
                this.client.sendLoot(entity.id);
            }
        } else if (entity.type === 'npc') {
            if (this.client) {
                this.client.sendTalk(entity.id);
            }
        }
    };
    
    Game.prototype.handleKeyDown = function(e) {
        if (e.keyCode === 13) { // Enter key
            this.chatHandler.toggle();
            e.preventDefault();
        }
    };
    
    Game.prototype.getEntityAt = function(x, y) {
        for (var i = 0; i < this.entities.length; i++) {
            var entity = this.entities[i];
            if (entity.gridX === x && entity.gridY === y) {
                return entity;
            }
        }
        return null;
    };
    
    Game.prototype.addEntity = function(entity) {
        this.entities.push(entity);
        
        if (entity.type === 'player') {
            this.players.push(entity);
        } else if (entity.type === 'mob') {
            this.mobs.push(entity);
        } else if (entity.type === 'item') {
            this.items.push(entity);
        } else if (entity.type === 'npc') {
            this.npcs.push(entity);
        } else if (entity.type === 'chest') {
            this.chests.push(entity);
        }
    };
    
    Game.prototype.addPlayer = function(player) {
        if (player.id === this.client.playerId) {
            this.player = player;
        }
        this.addEntity(player);
    };
    
    Game.prototype.removeEntity = function(entityId) {
        for (var i = this.entities.length - 1; i >= 0; i--) {
            if (this.entities[i].id === entityId) {
                var entity = this.entities[i];
                this.entities.splice(i, 1);
                
                // Remove from specific arrays
                this.removeFromArray(this.players, entityId);
                this.removeFromArray(this.mobs, entityId);
                this.removeFromArray(this.items, entityId);
                this.removeFromArray(this.npcs, entityId);
                this.removeFromArray(this.chests, entityId);
                
                break;
            }
        }
    };
    
    Game.prototype.removePlayer = function(playerId) {
        this.removeEntity(playerId);
        
        if (this.player && this.player.id === playerId) {
            this.player = null;
        }
    };
    
    Game.prototype.removeFromArray = function(array, entityId) {
        for (var i = array.length - 1; i >= 0; i--) {
            if (array[i].id === entityId) {
                array.splice(i, 1);
                break;
            }
        }
    };
    
    return Game;
});
