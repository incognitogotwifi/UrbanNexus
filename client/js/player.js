define(['character'], function(Character) {
    'use strict';
    
    var Player = function(id, name, game) {
        Character.call(this, id, 'player', game);
        
        this.name = name;
        this.level = 1;
        this.experience = 0;
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.armor = 0;
        this.weapon = null;
        this.armorName = null;
        this.weaponName = null;
        
        this.hitPoints = 0;
        this.maxHitPoints = 0;
        
        this.isDead = false;
        this.deathTime = 0;
        
        this.zone = null;
        
        // Equipment
        this.armorSprite = null;
        this.weaponSprite = null;
    };
    
    Player.prototype = Object.create(Character.prototype);
    Player.prototype.constructor = Player;
    
    Player.prototype.loot = function(item) {
        if (item) {
            if (item.isWeapon()) {
                this.setWeapon(item);
            } else if (item.isArmor()) {
                this.setArmor(item);
            }
        }
    };
    
    Player.prototype.setWeapon = function(weapon) {
        this.weapon = weapon;
        this.weaponName = weapon.name;
        this.updateSprite();
    };
    
    Player.prototype.setArmor = function(armor) {
        this.armorName = armor.name;
        this.updateSprite();
    };
    
    Player.prototype.updateSprite = function() {
        // Update sprite based on equipment
        var spriteName = 'clotharmor';
        
        if (this.armorName) {
            spriteName = this.armorName;
        }
        
        this.setSprite(spriteName);
    };
    
    Player.prototype.die = function() {
        this.isDead = true;
        this.deathTime = Date.now();
        this.setSprite('death');
        
        // Show death screen
        $('#death').show();
        
        var self = this;
        setTimeout(function() {
            self.respawn();
        }, 5000);
    };
    
    Player.prototype.respawn = function() {
        this.isDead = false;
        this.health = this.maxHealth;
        this.updateSprite();
        
        $('#death').hide();
        
        // Reset position to spawn point
        this.setGridPosition(50, 50); // Default spawn position
    };
    
    Player.prototype.teleport = function(x, y) {
        this.setGridPosition(x, y);
        this.previousGridX = x;
        this.previousGridY = y;
    };
    
    Player.prototype.engageMob = function(mob) {
        this.target = mob;
        mob.target = this;
        
        this.followPath(null);
        this.moveTo(mob.gridX, mob.gridY);
    };
    
    Player.prototype.disengage = function() {
        if (this.target) {
            this.target.target = null;
            this.target = null;
        }
    };
    
    Player.prototype.canAttack = function(time) {
        if (this.weapon) {
            return (time - this.lastAttack) >= this.weapon.attackRate;
        }
        return (time - this.lastAttack) >= 1000; // Default attack rate
    };
    
    Player.prototype.attack = function(mob) {
        if (!this.canAttack(Date.now())) {
            return;
        }
        
        this.lookAtEntity(mob);
        this.lastAttack = Date.now();
        
        // Play attack animation
        this.animate('atk', 150, 1);
        
        // Calculate damage
        var damage = this.calculateDamage();
        
        return damage;
    };
    
    Player.prototype.calculateDamage = function() {
        var damage = Math.floor(Math.random() * 10) + 1; // Base damage
        
        if (this.weapon) {
            damage += this.weapon.damage;
        }
        
        return damage;
    };
    
    Player.prototype.hurt = function(damage) {
        this.health -= damage;
        
        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
        
        // Show damage animation
        this.animate('hurt', 150, 1);
    };
    
    Player.prototype.heal = function(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
    };
    
    Player.prototype.gainExperience = function(amount) {
        this.experience += amount;
        
        var nextLevelExp = this.getExperienceForLevel(this.level + 1);
        if (this.experience >= nextLevelExp) {
            this.levelUp();
        }
    };
    
    Player.prototype.levelUp = function() {
        this.level++;
        this.maxHealth += 10;
        this.health = this.maxHealth;
        
        // Show level up effect
        this.animate('levelup', 200, 1);
    };
    
    Player.prototype.getExperienceForLevel = function(level) {
        return Math.floor(50 * Math.pow(level, 1.5));
    };
    
    Player.prototype.isMoving = function() {
        return this.currentPath && this.currentPath.length > 0;
    };
    
    Player.prototype.getHealthPercentage = function() {
        return Math.round((this.health / this.maxHealth) * 100);
    };
    
    Player.prototype.hasWeapon = function() {
        return this.weapon !== null;
    };
    
    Player.prototype.hasSword = function() {
        return this.hasWeapon() && this.weapon.type === 'sword';
    };
    
    Player.prototype.hasAxe = function() {
        return this.hasWeapon() && this.weapon.type === 'axe';
    };
    
    Player.prototype.getWeaponLevel = function() {
        if (this.weapon) {
            return this.weapon.level || 1;
        }
        return 0;
    };
    
    return Player;
});
