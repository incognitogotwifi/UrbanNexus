define(['entity'], function(Entity) {
    'use strict';
    
    var Chest = function(id, game) {
        Entity.call(this, id, 'chest', game);
        
        this.isOpened = false;
        this.items = [];
        this.isClickable = true;
        
        this.setSprite('chest');
    };
    
    Chest.prototype = Object.create(Entity.prototype);
    Chest.prototype.constructor = Chest;
    
    Chest.prototype.open = function() {
        if (!this.isOpened) {
            this.isOpened = true;
            this.setSprite('chest_opened');
            
            // Spawn loot around the chest
            this.spawnLoot();
            
            return true;
        }
        return false;
    };
    
    Chest.prototype.spawnLoot = function() {
        // This would be handled by the server
        // Client just plays the opening animation
        this.animate('open', 150, 1);
    };
    
    Chest.prototype.setItems = function(items) {
        this.items = items || [];
    };
    
    Chest.prototype.isEmpty = function() {
        return this.items.length === 0;
    };
    
    return Chest;
});
