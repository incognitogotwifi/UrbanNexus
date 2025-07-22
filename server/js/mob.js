var _ = require('underscore');
var Character = require('./character');
var Types = require('../shared/js/gametypes');
var Properties = require('./properties');
var Formulas = require('./formulas');
var Utils = require('./utils');

var Mob = Character.extend({
    init: function(id, type, world) {
        this._super(id, type, world);
        
        this.mobType = type;
        this.type = 'mob';
        
        // Spawn information
        this.spawnX = 0;
        this.spawnY = 0;
        this.maxDistanceFromSpawn = 7;
        
        // AI properties
        this.aggroRange = 3;
        this.isAggressive = true;
        this.roamDistance = 3;
        this.returnDistance = 15;
        
        // Movement
        this.moveSpeed = 800;
        this.walkSpeed = 200;
        this.idleSpeed = 700;
        this.lastRoamTime = 0;
        this.roamingInterval = 5000;
        
        // Combat
        this.attackRate = 1000;
        this.attackRange = 1;
        
        // Respawn
        this.respawnTime = 30000; // 30 seconds
        
        // Loot
        this.drops = [];
        
        // Load mob properties
        this.loadProperties();
    },
    
    loadProperties: function() {
        var props = Properties.getMobProperties(this.mobType);
        
        if (props) {
            this.hitPoints = props.hitPoints;
            this.maxHitPoints = props.hitPoints;
            this.attackRate = props.attackRate || 1000;
            this.moveSpeed = props.moveSpeed || 800;
            this.aggroRange = props.aggroRange || 3;
            this.isAggressive = props.isAggressive !== false;
            this.drops = props.drops || [];
            this.respawnTime = props.respawnTime || 30000;
        }
    },
    
    spawn: function(x, y) {
        this.setPosition(x, y);
        this.spawnX = x;
        this.spawnY = y;
        this.isDead = false;
        this.hitPoints = this.maxHitPoints;
        this.target = null;
        this.attackers = [];
    },
    
    receiveDamage: function(damage, attacker) {
        this._super(damage, attacker);
        
        // Aggro the attacker
        if (attacker && attacker.type === 'player') {
            this.aggro(attacker);
        }
        
        return damage;
    },
    
    die: function() {
        this._super();
        
        // Award experience to attackers
        this.rewardAttackers();
        
        // Drop loot
        this.dropLoot();
        
        // Schedule respawn
        this.scheduleRespawn();
    },
    
    rewardAttackers: function() {
        var exp = this.getExperienceReward();
        
        _.each(this.attackers, function(attacker) {
            if (attacker.type === 'player' && !attacker.isDead) {
                attacker.gainExperience(Math.floor(exp / this.attackers.length));
                attacker.addKill(this.mobType);
            }
        }, this);
    },
    
    getExperienceReward: function() {
        return Formulas.getMobExperience(this.mobType);
    },
    
    dropLoot: function() {
        if (this.drops.length === 0) {
            return;
        }
        
        var drop = Utils.randomChoice(this.drops);
        if (drop && Math.random() < drop.chance) {
            var item = this.world.createItem(drop.type, this.x, this.y);
            this.world.items[item.id] = item;
            this.world.broadcast([Messages.SPAWN, item.id, item.type, item.x, item.y]);
        }
    },
    
    scheduleRespawn: function() {
        var self = this;
        setTimeout(function() {
            self.respawn();
        }, this.respawnTime);
    },
    
    respawn: function() {
        this.spawn(this.spawnX, this.spawnY);
        this.world.mobs[this.id] = this;
        this.world.broadcast([Messages.SPAWN, this.id, this.mobType, this.x, this.y]);
    },
    
    aggro: function(player) {
        if (!this.isAggressive || this.isDead) {
            return false;
        }
        
        if (!this.target || this.distanceTo(player) < this.distanceTo(this.target)) {
            this.target = player;
            return true;
        }
        
        return false;
    },
    
    canAggro: function(player) {
        if (!this.isAggressive || this.isDead || player.isDead) {
            return false;
        }
        
        return this.distanceTo(player) <= this.aggroRange;
    },
    
    roam: function() {
        if (this.isDead || this.hasTarget() || this.isMoving) {
            return;
        }
        
        var now = Date.now();
        if (now - this.lastRoamTime < this.roamingInterval) {
            return;
        }
        
        this.lastRoamTime = now;
        
        var x = this.spawnX + Math.floor(Math.random() * this.roamDistance * 2) - this.roamDistance;
        var y = this.spawnY + Math.floor(Math.random() * this.roamDistance * 2) - this.roamDistance;
        
        if (this.world.isValidPosition(x, y)) {
            this.moveTo(x, y);
        }
    },
    
    returnToSpawn: function() {
        if (this.isDead || this.isMoving) {
            return;
        }
        
        this.target = null;
        this.clearAttackers();
        this.moveTo(this.spawnX, this.spawnY, function() {
            // Heal when back at spawn
            this.heal(this.maxHitPoints);
        }.bind(this));
    },
    
    shouldReturnToSpawn: function() {
        var distanceFromSpawn = Utils.getDistance(this.x, this.y, this.spawnX, this.spawnY);
        return distanceFromSpawn > this.maxDistanceFromSpawn;
    },
    
    findNearestPlayer: function() {
        var nearestPlayer = null;
        var minDistance = this.aggroRange + 1;
        
        _.each(this.world.players, function(player) {
            if (!player.isDead) {
                var distance = this.distanceTo(player);
                if (distance <= this.aggroRange && distance < minDistance) {
                    nearestPlayer = player;
                    minDistance = distance;
                }
            }
        }, this);
        
        return nearestPlayer;
    },
    
    getDamage: function() {
        return Formulas.getMobDamage(this.mobType);
    },
    
    getLoot: function() {
        if (this.drops.length === 0) {
            return null;
        }
        
        var drop = Utils.randomChoice(this.drops);
        if (drop && Math.random() < drop.chance) {
            return drop.type;
        }
        
        return null;
    },
    
    update: function(deltaTime) {
        this._super(deltaTime);
        
        if (this.isDead) {
            return;
        }
        
        // Check if should return to spawn
        if (this.shouldReturnToSpawn()) {
            this.returnToSpawn();
            return;
        }
        
        // AI behavior
        if (this.hasTarget()) {
            this.handleCombat();
        } else {
            this.handleIdle();
        }
    },
    
    handleCombat: function() {
        if (!this.target || this.target.isDead) {
            this.target = null;
            return;
        }
        
        var distance = this.distanceTo(this.target);
        
        // Target too far away
        if (distance > this.returnDistance) {
            this.target = null;
            return;
        }
        
        // Move towards target if not adjacent
        if (distance > this.attackRange && !this.isMoving) {
            this.moveTo(this.target.x, this.target.y);
        }
        
        // Attack if in range
        if (distance <= this.attackRange && this.canAttack(this.target)) {
            this.attack(this.target);
            
            var damage = this.getDamage();
            this.target.receiveDamage(damage, this);
            
            // Broadcast attack
            this.world.broadcast([Messages.ATTACK, this.id, this.target.id]);
            this.world.broadcast([Messages.HIT, this.id, this.target.id, damage]);
        }
    },
    
    handleIdle: function() {
        // Look for nearby players to aggro
        if (this.isAggressive) {
            var nearestPlayer = this.findNearestPlayer();
            if (nearestPlayer) {
                this.aggro(nearestPlayer);
                return;
            }
        }
        
        // Roam around spawn point
        this.roam();
    }
});

module.exports = Mob;
