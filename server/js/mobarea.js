var cls = require('./lib/class'),
    _ = require('underscore'),
    Utils = require('./utils');

module.exports = MobArea = cls.Class.extend({
    init: function(id, nb, kind, x, y, width, height, world) {
        this.id = id;
        this.nb = nb;
        this.kind = kind;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.world = world;
        this.entities = [];
        this.hasCompletelyRespawned = true;
    },
    
    spawnMobs: function() {
        for(var i = 0; i < this.nb; i++) {
            this.addToArea(this.createMobInsideArea());
        }
    },
    
    createMobInsideArea: function() {
        var pos = this.getRandomPositionInsideArea(),
            mob = new Mob('7' + this.id + '' + this.entities.length, this.kind, pos.x, pos.y);
        
        mob.area = this;
        mob.updateHitPoints();
        mob.onMove(this.world.onMobMoveCallback.bind(this.world));
        
        return mob;
    },
    
    addToArea: function(mob) {
        mob.area = this;
        this.entities.push(mob);
        this.world.addMob(mob);
        
        if(this.entities.length === this.nb) {
            this.hasCompletelyRespawned = true;
        }
    },
    
    removeFromArea: function(mob) {
        var index = this.entities.indexOf(mob);
        if(index > -1) {
            this.entities.splice(index, 1);
        }
        this.hasCompletelyRespawned = false;
        
        if(this.isEmpty() && this.empty_callback) {
            this.empty_callback();
        }
    },
    
    getRandomPositionInsideArea: function() {
        return {
            x: this.x + Utils.randomInt(0, this.width - 1),
            y: this.y + Utils.randomInt(0, this.height - 1)
        };
    },
    
    respawnMob: function(mob, delay) {
        var self = this;
        setTimeout(function() {
            var pos = self.getRandomPositionInsideArea();
            mob.x = pos.x;
            mob.y = pos.y;
            mob.isDead = false;
            self.addToArea(mob);
        }, delay);
    },
    
    isEmpty: function() {
        return this.entities.length === 0;
    },
    
    onEmpty: function(callback) {
        this.empty_callback = callback;
    }
});