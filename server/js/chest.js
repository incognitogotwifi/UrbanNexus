var _ = require('underscore');
var Entity = require('./entity');
var Types = require('../shared/js/gametypes');

var Chest = Entity.extend({
    init: function(id, world) {
        this._super(id, 'chest', world);
        
        this.type = 'chest';
        this.isOpened = false;
        this.items = [];
        this.respawnTime = 300000; // 5 minutes
        this.lastOpenTime = 0;
        
        // Load chest contents
        this.loadContents();
    },
    
    loadContents: function() {
        // Define possible chest contents
        var possibleItems = [
            { type: Types.Entities.SWORD1, chance: 0.3 },
            { type: Types.Entities.SWORD2, chance: 0.2 },
            { type: Types.Entities.AXE, chance: 0.2 },
            { type: Types.Entities.LEATHERARMOR, chance: 0.3 },
            { type: Types.Entities.MAILARMOR, chance: 0.2 },
            { type: Types.Entities.FLASK, chance: 0.5 },
            { type: Types.Entities.BURGER, chance: 0.3 },
            { type: Types.Entities.CAKE, chance: 0.4 }
        ];
        
        // Generate random contents
        this.items = [];
        var numItems = 1 + Math.floor(Math.random() * 3); // 1-3 items
        
        for (var i = 0; i < numItems; i++) {
            var item = this.getRandomItem(possibleItems);
            if (item) {
                this.items.push(item);
            }
        }
    },
    
    getRandomItem: function(possibleItems) {
        var validItems = _.filter(possibleItems, function(item) {
            return Math.random() < item.chance;
        });
        
        if (validItems.length === 0) {
            return null;
        }
        
        return validItems[Math.floor(Math.random() * validItems.length)].type;
    },
    
    open: function(player) {
        if (this.isOpened || !this.canOpen(player)) {
            return false;
        }
        
        this.isOpened = true;
        this.lastOpenTime = Date.now();
        
        // Spawn items around the chest
        this.spawnItems();
        
        // Schedule respawn
        this.scheduleRespawn();
        
        return true;
    },
    
    canOpen: function(player) {
        if (this.isOpened) {
            return false;
        }
        
        // Check if player is adjacent
        return this.isAdjacentTo(player);
    },
    
    spawnItems: function() {
        var self = this;
        
        _.each(this.items, function(itemType, index) {
            // Spawn items around the chest
            var positions = [
                { x: self.x - 1, y: self.y },
                { x: self.x + 1, y: self.y },
                { x: self.x, y: self.y - 1 },
                { x: self.x, y: self.y + 1 },
                { x: self.x - 1, y: self.y - 1 },
                { x: self.x + 1, y: self.y - 1 },
                { x: self.x - 1, y: self.y + 1 },
                { x: self.x + 1, y: self.y + 1 }
            ];
            
            var position = positions[index % positions.length];
            
            // Make sure position is valid
            if (self.world.isValidPosition(position.x, position.y)) {
                var item = self.world.createItem(itemType, position.x, position.y);
                self.world.items[item.id] = item;
                self.world.broadcast([Messages.SPAWN, item.id, item.type, item.x, item.y]);
            }
        });
    },
    
    scheduleRespawn: function() {
        var self = this;
        
        setTimeout(function() {
            self.respawn();
        }, this.respawnTime);
    },
    
    respawn: function() {
        this.isOpened = false;
        this.loadContents();
        
        // Notify players that chest has respawned
        this.world.broadcast([Messages.SPAWN, this.id, this.type, this.x, this.y]);
    },
    
    canRespawn: function() {
        return this.isOpened && (Date.now() - this.lastOpenTime >= this.respawnTime);
    },
    
    getState: function() {
        var state = this._super();
        state.isOpened = this.isOpened;
        state.items = this.items.slice();
        return state;
    },
    
    update: function(deltaTime) {
        this._super(deltaTime);
        
        // Chests don't need regular updates, respawning is handled by timer
    }
});

module.exports = Chest;
