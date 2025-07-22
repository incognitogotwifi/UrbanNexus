var _ = require('underscore');
var Character = require('./character');
var Types = require('../shared/js/gametypes');
var Utils = require('./utils');

var Player = Character.extend({
    init: function(id, name, world) {
        this._super(id, Types.Entities.WARRIOR, world);
        
        this.name = name;
        this.type = 'player';
        this.level = 1;
        this.experience = 0;
        this.maxHitPoints = 100;
        this.hitPoints = this.maxHitPoints;
        
        // Equipment
        this.armor = null;
        this.weapon = null;
        this.armorLevel = 0;
        this.weaponLevel = 0;
        
        // Stats
        this.kills = {};
        this.lastCheckpoint = null;
        this.isDead = false;
        this.connection = null;
        
        // Combat
        this.target = null;
        this.attackers = [];
        this.lastAttackTime = 0;
        this.attackCooldown = 1000; // 1 second
        
        // Movement
        this.lastMoveTime = 0;
        this.moveCooldown = 100; // Prevent movement spam
        
        // Initialize with basic equipment
        this.armor = Types.Entities.CLOTHARMOR;
        this.weapon = Types.Entities.SWORD1;
        this.armorLevel = 1;
        this.weaponLevel = 1;
    },
    
    loot: function(item) {
        if (item.isWeapon()) {
            this.weapon = item.type;
            this.weaponLevel = item.level || 1;
        } else if (item.isArmor()) {
            this.armor = item.type;
            this.armorLevel = item.level || 1;
        } else if (item.isFood()) {
            this.heal(item.healAmount);
        }
        
        return true;
    },
    
    canLoot: function(item) {
        // Check if player is close enough to loot
        var distance = Utils.getDistance(this.x, this.y, item.x, item.y);
        return distance <= 1;
    },
    
    canAttack: function(target) {
        if (!target || target.isDead) {
            return false;
        }
        
        var now = Date.now();
        if (now - this.lastAttackTime < this.attackCooldown) {
            return false;
        }
        
        var distance = Utils.getDistance(this.x, this.y, target.x, target.y);
        return distance <= 1;
    },
    
    attack: function(target) {
        if (!this.canAttack(target)) {
            return 0;
        }
        
        this.lastAttackTime = Date.now();
        this.target = target;
        
        var damage = this.getDamage();
        
        if (target.type === 'mob') {
            target.addAttacker(this);
        }
        
        return damage;
    },
    
    getDamage: function() {
        var baseDamage = 10;
        var weaponDamage = this.getWeaponDamage();
        var randomFactor = 0.8 + Math.random() * 0.4; // 80% to 120%
        
        return Math.floor((baseDamage + weaponDamage) * randomFactor);
    },
    
    getWeaponDamage: function() {
        if (!this.weapon) {
            return 0;
        }
        
        var weaponDamage = {
            [Types.Entities.SWORD1]: 10,
            [Types.Entities.SWORD2]: 20,
            [Types.Entities.REDSWORD]: 30,
            [Types.Entities.BLUESWORD]: 40,
            [Types.Entities.GOLDENSWORD]: 50,
            [Types.Entities.AXE]: 25
        };
        
        return weaponDamage[this.weapon] || 0;
    },
    
    getArmorDefense: function() {
        if (!this.armor) {
            return 0;
        }
        
        var armorDefense = {
            [Types.Entities.CLOTHARMOR]: 5,
            [Types.Entities.LEATHERARMOR]: 10,
            [Types.Entities.MAILARMOR]: 15,
            [Types.Entities.PLATEARMOR]: 20,
            [Types.Entities.REDARMOR]: 25,
            [Types.Entities.GOLDENARMOR]: 30
        };
        
        return armorDefense[this.armor] || 0;
    },
    
    receiveDamage: function(damage, attacker) {
        var defense = this.getArmorDefense();
        var finalDamage = Math.max(1, damage - defense);
        
        this.hitPoints -= finalDamage;
        
        if (this.hitPoints <= 0) {
            this.hitPoints = 0;
            this.die();
        }
        
        return finalDamage;
    },
    
    heal: function(amount) {
        this.hitPoints = Math.min(this.hitPoints + amount, this.maxHitPoints);
    },
    
    die: function() {
        this.isDead = true;
        this.hitPoints = 0;
        
        // Clear combat state
        this.target = null;
        this.attackers = [];
        
        // Respawn after 5 seconds
        var self = this;
        setTimeout(function() {
            self.respawn();
        }, 5000);
    },
    
    respawn: function() {
        this.isDead = false;
        this.hitPoints = this.maxHitPoints;
        
        // Reset to spawn position
        var spawnPos = this.world.getSpawnPosition();
        this.setPosition(spawnPos.x, spawnPos.y);
        
        // Notify world
        this.world.sendToPlayer(this, [Messages.WELCOME, this.id, this.x, this.y, this.hitPoints]);
    },
    
    gainExperience: function(amount) {
        this.experience += amount;
        
        var nextLevelExp = this.getExperienceForLevel(this.level + 1);
        if (this.experience >= nextLevelExp) {
            this.levelUp();
        }
    },
    
    levelUp: function() {
        this.level++;
        var oldMaxHp = this.maxHitPoints;
        this.maxHitPoints += 20;
        this.hitPoints += (this.maxHitPoints - oldMaxHp); // Heal to full
        
        // Notify world about level up
        this.world.broadcast([Messages.HEALTH, this.id, this.hitPoints, this.maxHitPoints]);
    },
    
    getExperienceForLevel: function(level) {
        return Math.floor(100 * Math.pow(level, 1.5));
    },
    
    addKill: function(mobType) {
        if (!this.kills[mobType]) {
            this.kills[mobType] = 0;
        }
        this.kills[mobType]++;
    },
    
    getKillCount: function(mobType) {
        return this.kills[mobType] || 0;
    },
    
    setPosition: function(x, y) {
        this._super(x, y);
        
        // Check for area changes, checkpoints, etc.
        this.checkAreas();
    },
    
    checkAreas: function() {
        // Check if player entered a new area
        _.each(this.world.areas, function(area) {
            if (area.contains(this.x, this.y)) {
                this.handleAreaEnter(area);
            }
        }, this);
    },
    
    handleAreaEnter: function(area) {
        // Handle special area effects
        if (area.id === 'spawn' && this.isDead) {
            this.respawn();
        }
    },
    
    save: function() {
        // Save player data to database
        return {
            id: this.id,
            name: this.name,
            level: this.level,
            experience: this.experience,
            hitPoints: this.hitPoints,
            maxHitPoints: this.maxHitPoints,
            armor: this.armor,
            weapon: this.weapon,
            armorLevel: this.armorLevel,
            weaponLevel: this.weaponLevel,
            x: this.x,
            y: this.y,
            kills: this.kills
        };
    },
    
    load: function(data) {
        // Load player data from database
        this.level = data.level || 1;
        this.experience = data.experience || 0;
        this.hitPoints = data.hitPoints || 100;
        this.maxHitPoints = data.maxHitPoints || 100;
        this.armor = data.armor || Types.Entities.CLOTHARMOR;
        this.weapon = data.weapon || Types.Entities.SWORD1;
        this.armorLevel = data.armorLevel || 1;
        this.weaponLevel = data.weaponLevel || 1;
        this.x = data.x || 50;
        this.y = data.y || 50;
        this.kills = data.kills || {};
    },
    
    getStats: function() {
        return {
            level: this.level,
            experience: this.experience,
            hitPoints: this.hitPoints,
            maxHitPoints: this.maxHitPoints,
            armor: this.armor,
            weapon: this.weapon,
            armorLevel: this.armorLevel,
            weaponLevel: this.weaponLevel
        };
    },
    
    update: function(deltaTime) {
        this._super(deltaTime);
        
        // Update combat
        if (this.target && !this.target.isDead) {
            var distance = Utils.getDistance(this.x, this.y, this.target.x, this.target.y);
            if (distance > 3) {
                // Target too far, stop attacking
                this.target = null;
            }
        }
        
        // Remove dead attackers
        this.attackers = _.filter(this.attackers, function(attacker) {
            return !attacker.isDead;
        });
    }
});

module.exports = Player;
