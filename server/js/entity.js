var _ = require('underscore');
var cls = require('./lib/class');

var Entity = cls.Class.extend({
    init: function(id, type, world) {
        this.id = id;
        this.type = type;
        this.world = world;
        
        // Position
        this.x = 0;
        this.y = 0;
        
        // State
        this.isDead = false;
        this.isVisible = true;
        
        // Timestamp
        this.createdTime = Date.now();
    },
    
    setPosition: function(x, y) {
        this.x = parseInt(x);
        this.y = parseInt(y);
    },
    
    getPosition: function() {
        return { x: this.x, y: this.y };
    },
    
    distanceTo: function(entity) {
        var dx = Math.abs(this.x - entity.x);
        var dy = Math.abs(this.y - entity.y);
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    isAdjacentTo: function(entity) {
        var dx = Math.abs(this.x - entity.x);
        var dy = Math.abs(this.y - entity.y);
        return (dx <= 1 && dy <= 1) && !(dx === 0 && dy === 0);
    },
    
    isNextTo: function(entity) {
        var dx = Math.abs(this.x - entity.x);
        var dy = Math.abs(this.y - entity.y);
        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    },
    
    hide: function() {
        this.isVisible = false;
    },
    
    show: function() {
        this.isVisible = true;
    },
    
    destroy: function() {
        this.isDead = true;
        this.isVisible = false;
    },
    
    getState: function() {
        return {
            id: this.id,
            type: this.type,
            x: this.x,
            y: this.y,
            isDead: this.isDead,
            isVisible: this.isVisible
        };
    },
    
    update: function(deltaTime) {
        // Override in subclasses
    },
    
    toString: function() {
        return this.type + " (" + this.id + ") at (" + this.x + ", " + this.y + ")";
    }
});

module.exports = Entity;
