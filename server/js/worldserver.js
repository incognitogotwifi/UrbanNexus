var cls = require("./lib/class"),
    _ = require("underscore"),
    fs = require("fs"),
    path = require("path"),
    url = require("url"),
    http = require("http"),
    { WebSocketServer } = require("ws"),
    Entity = require('./entity'),
    Character = require('./character'),
    Mob = require('./mob'),
    Map = require('./map'),
    Npc = require('./npc'),
    Player = require('./player'),
    Item = require('./item'),
    MobArea = require('./mobarea'),
    ChestArea = require('./chestarea'),
    Chest = require('./chest'),
    Messages = require('./message'),
    Properties = require("./properties"),
    Utils = require("./utils"),
    Types = require("../../shared/js/gametypes"),
    { storage } = require("../storage");

var WorldServer = cls.Class.extend({
    init: function(id, config, log) {
        var self = this;
        
        this.id = id;
        this.config = config;
        this.log = log || console;
        
        this.maxPlayers = this.config.nb_players_per_world || 200;
        this.playerCount = 0;
        this.upTime = new Date();
        
        // Game entities
        this.players = {};
        this.mobs = {};
        this.items = {};
        this.npcs = {};
        this.chests = {};
        
        // Game areas and map
        this.map = null;
        this.areas = {};
        
        // Entity management
        this.entityIdCounter = 1;
        this.playerIds = [];
        
        // Connection management
        this.connections = {};
        this.connectionCount = 0;
        
        // Game loop
        this.gameLoopInterval = null;
        this.lastGameLoopTime = Date.now();
        
        // Initialize components
        this.initializeMap();
        this.initializeAreas();
        this.initializeEntities();
        this.startGameLoop();
        
        console.info("World '" + this.id + "' initialized");
    },
    
    run: function(port) {
        var self = this;
        
        // Create HTTP server
        this.httpServer = http.createServer(function(req, res) {
            self.handleHttpRequest(req, res);
        });
        
        // Create WebSocket server
        this.wss = new WebSocketServer({ 
            server: this.httpServer, 
            path: '/ws'
        });
        
        this.wss.on('connection', function(connection) {
            self.handleConnection(connection);
        });
        
        this.httpServer.listen(port, this.config.host, function() {
            console.log("Server is listening on port " + port);
        });
        
        // Start game loop
        this.startGameLoop();
    },
    
    handleHttpRequest: function(req, res) {
        var pathname = url.parse(req.url).pathname;
        var self = this;
        
        // Add CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        if (pathname === '/') {
            // Serve the main game page
            this.serveFile('../../client/index.html', 'text/html', res);
        } else if (pathname.startsWith('/css/')) {
            // Serve CSS files
            var filePath = '../../client' + pathname;
            this.serveFile(filePath, 'text/css', res);
        } else if (pathname.startsWith('/js/')) {
            // Serve JavaScript files
            var filePath = '../../client' + pathname;
            this.serveFile(filePath, 'application/javascript', res);
        } else if (pathname.startsWith('/config/')) {
            // Serve config files
            var filePath = '../../client' + pathname;
            this.serveFile(filePath, 'application/json', res);
        } else if (pathname.startsWith('/maps/')) {
            // Serve map files
            var filePath = '../../client' + pathname;
            this.serveFile(filePath, 'application/json', res);
        } else if (pathname.startsWith('/audio/')) {
            // Serve audio files
            var filePath = '../../client' + pathname;
            var contentType = this.getContentType(filePath);
            this.serveFile(filePath, contentType, res);
        } else if (pathname.startsWith('/img/')) {
            // Serve image files
            var filePath = '../../client' + pathname;
            var contentType = this.getContentType(filePath);
            this.serveFile(filePath, contentType, res);
        } else if (pathname.startsWith('/shared/')) {
            // Serve shared files
            var filePath = '../..' + pathname;
            var contentType = this.getContentType(filePath);
            this.serveFile(filePath, contentType, res);
        } else if (pathname.startsWith('/files/') || pathname.startsWith('/fonts/')) {
            // Serve asset files
            var filePath = '../../client' + pathname;
            var contentType = this.getContentType(filePath);
            this.serveFile(filePath, contentType, res);
        } else {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('Not Found: ' + pathname);
        }
    },
    
    serveFile: function(filePath, contentType, res) {
        var fullPath = path.join(__dirname, filePath);
        fs.readFile(fullPath, function(err, data) {
            if (err) {
                console.log('File not found: ' + fullPath);
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end('File not found: ' + filePath);
            } else {
                res.writeHead(200, { 
                    'Content-Type': contentType,
                    'Cache-Control': 'no-cache'
                });
                res.end(data);
            }
        });
    },
    
    getContentType: function(filePath) {
        var ext = path.extname(filePath);
        switch (ext) {
            case '.html': return 'text/html';
            case '.js': return 'application/javascript';
            case '.css': return 'text/css';
            case '.json': return 'application/json';
            case '.png': return 'image/png';
            case '.jpg': case '.jpeg': return 'image/jpeg';
            case '.gif': return 'image/gif';
            case '.svg': return 'image/svg+xml';
            default: return 'text/plain';
        }
    },
    
    handleConnection: function(connection) {
        var self = this;
        
        if (this.connectionCount >= this.maxPlayers) {
            console.info("World full, rejecting connection");
            connection.close();
            return;
        }
        
        var connectionId = Utils.generateId();
        this.connections[connectionId] = {
            id: connectionId,
            connection: connection,
            player: null
        };
        this.connectionCount++;
        
        console.info("New connection: " + connectionId);
        
        connection.on('message', function(message) {
            self.handleMessage(connectionId, message);
        });
        
        connection.on('close', function() {
            self.handleDisconnection(connectionId);
        });
        
        connection.on('error', function(error) {
            self.log.error("Connection error for " + connectionId + ": " + error);
            self.handleDisconnection(connectionId);
        });
    },
    
    handleMessage: function(connectionId, messageData) {
        try {
            var message = JSON.parse(messageData);
            var connection = this.connections[connectionId];
            
            if (!connection) {
                return;
            }
            
            var messageType = message[0];
            
            switch (messageType) {
                case Messages.HELLO:
                    this.handleHello(connection, message);
                    break;
                case Messages.MOVE:
                    this.handleMove(connection, message);
                    break;
                case Messages.ATTACK:
                    this.handleAttack(connection, message);
                    break;
                case Messages.HIT:
                    this.handleHit(connection, message);
                    break;
                case Messages.HURT:
                    this.handleHurt(connection, message);
                    break;
                case Messages.LOOT:
                    this.handleLoot(connection, message);
                    break;
                case Messages.CHAT:
                    this.handleChat(connection, message);
                    break;
                case Messages.TALK:
                    this.handleTalk(connection, message);
                    break;
                case Messages.WHO:
                    this.handleWho(connection, message);
                    break;
                case Messages.ZONE:
                    this.handleZone(connection, message);
                    break;
                case Messages.OPEN:
                    this.handleOpen(connection, message);
                    break;
                case Messages.CHECK:
                    this.handleCheck(connection, message);
                    break;
                default:
                    console.warn("Unknown message type: " + messageType);
            }
        } catch (error) {
            console.error("Error handling message from " + connectionId + ": " + error);
        }
    },
    
    handleDisconnection: function(connectionId) {
        var connection = this.connections[connectionId];
        
        if (connection && connection.player) {
            // Save player position and stats to database
            this.savePlayerData(connection.player, connection.playerProfile);
            this.removePlayer(connection.player);
        }
        
        delete this.connections[connectionId];
        this.connectionCount--;
        
        console.info("Connection disconnected: " + connectionId);
    },
    
    handleHello: function(connection, message) {
        var self = this;
        var playerName = message[1];
        
        // Try to find or create user in database
        this.getOrCreatePlayer(playerName, function(user, playerProfile) {
            var player = self.createPlayer(connection, playerName, user, playerProfile);
            
            connection.player = player;
            connection.user = user;
            connection.playerProfile = playerProfile;
            self.players[player.id] = player;
            self.playerCount++;
            
            // Send welcome message
            var spawnPosition = self.getSpawnPosition();
            self.sendToPlayer(player, [Messages.WELCOME, player.id, spawnPosition.x, spawnPosition.y, player.hitPoints]);
            
            // Send existing entities to new player
            self.sendEntitiesTo(player);
            
            // Notify other players about new player
            self.broadcastToOthers(player, [Messages.SPAWN, player.id, player.type, player.x, player.y, player.name]);
            
            console.info("Player '" + playerName + "' joined the game (id: " + player.id + ")");
        });
    },
    
    getOrCreatePlayer: function(playerName, callback) {
        storage.getUserByUsername(playerName)
            .then(function(user) {
                if (user) {
                    // User exists, get their profile
                    return storage.getPlayerProfile(user.id)
                        .then(function(profile) {
                            callback(user, profile);
                        });
                } else {
                    // Create new user and profile
                    return storage.createUser({ username: playerName })
                        .then(function(newUser) {
                            if (newUser) {
                                return storage.createPlayerProfile({
                                    userId: newUser.id,
                                    characterName: playerName,
                                    level: 1,
                                    hitPoints: 100,
                                    maxHitPoints: 100,
                                    x: 50,
                                    y: 50
                                }).then(function(newProfile) {
                                    callback(newUser, newProfile);
                                });
                            } else {
                                // Fallback if database fails
                                callback({ id: Date.now(), username: playerName }, null);
                            }
                        });
                }
            })
            .catch(function(error) {
                console.error("Database error in getOrCreatePlayer:", error);
                // Fallback to temporary user
                callback({ id: Date.now(), username: playerName }, null);
            });
    },

    createPlayer: function(connection, name, user, playerProfile) {
        var player = new Player(this.generateEntityId(), name, this);
        player.connection = connection;
        player.userId = user ? user.id : null;
        player.profileId = playerProfile ? playerProfile.id : null;
        
        var spawnPosition;
        if (playerProfile) {
            spawnPosition = { x: playerProfile.x, y: playerProfile.y };
            player.level = playerProfile.level;
            player.experience = playerProfile.experience;
            player.hitPoints = playerProfile.hitPoints;
            player.maxHitPoints = playerProfile.maxHitPoints;
        } else {
            spawnPosition = this.getSpawnPosition();
        }
        
        player.setPosition(spawnPosition.x, spawnPosition.y);
        
        return player;
    },

    savePlayerData: function(player, playerProfile) {
        if (player && playerProfile && storage) {
            storage.updatePlayerProfile(playerProfile.id, {
                x: player.x,
                y: player.y,
                hitPoints: player.hitPoints,
                level: player.level || 1,
                experience: player.experience || 0
            }).catch(function(error) {
                console.error("Error saving player data:", error);
            });
        }
    },

    handleChat: function(connection, message) {
        var chatMessage = message[1];
        var player = connection.player;
        
        if (player && chatMessage) {
            // Save chat message to database
            if (connection.user && connection.playerProfile) {
                storage.saveChatMessage({
                    userId: connection.user.id,
                    playerProfileId: connection.playerProfile.id,
                    message: chatMessage,
                    worldId: this.id
                }).catch(function(error) {
                    console.error("Error saving chat message:", error);
                });
            }
            
            // Broadcast chat message to all players
            this.broadcast([Messages.CHAT, player.id, chatMessage]);
            console.info("Chat from " + player.name + ": " + chatMessage);
        }
    },
    
    removePlayer: function(player) {
        if (this.players[player.id]) {
            // Notify other players
            this.broadcastToOthers(player, [Messages.DESPAWN, player.id]);
            
            delete this.players[player.id];
            this.playerCount--;
            
            console.info("Player '" + player.name + "' left the game");
        }
    },
    
    getSpawnPosition: function() {
        // Default spawn position - should be loaded from map
        return { x: 50, y: 50 };
    },
    
    sendEntitiesTo: function(player) {
        var self = this;
        
        // Send other players
        _.each(this.players, function(otherPlayer) {
            if (otherPlayer.id !== player.id) {
                self.sendToPlayer(player, [Messages.SPAWN, otherPlayer.id, otherPlayer.type, otherPlayer.x, otherPlayer.y, otherPlayer.name]);
            }
        });
        
        // Send NPCs
        _.each(this.npcs, function(npc) {
            self.sendToPlayer(player, [Messages.SPAWN, npc.id, npc.type, npc.x, npc.y]);
        });
        
        // Send mobs
        _.each(this.mobs, function(mob) {
            self.sendToPlayer(player, [Messages.SPAWN, mob.id, mob.type, mob.x, mob.y]);
        });
        
        // Send items
        _.each(this.items, function(item) {
            self.sendToPlayer(player, [Messages.SPAWN, item.id, item.type, item.x, item.y]);
        });
        
        // Send chests
        _.each(this.chests, function(chest) {
            self.sendToPlayer(player, [Messages.SPAWN, chest.id, chest.type, chest.x, chest.y]);
        });
    },
    
    generateEntityId: function() {
        return this.entityIdCounter++;
    },
    
    sendToPlayer: function(player, message) {
        if (player.connection && player.connection.connection.readyState === 1) {
            player.connection.connection.send(JSON.stringify(message));
        }
    },
    
    broadcastToOthers: function(excludePlayer, message) {
        var self = this;
        _.each(this.players, function(player) {
            if (player.id !== excludePlayer.id) {
                self.sendToPlayer(player, message);
            }
        });
    },
    
    broadcast: function(message) {
        var self = this;
        _.each(this.players, function(player) {
            self.sendToPlayer(player, message);
        });
    },
    
    handleMove: function(connection, message) {
        var player = connection.player;
        if (!player) return;
        
        var x = message[1];
        var y = message[2];
        
        if (this.isValidPosition(x, y)) {
            player.setPosition(x, y);
            this.broadcastToOthers(player, [Messages.MOVE, player.id, x, y]);
        }
    },
    
    handleAttack: function(connection, message) {
        var player = connection.player;
        if (!player) return;
        
        var targetId = message[1];
        var target = this.getEntityById(targetId);
        
        if (target && player.canAttack(target)) {
            this.broadcastToOthers(player, [Messages.ATTACK, player.id, targetId]);
            
            if (target.type === 'mob') {
                var damage = player.getDamage();
                target.receiveDamage(damage, player);
                this.broadcast([Messages.HIT, player.id, targetId, damage]);
                
                if (target.isDead()) {
                    this.handleMobDeath(target, player);
                }
            }
        }
    },
    
    handleMobDeath: function(mob, killer) {
        this.broadcast([Messages.DESPAWN, mob.id]);
        delete this.mobs[mob.id];
        
        // Drop loot
        var loot = mob.getLoot();
        if (loot) {
            var item = this.createItem(loot, mob.x, mob.y);
            this.items[item.id] = item;
            this.broadcast([Messages.SPAWN, item.id, item.type, item.x, item.y]);
        }
        
        // Award experience
        killer.gainExperience(mob.getExperienceReward());
        
        // Respawn mob after delay
        var self = this;
        setTimeout(function() {
            self.respawnMob(mob);
        }, mob.respawnTime);
    },
    
    respawnMob: function(originalMob) {
        var mob = this.createMob(originalMob.type, originalMob.spawnX, originalMob.spawnY);
        this.mobs[mob.id] = mob;
        this.broadcast([Messages.SPAWN, mob.id, mob.type, mob.x, mob.y]);
    },
    
    createItem: function(type, x, y) {
        var Item = require('./item');
        var item = new Item(this.generateEntityId(), type, this);
        item.setPosition(x, y);
        return item;
    },
    
    createMob: function(type, x, y) {
        var Mob = require('./mob');
        var mob = new Mob(this.generateEntityId(), type, this);
        mob.setPosition(x, y);
        mob.spawnX = x;
        mob.spawnY = y;
        return mob;
    },
    
    handleLoot: function(connection, message) {
        var player = connection.player;
        if (!player) return;
        
        var itemId = message[1];
        var item = this.items[itemId];
        
        if (item && player.canLoot(item)) {
            player.loot(item);
            this.broadcast([Messages.DESPAWN, itemId]);
            delete this.items[itemId];
            
            // Send equipment update
            this.broadcast([Messages.EQUIP, player.id, item.type]);
        }
    },
    
    handleChat: function(connection, message) {
        var player = connection.player;
        if (!player) return;
        
        var text = message[1];
        
        if (text && text.length > 0 && text.length <= 60) {
            this.broadcast([Messages.CHAT, player.id, text]);
        }
    },
    
    handleWho: function(connection, message) {
        var player = connection.player;
        if (!player) return;
        
        var playerNames = _.map(this.players, function(p) { return p.name; });
        this.sendToPlayer(player, [Messages.WHO, playerNames]);
    },
    
    isValidPosition: function(x, y) {
        // Should check against map collision data
        return x >= 0 && y >= 0 && x < 100 && y < 100;
    },
    
    getEntityById: function(id) {
        return this.players[id] || this.mobs[id] || this.items[id] || this.npcs[id] || this.chests[id];
    },
    
    initializeMap: function() {
        try {
            this.map = new Map(this.config.map_filepath, this);
        } catch (error) {
            console.warn("Could not load map file, using default map");
            this.map = new Map(null, this);
        }
    },
    
    initializeAreas: function() {
        // Initialize game areas
        // Skip area initialization for now - will be handled by map system
    },
    
    initializeEntities: function() {
        // Initialize NPCs, mobs, chests, etc.
        this.spawnInitialEntities();
    },
    
    spawnInitialEntities: function() {
        // Skip initial entity spawning for now - server ready for connections
        console.log("BrowserQuest world initialized successfully - ready for player connections");
    },
    
    startGameLoop: function() {
        var self = this;
        
        this.gameLoopInterval = setInterval(function() {
            self.updateWorld();
        }, 1000 / 50); // 50 FPS
    },
    
    updateWorld: function() {
        var now = Date.now();
        var deltaTime = now - this.lastGameLoopTime;
        
        // Update mobs
        _.each(this.mobs, function(mob) {
            mob.update(deltaTime);
        });
        
        // Update players
        _.each(this.players, function(player) {
            player.update(deltaTime);
        });
        
        this.lastGameLoopTime = now;
    },
    
    shutdown: function() {
        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
        }
        
        if (this.httpServer) {
            this.httpServer.close();
        }
        
        console.info("World '" + this.id + "' shut down");
    },
    
    getPlayerCount: function() {
        return this.playerCount;
    },
    
    getUpTime: function() {
        return Date.now() - this.upTime;
    }
});

if (typeof exports !== 'undefined') {
    module.exports = WorldServer;
}
