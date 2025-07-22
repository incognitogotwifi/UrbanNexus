define([], function() {
    'use strict';
    
    var Player = function(id, type, x, y) {
        this.id = id;
        this.type = type || 'player';
        this.x = x || 0;
        this.y = y || 0;
        this.name = 'Player';
        this.hitPoints = 100;
        this.maxHitPoints = 100;
        this.level = 1;
        this.experience = 0;
        
        console.log('Player created:', this.id);
    };
    
    Player.prototype.setPosition = function(x, y) {
        this.x = x;
        this.y = y;
    };
    
    return Player;
});