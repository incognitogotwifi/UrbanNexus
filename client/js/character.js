define(['entity'], function(Entity) {
    'use strict';
    
    var Character = function(id, type, game) {
        Entity.call(this, id, type, game);
        
        this.orientation = 'down';
        this.walkSpeed = 100;
        this.attackRate = 800;
        this.lastAttack = 0;
        
        this.hitPoints = 0;
        this.maxHitPoints = 0;
        
        this.target = null;
        this.attackers = [];
        
        this.isDead = false;
        this.deathTime = 0;
        
        // Pathfinding
        this.path = null;
        this.newDestination = null;
        
        // Equipment (for display purposes)
        this.weapon = null;
        this.armor = null;
        
        // Combat
        this.lastHurt = 0;
        
        this.isClickable = true;
    };
    
    Character.prototype = Object.create(Entity.prototype);
    Character.prototype.constructor = Character;
    
    Character.prototype.moveTo = function(x, y) {
        this.newDestination = {x: x, y: y};
        this.calculatePath(x, y);
    };
    
    Character.prototype.calculatePath = function(x, y) {
        var self = this;
        
        // Simple pathfinding - just move directly for now
        // In a real implementation, this would use A* or similar
        var path = [];
        var dx = x - this.gridX;
        var dy = y - this.gridY;
        
        var stepX = dx > 0 ? 1 : (dx < 0 ? -1 : 0);
        var stepY = dy > 0 ? 1 : (dy < 0 ? -1 : 0);
        
        var currentX = this.gridX;
        var currentY = this.gridY;
        
        while (currentX !== x || currentY !== y) {
            if (currentX !== x) {
                currentX += stepX;
            }
            if (currentY !== y) {
                currentY += stepY;
            }
            
            // Check if position is walkable
            if (this.game.map && this.game.map.isColliding(currentX, currentY)) {
                break; // Stop if we hit an obstacle
            }
            
            path.push([currentX, currentY]);
        }
        
        this.followPath(path);
        this.updateOrientation();
    };
    
    Character.prototype.updateOrientation = function() {
        if (this.currentPath && this.currentPath.length > 0) {
            var next = this.currentPath[0];
            var dx = next[0] - this.gridX;
            var dy = next[1] - this.gridY;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                this.orientation = dx > 0 ? 'right' : 'left';
                this.flipSpriteX = dx < 0;
            } else {
                this.orientation = dy > 0 ? 'down' : 'up';
                this.flipSpriteX = false;
            }
        }
    };
    
    Character.prototype.nextStep = function() {
        if (this.currentPath && this.currentPath.length > 0) {
            return this.currentPath[0];
        }
        return null;
    };
    
    Character.prototype.isMovingTowards = function(entity) {
        if (!this.newDestination) {
            return false;
        }
        return this.newDestination.x === entity.gridX && 
               this.newDestination.y === entity.gridY;
    };
    
    Character.prototype.canReachTarget = function() {
        if (!this.target) {
            return false;
        }
        return this.getDistance(this.target) <= 1;
    };
    
    Character.prototype.die = function() {
        this.isDead = true;
        this.deathTime = Date.now();
        this.stop();
        
        if (this.deathCallback) {
            this.deathCallback();
        }
    };
    
    Character.prototype.hurt = function(damage) {
        this.hitPoints -= damage;
        this.lastHurt = Date.now();
        
        if (this.hitPoints <= 0) {
            this.die();
        }
        
        // Show hurt animation
        this.animate('hurt', 150, 1);
    };
    
    Character.prototype.heal = function(amount) {
        if (!this.isDead) {
            this.hitPoints = Math.min(this.hitPoints + amount, this.maxHitPoints);
        }
    };
    
    Character.prototype.teleport = function(x, y) {
        this.stop();
        this.setGridPosition(x, y);
        this.dirty = true;
    };
    
    Character.prototype.lookAtEntity = function(entity) {
        Entity.prototype.lookAtEntity.call(this, entity);
        
        if (entity.gridX > this.gridX) {
            this.orientation = 'right';
        } else if (entity.gridX < this.gridX) {
            this.orientation = 'left';
        } else if (entity.gridY > this.gridY) {
            this.orientation = 'down';
        } else if (entity.gridY < this.gridY) {
            this.orientation = 'up';
        }
    };
    
    Character.prototype.getHealthPercentage = function() {
        return Math.round((this.hitPoints / this.maxHitPoints) * 100);
    };
    
    Character.prototype.setTarget = function(entity) {
        if (this.target !== entity) {
            this.target = entity;
        }
    };
    
    Character.prototype.clearTarget = function() {
        this.target = null;
    };
    
    Character.prototype.hasTarget = function() {
        return this.target !== null;
    };
    
    Character.prototype.addAttacker = function(character) {
        if (this.attackers.indexOf(character) === -1) {
            this.attackers.push(character);
        }
    };
    
    Character.prototype.removeAttacker = function(character) {
        var index = this.attackers.indexOf(character);
        if (index !== -1) {
            this.attackers.splice(index, 1);
        }
    };
    
    Character.prototype.clearAttackers = function() {
        this.attackers = [];
    };
    
    Character.prototype.hasAttackers = function() {
        return this.attackers.length > 0;
    };
    
    Character.prototype.getAttackerCount = function() {
        return this.attackers.length;
    };
    
    Character.prototype.canAttack = function(time) {
        return (time - this.lastAttack) >= this.attackRate;
    };
    
    Character.prototype.attack = function() {
        this.lastAttack = Date.now();
        
        if (this.target) {
            this.lookAtEntity(this.target);
        }
        
        this.animate('atk', 150, 1);
    };
    
    Character.prototype.performHealthCheck = function() {
        if (this.hitPoints <= 0 && !this.isDead) {
            this.die();
        }
    };
    
    Character.prototype.resetHealthCheck = function() {
        this.hitPoints = this.maxHitPoints;
        this.isDead = false;
    };
    
    Character.prototype.update = function(time) {
        Entity.prototype.update.call(this, time);
        
        // Update walking animation
        if (this.isMoving && !this.currentAnimation) {
            this.animate('walk_' + this.orientation, 100, 0);
        } else if (!this.isMoving && this.currentAnimation && 
                   this.currentAnimation.name.indexOf('walk') === 0) {
            this.currentAnimation = null;
        }
        
        // Health check
        this.performHealthCheck();
    };
    
    return Character;
});
