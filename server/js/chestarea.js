var cls = require('./lib/class'),
    _ = require('underscore'),
    Utils = require('./utils');

module.exports = ChestArea = cls.Class.extend({
    init: function(id, x, y, width, height, tx, ty, items, world) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.tx = tx;
        this.ty = ty;
        this.items = items;
        this.world = world;
        this.entities = [];
        this.hasCompletelyRespawned = true;
    },
    
    addToArea: function(chest) {
        chest.area = this;
        this.entities.push(chest);
        this.world.addItem(chest);
        
        if(this.entities.length === this.nb) {
            this.hasCompletelyRespawned = true;
        }
    },
    
    removeFromArea: function(chest) {
        var index = this.entities.indexOf(chest);
        if(index > -1) {
            this.entities.splice(index, 1);
        }
        this.hasCompletelyRespawned = false;
        
        if(this.isEmpty() && this.empty_callback) {
            this.empty_callback();
        }
    },
    
    isEmpty: function() {
        return this.entities.length === 0;
    },
    
    onEmpty: function(callback) {
        this.empty_callback = callback;
    },
    
    setNumberOfEntities: function(nb) {
        this.nb = nb;
    }
});