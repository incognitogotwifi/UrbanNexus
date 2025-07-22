define([], function() {
    'use strict';
    
    var Area = function(id, x, y, width, height, world) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.world = world;
        
        this.entities = [];
        this.players = [];
        this.mobs = [];
        this.items = [];
        this.npcs = [];
        this.chests = [];
        
        this.isEmpty = true;
        this.hasPlayers = false;
        
        // Area-specific properties
        this.type = 'normal';
        this.dangerLevel = 1;
        this.musicTrack = null;
        this.pvpEnabled = false;
        
        // Spawning
        this.mobSpawns = [];
        this.npcSpawns = [];
        this.chestSpawns = [];
        
        // Combat
        this.combatAreas = [];
    };
    
    Area.prototype.contains = function(x, y) {
        return x >= this.x && x < this.x + this.width &&
               y >= this.y && y < this.y + this.height;
    };
    
    Area.prototype.containsEntity = function(entity) {
        return this.contains(entity.gridX, entity.gridY);
    };
    
    Area.prototype.addEntity = function(entity) {
        if (this.entities.indexOf(entity) === -1) {
            this.entities.push(entity);
            
            // Add to specific lists
            if (entity.type === 'player') {
                this.players.push(entity);
                this.hasPlayers = true;
            } else if (entity.type === 'mob') {
                this.mobs.push(entity);
            } else if (entity.type === 'item') {
                this.items.push(entity);
            } else if (entity.type === 'npc') {
                this.npcs.push(entity);
            } else if (entity.type === 'chest') {
                this.chests.push(entity);
            }
            
            this.isEmpty = false;
            entity.area = this;
        }
    };
    
    Area.prototype.removeEntity = function(entity) {
        var index = this.entities.indexOf(entity);
        if (index !== -1) {
            this.entities.splice(index, 1);
            
            // Remove from specific lists
            this.removeFromArray(this.players, entity);
            this.removeFromArray(this.mobs, entity);
            this.removeFromArray(this.items, entity);
            this.removeFromArray(this.npcs, entity);
            this.removeFromArray(this.chests, entity);
            
            if (entity.type === 'player') {
                this.hasPlayers = this.players.length > 0;
            }
            
            this.isEmpty = this.entities.length === 0;
            entity.area = null;
        }
    };
    
    Area.prototype.removeFromArray = function(array, entity) {
        var index = array.indexOf(entity);
        if (index !== -1) {
            array.splice(index, 1);
        }
    };
    
    Area.prototype.getEntitiesOfType = function(type) {
        switch (type) {
            case 'player':
                return this.players;
            case 'mob':
                return this.mobs;
            case 'item':
                return this.items;
            case 'npc':
                return this.npcs;
            case 'chest':
                return this.chests;
            default:
                return this.entities.filter(function(entity) {
                    return entity.type === type;
                });
        }
    };
    
    Area.prototype.getEntityById = function(id) {
        for (var i = 0; i < this.entities.length; i++) {
            if (this.entities[i].id === id) {
                return this.entities[i];
            }
        }
        return null;
    };
    
    Area.prototype.getEntitiesAroundPosition = function(x, y, radius) {
        var entities = [];
        
        for (var i = 0; i < this.entities.length; i++) {
            var entity = this.entities[i];
            var distance = Math.sqrt(
                Math.pow(entity.gridX - x, 2) + Math.pow(entity.gridY - y, 2)
            );
            
            if (distance <= radius) {
                entities.push(entity);
            }
        }
        
        return entities;
    };
    
    Area.prototype.getPlayersAroundPosition = function(x, y, radius) {
        var players = [];
        
        for (var i = 0; i < this.players.length; i++) {
            var player = this.players[i];
            var distance = Math.sqrt(
                Math.pow(player.gridX - x, 2) + Math.pow(player.gridY - y, 2)
            );
            
            if (distance <= radius) {
                players.push(player);
            }
        }
        
        return players;
    };
    
    Area.prototype.getMobsAroundPosition = function(x, y, radius) {
        var mobs = [];
        
        for (var i = 0; i < this.mobs.length; i++) {
            var mob = this.mobs[i];
            var distance = Math.sqrt(
                Math.pow(mob.gridX - x, 2) + Math.pow(mob.gridY - y, 2)
            );
            
            if (distance <= radius) {
                mobs.push(mob);
            }
        }
        
        return mobs;
    };
    
    Area.prototype.forEachEntity = function(callback) {
        for (var i = 0; i < this.entities.length; i++) {
            callback(this.entities[i]);
        }
    };
    
    Area.prototype.forEachPlayer = function(callback) {
        for (var i = 0; i < this.players.length; i++) {
            callback(this.players[i]);
        }
    };
    
    Area.prototype.update = function(time) {
        // Update all entities in this area
        for (var i = 0; i < this.entities.length; i++) {
            var entity = this.entities[i];
            if (entity.update) {
                entity.update(time);
            }
        }
        
        // Handle mob spawning
        this.handleMobSpawning();
        
        // Handle item cleanup
        this.handleItemCleanup();
    };
    
    Area.prototype.handleMobSpawning = function() {
        // Only spawn mobs if there are players in the area
        if (!this.hasPlayers) {
            return;
        }
        
        // Check each mob spawn point
        for (var i = 0; i < this.mobSpawns.length; i++) {
            var spawn = this.mobSpawns[i];
            
            if (this.shouldSpawnMob(spawn)) {
                this.spawnMob(spawn);
            }
        }
    };
    
    Area.prototype.shouldSpawnMob = function(spawn) {
        // Check if enough time has passed since last spawn
        var now = Date.now();
        if (now - spawn.lastSpawn < spawn.respawnTime) {
            return false;
        }
        
        // Check if there are already enough mobs of this type
        var mobsOfType = this.mobs.filter(function(mob) {
            return mob.mobType === spawn.type;
        });
        
        return mobsOfType.length < spawn.maxCount;
    };
    
    Area.prototype.spawnMob = function(spawn) {
        // This would typically be handled by the server
        // Client just needs to know about spawned mobs
        spawn.lastSpawn = Date.now();
    };
    
    Area.prototype.handleItemCleanup = function() {
        var now = Date.now();
        
        // Remove expired items
        for (var i = this.items.length - 1; i >= 0; i--) {
            var item = this.items[i];
            
            if (item.despawnTime && now > item.despawnTime) {
                this.removeEntity(item);
            }
        }
    };
    
    Area.prototype.addMobSpawn = function(type, x, y, respawnTime, maxCount) {
        this.mobSpawns.push({
            type: type,
            x: x,
            y: y,
            respawnTime: respawnTime || 30000, // 30 seconds default
            maxCount: maxCount || 1,
            lastSpawn: 0
        });
    };
    
    Area.prototype.addNpcSpawn = function(type, x, y) {
        this.npcSpawns.push({
            type: type,
            x: x,
            y: y
        });
    };
    
    Area.prototype.addChestSpawn = function(x, y, items, respawnTime) {
        this.chestSpawns.push({
            x: x,
            y: y,
            items: items || [],
            respawnTime: respawnTime || 300000, // 5 minutes default
            lastOpened: 0
        });
    };
    
    Area.prototype.setType = function(type) {
        this.type = type;
    };
    
    Area.prototype.setDangerLevel = function(level) {
        this.dangerLevel = level;
    };
    
    Area.prototype.setMusicTrack = function(track) {
        this.musicTrack = track;
    };
    
    Area.prototype.setPvpEnabled = function(enabled) {
        this.pvpEnabled = enabled;
    };
    
    Area.prototype.isInCombatArea = function(x, y) {
        for (var i = 0; i < this.combatAreas.length; i++) {
            var area = this.combatAreas[i];
            if (x >= area.x && x < area.x + area.width &&
                y >= area.y && y < area.y + area.height) {
                return true;
            }
        }
        return false;
    };
    
    Area.prototype.addCombatArea = function(x, y, width, height) {
        this.combatAreas.push({
            x: x,
            y: y,
            width: width,
            height: height
        });
    };
    
    Area.prototype.getPlayerCount = function() {
        return this.players.length;
    };
    
    Area.prototype.getMobCount = function() {
        return this.mobs.length;
    };
    
    Area.prototype.getItemCount = function() {
        return this.items.length;
    };
    
    Area.prototype.toString = function() {
        return 'Area(' + this.id + ') at (' + this.x + ',' + this.y + ') ' +
               this.width + 'x' + this.height + ' - ' + this.entities.length + ' entities';
    };
    
    return Area;
});

