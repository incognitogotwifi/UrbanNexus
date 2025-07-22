define(['../shared/js/gametypes', '../shared/js/messages'], function(Types, Messages) {
    'use strict';
    
    var GameClient = function(game) {
        this.game = game;
        this.connection = null;
        this.connected = false;
        this.connecting = false;
        
        this.playerId = null;
        this.playerName = null;
        
        // Connection settings
        this.host = '0.0.0.0';
        this.port = 8000;
        this.secure = false;
        
        // Callbacks
        this.onConnected = null;
        this.onDisconnected = null;
        this.onMessage = null;
        this.onError = null;
        
        // Message handlers
        this.messageHandlers = {};
        this.initializeMessageHandlers();
        
        // Heartbeat
        this.lastHeartbeat = 0;
        this.heartbeatInterval = null;
        
        // Message queue for when disconnected
        this.messageQueue = [];
        this.maxQueueSize = 100;
    };
    
    GameClient.prototype.initializeMessageHandlers = function() {
        var self = this;
        
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
        
        this.messageHandlers[Messages.LOOTMOVE] = function(message) {
            self.handleLootMove(message);
        };
        
        this.messageHandlers[Messages.AGGRO] = function(message) {
            self.handleAggro(message);
        };
        
        this.messageHandlers[Messages.ATTACK] = function(message) {
            self.handleAttack(message);
        };
        
        this.messageHandlers[Messages.HIT] = function(message) {
            self.handleHit(message);
        };
        
        this.messageHandlers[Messages.HURT] = function(message) {
            self.handleHurt(message);
        };
        
        this.messageHandlers[Messages.HEALTH] = function(message) {
            self.handleHealth(message);
        };
        
        this.messageHandlers[Messages.CHAT] = function(message) {
            self.handleChat(message);
        };
        
        this.messageHandlers[Messages.EQUIP] = function(message) {
            self.handleEquip(message);
        };
        
        this.messageHandlers[Messages.DROP] = function(message) {
            self.handleDrop(message);
        };
        
        this.messageHandlers[Messages.TELEPORT] = function(message) {
            self.handleTeleport(message);
        };
        
        this.messageHandlers[Messages.DAMAGE] = function(message) {
            self.handleDamage(message);
        };
        
        this.messageHandlers[Messages.POPULATION] = function(message) {
            self.handlePopulation(message);
        };
        
        this.messageHandlers[Messages.KILL] = function(message) {
            self.handleKill(message);
        };
        
        this.messageHandlers[Messages.LIST] = function(message) {
            self.handleList(message);
        };
        
        this.messageHandlers[Messages.WHO] = function(message) {
            self.handleWho(message);
        };
        
        this.messageHandlers[Messages.ZONE] = function(message) {
            self.handleZone(message);
        };
        
        this.messageHandlers[Messages.DESTROY] = function(message) {
            self.handleDestroy(message);
        };
        
        this.messageHandlers[Messages.HP] = function(message) {
            self.handleHP(message);
        };
        
        this.messageHandlers[Messages.BLINK] = function(message) {
            self.handleBlink(message);
        };
    };
    
    GameClient.prototype.connect = function(playerName) {
        if (this.connecting || this.connected) {
            return;
        }
        
        this.playerName = playerName;
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
        
        // Send hello message
        this.sendHello();
        
        // Start heartbeat
        this.startHeartbeat();
        
        // Process queued messages
        this.processMessageQueue();
        
        if (this.onConnected) {
            this.onConnected();
        }
    };
    
    GameClient.prototype.handleConnectionClose = function(event) {
        console.log('Disconnected from game server');
        this.connected = false;
        this.connecting = false;
        
        // Stop heartbeat
        this.stopHeartbeat();
        
        if (this.onDisconnected) {
            this.onDisconnected(event);
        }
        
        // Attempt to reconnect after a delay
        setTimeout(this.reconnect.bind(this), 3000);
    };
    
    GameClient.prototype.handleConnectionError = function(error) {
        console.error('Connection error:', error);
        this.connected = false;
        this.connecting = false;
        
        if (this.onError) {
            this.onError(error);
        }
    };
    
    GameClient.prototype.handleMessage = function(data) {
        try {
            var message = JSON.parse(data);
            
            if (this.onMessage) {
                this.onMessage(message);
            }
            
            // Handle message based on type
            var handler = this.messageHandlers[message[0]];
            if (handler) {
                handler(message);
            } else {
                console.warn('Unhandled message type:', message[0]);
            }
        } catch (e) {
            console.error('Error parsing message:', e);
        }
    };
    
    GameClient.prototype.sendMessage = function(message) {
        if (this.connected && this.connection.readyState === WebSocket.OPEN) {
            try {
                this.connection.send(JSON.stringify(message));
                return true;
            } catch (e) {
                console.error('Error sending message:', e);
                return false;
            }
        } else {
            // Queue message for later
            if (this.messageQueue.length < this.maxQueueSize) {
                this.messageQueue.push(message);
            }
            return false;
        }
    };
    
    GameClient.prototype.processMessageQueue = function() {
        while (this.messageQueue.length > 0 && this.connected) {
            var message = this.messageQueue.shift();
            this.sendMessage(message);
        }
    };
    
    GameClient.prototype.sendHello = function() {
        this.sendMessage([Messages.HELLO, this.playerName]);
    };
    
    GameClient.prototype.sendMove = function(x, y) {
        this.sendMessage([Messages.MOVE, x, y]);
    };
    
    GameClient.prototype.sendLoot = function(itemId) {
        this.sendMessage([Messages.LOOT, itemId]);
    };
    
    GameClient.prototype.sendAttack = function(mobId) {
        this.sendMessage([Messages.ATTACK, mobId]);
    };
    
    GameClient.prototype.sendHit = function(mobId) {
        this.sendMessage([Messages.HIT, mobId]);
    };
    
    GameClient.prototype.sendHurt = function(mobId) {
        this.sendMessage([Messages.HURT, mobId]);
    };
    
    GameClient.prototype.sendChat = function(message) {
        this.sendMessage([Messages.CHAT, message]);
    };
    
    GameClient.prototype.sendTalk = function(npcId) {
        this.sendMessage([Messages.TALK, npcId]);
    };
    
    GameClient.prototype.sendWho = function() {
        this.sendMessage([Messages.WHO]);
    };
    
    GameClient.prototype.sendZone = function() {
        this.sendMessage([Messages.ZONE]);
    };
    
    GameClient.prototype.sendOpen = function(chestId) {
        this.sendMessage([Messages.OPEN, chestId]);
    };
    
    GameClient.prototype.sendCheck = function(id) {
        this.sendMessage([Messages.CHECK, id]);
    };
    
    GameClient.prototype.sendAggro = function(mobId) {
        this.sendMessage([Messages.AGGRO, mobId]);
    };
    
    GameClient.prototype.sendPing = function(startTime) {
        this.sendMessage([Messages.PING, startTime]);
    };
    
    GameClient.prototype.sendSuicide = function() {
        this.sendMessage([Messages.SUICIDE]);
    };
    
    // Message handlers
    GameClient.prototype.handleWelcome = function(message) {
        this.playerId = message[1];
        var x = message[2];
        var y = message[3];
        var hitPoints = message[4];
        
        // Create player
        var player = this.game.createPlayer(this.playerId, this.playerName);
        player.setGridPosition(x, y);
        player.hitPoints = hitPoints;
        player.maxHitPoints = hitPoints;
        
        this.game.player = player;
        this.game.addEntity(player);
        
        console.log('Player spawned at', x, y);
    };
    
    GameClient.prototype.handleSpawn = function(message) {
        var id = message[1];
        var type = message[2];
        var x = message[3];
        var y = message[4];
        var name = message[5];
        
        var entity = this.game.createEntity(id, type, name);
        if (entity) {
            entity.setGridPosition(x, y);
            this.game.addEntity(entity);
        }
    };
    
    GameClient.prototype.handleDespawn = function(message) {
        var id = message[1];
        this.game.removeEntity(id);
    };
    
    GameClient.prototype.handleMove = function(message) {
        var id = message[1];
        var x = message[2];
        var y = message[3];
        
        var entity = this.game.getEntityById(id);
        if (entity) {
            entity.moveTo(x, y);
        }
    };
    
    GameClient.prototype.handleLootMove = function(message) {
        var id = message[1];
        var itemId = message[2];
        
        var entity = this.game.getEntityById(id);
        var item = this.game.getEntityById(itemId);
        
        if (entity && item) {
            entity.moveTo(item.gridX, item.gridY);
        }
    };
    
    GameClient.prototype.handleAggro = function(message) {
        var mobId = message[1];
        var playerId = message[2];
        
        var mob = this.game.getEntityById(mobId);
        var player = this.game.getEntityById(playerId);
        
        if (mob && player) {
            mob.setTarget(player);
            player.addAttacker(mob);
        }
    };
    
    GameClient.prototype.handleAttack = function(message) {
        var attackerId = message[1];
        var targetId = message[2];
        
        var attacker = this.game.getEntityById(attackerId);
        var target = this.game.getEntityById(targetId);
        
        if (attacker && target) {
            attacker.lookAtEntity(target);
            attacker.animate('atk', 150, 1);
        }
    };
    
    GameClient.prototype.handleHit = function(message) {
        var attackerId = message[1];
        var targetId = message[2];
        var damage = message[3];
        
        var target = this.game.getEntityById(targetId);
        if (target) {
            target.hurt(damage);
            
            // Play sound effects
            if (this.game.audioManager) {
                this.game.audioManager.handlePlayerHurt(target);
            }
        }
    };
    
    GameClient.prototype.handleHurt = function(message) {
        var id = message[1];
        var entity = this.game.getEntityById(id);
        
        if (entity) {
            entity.animate('hurt', 150, 1);
        }
    };
    
    GameClient.prototype.handleHealth = function(message) {
        var id = message[1];
        var hitPoints = message[2];
        var maxHitPoints = message[3];
        
        var entity = this.game.getEntityById(id);
        if (entity) {
            entity.hitPoints = hitPoints;
            entity.maxHitPoints = maxHitPoints;
        }
    };
    
    GameClient.prototype.handleChat = function(message) {
        var id = message[1];
        var text = message[2];
        
        var entity = this.game.getEntityById(id);
        if (entity && this.game.chatHandler) {
            this.game.chatHandler.addPlayerMessage(entity.name || 'Player', text);
            
            // Show speech bubble
            this.game.createBubble(entity, text);
        }
    };
    
    GameClient.prototype.handleEquip = function(message) {
        var id = message[1];
        var itemName = message[2];
        
        var entity = this.game.getEntityById(id);
        if (entity && entity.setEquipment) {
            entity.setEquipment(itemName);
        }
    };
    
    GameClient.prototype.handleDrop = function(message) {
        var id = message[1];
        var itemId = message[2];
        var itemType = message[3];
        var x = message[4];
        var y = message[5];
        
        var item = this.game.createItem(itemId, itemType);
        if (item) {
            item.setGridPosition(x, y);
            this.game.addEntity(item);
        }
    };
    
    GameClient.prototype.handleTeleport = function(message) {
        var id = message[1];
        var x = message[2];
        var y = message[3];
        
        var entity = this.game.getEntityById(id);
        if (entity) {
            entity.teleport(x, y);
        }
    };
    
    GameClient.prototype.handleDamage = function(message) {
        var id = message[1];
        var damage = message[2];
        
        var entity = this.game.getEntityById(id);
        if (entity) {
            // Show damage number
            this.game.showDamageNumber(entity, damage);
        }
    };
    
    GameClient.prototype.handlePopulation = function(message) {
        var worldPlayers = message[1];
        var totalPlayers = message[2];
        
        this.game.updatePopulation(worldPlayers, totalPlayers);
    };
    
    GameClient.prototype.handleKill = function(message) {
        var mobType = message[1];
        
        if (this.game.player) {
            this.game.player.addKill(mobType);
        }
    };
    
    GameClient.prototype.handleList = function(message) {
        var list = message[1];
        
        if (this.game.chatHandler) {
            this.game.chatHandler.handleWhoResponse(list);
        }
    };
    
    GameClient.prototype.handleWho = function(message) {
        var players = message[1];
        
        if (this.game.chatHandler) {
            this.game.chatHandler.handleWhoResponse(players);
        }
    };
    
    GameClient.prototype.handleZone = function(message) {
        var id = message[1];
        var zoneName = message[2];
        
        var entity = this.game.getEntityById(id);
        if (entity) {
            entity.zone = zoneName;
        }
    };
    
    GameClient.prototype.handleDestroy = function(message) {
        var id = message[1];
        this.game.removeEntity(id);
    };
    
    GameClient.prototype.handleHP = function(message) {
        var id = message[1];
        var hitPoints = message[2];
        
        var entity = this.game.getEntityById(id);
        if (entity) {
            entity.hitPoints = hitPoints;
        }
    };
    
    GameClient.prototype.handleBlink = function(message) {
        var id = message[1];
        
        var entity = this.game.getEntityById(id);
        if (entity) {
            entity.blink(150);
        }
    };
    
    GameClient.prototype.startHeartbeat = function() {
        var self = this;
        this.heartbeatInterval = setInterval(function() {
            if (self.connected) {
                self.sendMessage([Messages.PING, Date.now()]);
            }
        }, 30000); // 30 seconds
    };
    
    GameClient.prototype.stopHeartbeat = function() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    };
    
    GameClient.prototype.reconnect = function() {
        if (!this.connected && !this.connecting) {
            console.log('Attempting to reconnect...');
            this.connect(this.playerName);
        }
    };
    
    GameClient.prototype.disconnect = function() {
        this.stopHeartbeat();
        
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
        
        this.connected = false;
        this.connecting = false;
    };
    
    GameClient.prototype.isConnected = function() {
        return this.connected;
    };
    
    return GameClient;
});
