define(['renderer', 'map', 'player', 'gameclient', 'camera', 'chathandler', 'audio', 'storage', 'config-manager', 'scripting', 'particle-engine', 'admin-commands', 'advanced-npc', 'bani-animation'], 
function(Renderer, Map, Player, GameClient, Camera, ChatHandler, Audio, Storage, ConfigManager, Scripting, ParticleEngine, AdminCommands, AdvancedNPC, BANIAnimation) {
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
        
        // iAppsBeats enhanced systems
        this.configManager = null;
        this.scripting = null;
        this.particleEngine = null;
        this.adminCommands = null;
        this.baniAnimation = null;
        
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
        
        // iAppsBeats features
        this.chatCommands = {};
        this.mapMarkers = [];
        this.noPKZones = [];
        this.banList = [];
        
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
        
        // Initialize particle engine after renderer is ready
        this.particleEngine = new ParticleEngine(this.renderer);
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
        
        // Initialize iAppsBeats systems
        this.configManager = new ConfigManager();
        this.scripting = new Scripting(this);
        this.adminCommands = new AdminCommands(this);
        this.baniAnimation = new BANIAnimation();
        
        // Load game configuration
        this.loadGameData();
        this.loadConfigurations();
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
        }).fail(function() {
            // Fallback audio data
            self.audioData = {
                sounds: {},
                music: {}
            };
            self.checkReady();
        });
    };
    
    Game.prototype.checkReady = function() {
        if (this.sprites && this.map && this.audioData) {
            this.ready = true;
            this.renderer.loadSprites(this.sprites);
            
            // Initialize game systems that depend on loaded data
            this.initializeAdvancedSystems();
        }
    };
    
    Game.prototype.loadConfigurations = function() {
        var self = this;
        
        // Load chat commands
        this.configManager.getChatCommands(function(data) {
            if (data && data.chatcommands) {
                self.chatCommands = data.chatcommands;
                console.log('Loaded chat commands:', self.chatCommands.length);
            }
        });
        
        // Load map markers
        this.configManager.getMapMarkers(function(data) {
            if (data && data.mapmarkers) {
                self.mapMarkers = data.mapmarkers;
                console.log('Loaded map markers');
            }
        });
        
        // Load no-PK zones
        this.configManager.getNoPKZones(function(data) {
            if (data && data.nopkzones) {
                self.noPKZones = data.nopkzones;
                console.log('Loaded no-PK zones');
            }
        });
        
        // Load ban list
        this.configManager.getBans(function(data) {
            if (data && data.bans) {
                self.banList = data.bans;
                console.log('Loaded ban configuration');
            }
        });
    };
    
    Game.prototype.initializeAdvancedSystems = function() {
        // Set up chat command handlers
        this.setupChatCommands();
        
        // Initialize admin system
        if (this.adminCommands) {
            this.adminCommands.playerAdminLevel = 0; // Will be set by server
        }
        
        console.log('iAppsBeats systems initialized');
    };
    
    Game.prototype.setupChatCommands = function() {
        var self = this;
        
        if (this.chatHandler && this.chatCommands) {
            // Override chat message handling to support commands
            var originalSendMessage = this.chatHandler.sendMessage;
            this.chatHandler.sendMessage = function(message) {
                // Check for chat commands
                var commandResult = self.processChatCommand(message);
                if (commandResult) {
                    return; // Command was processed
                }
                
                // Process normal chat message
                if (originalSendMessage) {
                    originalSendMessage.call(this, message);
                }
            };
        }
    };
    
    Game.prototype.processChatCommand = function(message) {
        // Check if message starts with admin command
        if (message.startsWith('/')) {
            var command = message.substring(1);
            if (this.adminCommands) {
                var result = this.adminCommands.executeCommand(command);
                this.showSystemMessage(result);
                return true;
            }
        }
        
        // Check for animation commands
        for (var i = 0; i < this.chatCommands.length; i++) {
            var cmd = this.chatCommands[i];
            if (message.toLowerCase().includes(cmd.command.toLowerCase())) {
                this.playPlayerAnimation(cmd.ani);
                return false; // Allow message to go through
            }
        }
        
        return false;
    };
    
    Game.prototype.playPlayerAnimation = function(animationName) {
        if (this.player && animationName) {
            // Trigger BANI animation on player
            if (this.baniAnimation) {
                this.baniAnimation.playAnimation(animationName, this.player);
            } else {
                this.player.setAnimation(animationName);
            }
            
            // Create particle effect if appropriate
            if (this.particleEngine) {
                this.createAnimationEffect(animationName);
            }
        }
    };
    
    Game.prototype.createAnimationEffect = function(animationName) {
        if (!this.player || !this.particleEngine) return;
        
        var x = this.player.x * 32;
        var y = this.player.y * 32;
        
        switch (animationName) {
            case 'westlaw_blunt-atk':
            case 'westlaw_bandage-atk':
                this.particleEngine.createHealEffect(x, y);
                break;
            case 'westlaw_deathpart1':
                this.particleEngine.createExplosionEffect(x, y);
                break;
            case 'westlaw_firedance':
                this.particleEngine.createBulletFireEffect(x, y);
                break;
            default:
                // Generic sparkle effect
                this.particleEngine.createEmitter({
                    x: x,
                    y: y,
                    particleCount: 10,
                    particleLife: 60,
                    emissionRate: 5,
                    speed: 1,
                    color: { r: 255, g: 255, b: 255, a: 1 },
                    endColor: { r: 255, g: 255, b: 255, a: 0 },
                    duration: 500
                });
                break;
        }
    };
    
    Game.prototype.showSystemMessage = function(message) {
        if (this.chatHandler) {
            // Display system message in chat
            this.chatHandler.addSystemMessage(message);
        } else {
            console.log('System:', message);
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
    
    Game.prototype.addPlayer = function(player) {
        this.players.push(player);
        
        // Trigger scripting events
        if (this.scripting) {
            this.scripting.triggerEvent('playerJoin', player);
        }
    };
    
    Game.prototype.removePlayer = function(playerId) {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].id === playerId) {
                var player = this.players[i];
                
                // Trigger scripting events
                if (this.scripting) {
                    this.scripting.triggerEvent('playerLeave', player);
                }
                
                this.players.splice(i, 1);
                break;
            }
        }
    };
    
    Game.prototype.addAdvancedNPC = function(config) {
        var npc = new AdvancedNPC(
            config.id || 'npc_' + Date.now(),
            config.x || 0,
            config.y || 0,
            config
        );
        
        this.npcs.push(npc);
        this.entities.push(npc);
        
        return npc;
    };
    
    Game.prototype.createShopNPC = function(x, y, shopConfig) {
        return this.addAdvancedNPC({
            x: x,
            y: y,
            name: shopConfig.name || 'Shop Keeper',
            aiType: 'static',
            shop: shopConfig,
            dialogue: [shopConfig.greeting || 'Welcome to my shop!']
        });
    };
    
    Game.prototype.createScriptNPC = function(x, y, scriptClass) {
        return this.addAdvancedNPC({
            x: x,
            y: y,
            scriptClass: scriptClass,
            aiType: 'static'
        });
    };
    
    Game.prototype.createPatrolNPC = function(x, y, patrolPoints) {
        return this.addAdvancedNPC({
            x: x,
            y: y,
            aiType: 'patrol',
            patrolPoints: patrolPoints,
            movementSpeed: 0.5
        });
    };
    
    Game.prototype.createGuardNPC = function(x, y, guardRange) {
        return this.addAdvancedNPC({
            x: x,
            y: y,
            aiType: 'guard',
            guardRange: guardRange || 3,
            detectionRange: 5
        });
    };
    
    Game.prototype.run = function() {
        if (!this.started) {
            return;
        }
        
        this.updateGame();
        
        // Update iAppsBeats systems
        if (this.particleEngine) {
            this.particleEngine.update();
        }
        
        if (this.scripting) {
            // Scripting update handled in entity updates
        }
        
        this.renderer.render();
        
        // Render particle effects
        if (this.particleEngine) {
            this.particleEngine.render();
        }
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
