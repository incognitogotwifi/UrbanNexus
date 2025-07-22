define(['character'], function(Character) {
    'use strict';
    
    var Mob = function(id, type, game) {
        Character.call(this, id, 'mob', game);
        
        this.mobType = type;
        this.aggroRange = 3;
        this.isAggressive = false;
        
        // Mob specific properties
        this.attackRate = 1000;
        this.walkSpeed = 150;
        this.returnTimeout = null;
        
        // Spawn position (for returning)
        this.spawnX = 0;
        this.spawnY = 0;
        
        // Roaming
        this.roamingDistance = 3;
        this.lastRoamTime = 0;
        this.roamingInterval = 5000;
        
        this.isClickable = true;
    };
    
    Mob.prototype = Object.create(Character.prototype);
    Mob.prototype.constructor = Mob;
    
    Mob.prototype.setSpawnPosition = function(x, y) {
        this.spawnX = x;
        this.spawnY = y;
    };
    
    Mob.prototype.receiveDamage = function(points, playerId) {
        this.hitPoints -= points;
        
        if (this.hitPoints <= 0) {
            this.isDead = true;
            this.die();
        }
        
        return this.hitPoints;
    };
    
    Mob.prototype.die = function() {
        Character.prototype.die.call(this);
        
        this.animate('death', 120, 1, function() {
            // Fade out after death animation
            this.fade();
        }.bind(this));
    };
    
    Mob.prototype.returnToSpawn = function() {
        if (this.spawnX !== undefined && this.spawnY !== undefined) {
            this.clearTarget();
            this.clearAttackers();
            this.moveTo(this.spawnX, this.spawnY);
        }
    };
    
    Mob.prototype.roam = function() {
        var now = Date.now();
        if (now - this.lastRoamTime < this.roamingInterval) {
            return;
        }
        
        this.lastRoamTime = now;
        
        // Pick a random position within roaming distance
        var dx = Math.floor(Math.random() * this.roamingDistance * 2) - this.roamingDistance;
        var dy = Math.floor(Math.random() * this.roamingDistance * 2) - this.roamingDistance;
        
        var targetX = this.spawnX + dx;
        var targetY = this.spawnY + dy;
        
        // Make sure the position is valid
        if (this.game.map && !this.game.map.isColliding(targetX, targetY)) {
            this.moveTo(targetX, targetY);
        }
    };
    
    Mob.prototype.aggro = function(player) {
        if (!this.isAggressive || this.isDead) {
            return false;
        }
        
        var distance = this.getDistance(player);
        return distance <= this.aggroRange;
    };
    
    Mob.prototype.canAttack = function(time) {
        return Character.prototype.canAttack.call(this, time) && this.canReachTarget();
    };
    
    Mob.prototype.attack = function() {
        if (!this.target) {
            return null;
        }
        
        Character.prototype.attack.call(this);
        
        // Calculate damage
        var damage = this.getDamage();
        return damage;
    };
    
    Mob.prototype.getDamage = function() {
        // Base damage calculation - can be overridden by specific mob types
        return Math.floor(Math.random() * 10) + 5;
    };
    
    Mob.prototype.update = function(time) {
        Character.prototype.update.call(this, time);
        
        if (this.isDead) {
            return;
        }
        
        // AI behavior
        if (this.hasTarget()) {
            // Chase target if it's too far away
            var distance = this.getDistance(this.target);
            if (distance > 7) {
                // Target is too far, return to spawn
                this.returnToSpawn();
            } else if (!this.isMoving && this.canAttack(time)) {
                // Attack if in range
                this.attack();
            } else if (!this.isMovingTowards(this.target)) {
                // Move towards target
                this.moveTo(this.target.gridX, this.target.gridY);
            }
        } else {
            // No target, roam around spawn point
            if (!this.isMoving) {
                this.roam();
            }
            
            // Check for nearby players to aggro
            if (this.isAggressive) {
                this.checkForTargets();
            }
        }
    };
    
    Mob.prototype.checkForTargets = function() {
        if (!this.game.players) {
            return;
        }
        
        for (var i = 0; i < this.game.players.length; i++) {
            var player = this.game.players[i];
            if (!player.isDead && this.aggro(player)) {
                this.setTarget(player);
                player.addAttacker(this);
                break;
            }
        }
    };
    
    Mob.prototype.onMove = function() {
        Character.prototype.onMove.call(this);
        
        // Check if we've reached our spawn position
        if (this.gridX === this.spawnX && this.gridY === this.spawnY) {
            // Reset health when returning to spawn
            if (this.hitPoints < this.maxHitPoints) {
                this.hitPoints = this.maxHitPoints;
            }
        }
    };
    
    // Specific mob types
    var Rat = function(id, game) {
        Mob.call(this, id, 'rat', game);
        this.setSprite('rat');
        this.hitPoints = this.maxHitPoints = 25;
        this.attackRate = 800;
        this.walkSpeed = 200;
        this.isAggressive = true;
        this.aggroRange = 2;
    };
    Rat.prototype = Object.create(Mob.prototype);
    Rat.prototype.constructor = Rat;
    
    var Skeleton = function(id, game) {
        Mob.call(this, id, 'skeleton', game);
        this.setSprite('skeleton');
        this.hitPoints = this.maxHitPoints = 110;
        this.attackRate = 1000;
        this.walkSpeed = 120;
        this.isAggressive = true;
        this.aggroRange = 3;
    };
    Skeleton.prototype = Object.create(Mob.prototype);
    Skeleton.prototype.constructor = Skeleton;
    
    var Goblin = function(id, game) {
        Mob.call(this, id, 'goblin', game);
        this.setSprite('goblin');
        this.hitPoints = this.maxHitPoints = 90;
        this.attackRate = 900;
        this.walkSpeed = 150;
        this.isAggressive = true;
        this.aggroRange = 2;
    };
    Goblin.prototype = Object.create(Mob.prototype);
    Goblin.prototype.constructor = Goblin;
    
    var Ogre = function(id, game) {
        Mob.call(this, id, 'ogre', game);
        this.setSprite('ogre');
        this.hitPoints = this.maxHitPoints = 200;
        this.attackRate = 1200;
        this.walkSpeed = 100;
        this.isAggressive = true;
        this.aggroRange = 4;
    };
    Ogre.prototype = Object.create(Mob.prototype);
    Ogre.prototype.constructor = Ogre;
    
    var Spectre = function(id, game) {
        Mob.call(this, id, 'spectre', game);
        this.setSprite('spectre');
        this.hitPoints = this.maxHitPoints = 250;
        this.attackRate = 900;
        this.walkSpeed = 180;
        this.isAggressive = true;
        this.aggroRange = 5;
    };
    Spectre.prototype = Object.create(Mob.prototype);
    Spectre.prototype.constructor = Spectre;
    
    // Factory function
    Mob.create = function(id, type, game) {
        switch (type) {
            case 'rat':
                return new Rat(id, game);
            case 'skeleton':
                return new Skeleton(id, game);
            case 'goblin':
                return new Goblin(id, game);
            case 'ogre':
                return new Ogre(id, game);
            case 'spectre':
                return new Spectre(id, game);
            default:
                return new Mob(id, type, game);
        }
    };
    
    return Mob;
});
