var _ = require('underscore');
var Entity = require('./entity');
var Utils = require('./utils');

var Character = Entity.extend({
    init: function(id, type, world) {
        this._super(id, type, world);
        
        // Health
        this.hitPoints = 100;
        this.maxHitPoints = 100;
        
        // Combat
        this.attackRate = 1000; // milliseconds between attacks
        this.lastAttackTime = 0;
        this.target = null;
        this.attackers = [];
        
        // Movement
        this.moveSpeed = 150; // milliseconds per tile
        this.lastMoveTime = 0;
        this.isMoving = false;
        this.path = [];
        this.nextStep = null;
        this.moveCallback = null;
        
        // AI properties
        this.orientation = Utils.randomOrientation();
        
        // Combat state
        this.isDead = false;
    },
    
    receiveDamage: function(damage, attacker) {
        if (this.isDead) {
            return 0;
        }
        
        this.hitPoints -= damage;
        
        if (attacker && this.attackers.indexOf(attacker) === -1) {
            this.attackers.push(attacker);
        }
        
        if (this.hitPoints <= 0) {
            this.hitPoints = 0;
            this.die();
        }
        
        return damage;
    },
    
    heal: function(amount) {
        if (!this.isDead) {
            this.hitPoints = Math.min(this.hitPoints + amount, this.maxHitPoints);
        }
    },
    
    die: function() {
        this.isDead = true;
        this.hitPoints = 0;
        this.target = null;
        this.attackers = [];
        this.clearPath();
    },
    
    resurrect: function() {
        this.isDead = false;
        this.hitPoints = this.maxHitPoints;
        this.target = null;
        this.attackers = [];
    },
    
    canAttack: function(target) {
        if (this.isDead || !target || target.isDead) {
            return false;
        }
        
        var now = Date.now();
        if (now - this.lastAttackTime < this.attackRate) {
            return false;
        }
        
        return this.isAdjacentTo(target);
    },
    
    attack: function(target) {
        if (!this.canAttack(target)) {
            return false;
        }
        
        this.lastAttackTime = Date.now();
        this.target = target;
        this.turnTowards(target);
        
        return true;
    },
    
    addAttacker: function(character) {
        if (this.attackers.indexOf(character) === -1) {
            this.attackers.push(character);
        }
    },
    
    removeAttacker: function(character) {
        var index = this.attackers.indexOf(character);
        if (index !== -1) {
            this.attackers.splice(index, 1);
        }
    },
    
    clearAttackers: function() {
        this.attackers = [];
    },
    
    hasAttackers: function() {
        return this.attackers.length > 0;
    },
    
    turnTowards: function(entity) {
        var dx = entity.x - this.x;
        var dy = entity.y - this.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            this.orientation = dx > 0 ? Types.Orientations.RIGHT : Types.Orientations.LEFT;
        } else {
            this.orientation = dy > 0 ? Types.Orientations.DOWN : Types.Orientations.UP;
        }
    },
    
    setTarget: function(target) {
        this.target = target;
    },
    
    clearTarget: function() {
        this.target = null;
    },
    
    hasTarget: function() {
        return this.target !== null && !this.target.isDead;
    },
    
    moveTo: function(x, y, callback) {
        this.path = this.findPath(x, y);
        this.moveCallback = callback;
        
        if (this.path.length > 0) {
            this.isMoving = true;
            this.nextStep = this.path.shift();
        }
    },
    
    findPath: function(x, y) {
        // Simple pathfinding - just move directly
        // In a real implementation, use A* or similar
        var path = [];
        var currentX = this.x;
        var currentY = this.y;
        
        while (currentX !== x || currentY !== y) {
            if (currentX < x) currentX++;
            else if (currentX > x) currentX--;
            
            if (currentY < y) currentY++;
            else if (currentY > y) currentY--;
            
            path.push({ x: currentX, y: currentY });
        }
        
        return path;
    },
    
    move: function() {
        if (!this.isMoving || !this.nextStep) {
            return false;
        }
        
        var now = Date.now();
        if (now - this.lastMoveTime < this.moveSpeed) {
            return false;
        }
        
        this.setPosition(this.nextStep.x, this.nextStep.y);
        this.lastMoveTime = now;
        
        if (this.path.length > 0) {
            this.nextStep = this.path.shift();
        } else {
            this.isMoving = false;
            this.nextStep = null;
            
            if (this.moveCallback) {
                this.moveCallback();
                this.moveCallback = null;
            }
        }
        
        return true;
    },
    
    clearPath: function() {
        this.path = [];
        this.nextStep = null;
        this.isMoving = false;
        this.moveCallback = null;
    },
    
    stop: function() {
        this.clearPath();
    },
    
    getHealthPercentage: function() {
        return Math.round((this.hitPoints / this.maxHitPoints) * 100);
    },
    
    isHealthy: function() {
        return this.getHealthPercentage() === 100;
    },
    
    isAlmostDead: function() {
        return this.getHealthPercentage() <= 10;
    },
    
    update: function(deltaTime) {
        this._super(deltaTime);
        
        if (!this.isDead) {
            // Update movement
            if (this.isMoving) {
                this.move();
            }
            
            // Clean up dead attackers
            this.attackers = _.filter(this.attackers, function(attacker) {
                return !attacker.isDead;
            });
            
            // Clear target if dead
            if (this.target && this.target.isDead) {
                this.target = null;
            }
        }
    }
});

module.exports = Character;
