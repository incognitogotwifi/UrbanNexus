var _ = require('underscore');
var Entity = require('./entity');
var Types = require('../shared/js/gametypes');

var Item = Entity.extend({
    init: function(id, type, world) {
        this._super(id, type, world);
        
        this.itemType = type;
        this.type = 'item';
        
        // Item properties
        this.isLootable = true;
        this.isStackable = false;
        this.maxStack = 1;
        this.level = 1;
        
        // Despawn timer
        this.despawnTime = Date.now() + 30000; // 30 seconds
        this.blinkStart = Date.now() + 25000; // Start blinking at 25 seconds
        
        // Load item properties
        this.loadProperties();
    },
    
    loadProperties: function() {
        var itemData = this.getItemData();
        
        if (itemData) {
            this.level = itemData.level || 1;
            this.isStackable = itemData.isStackable || false;
            this.maxStack = itemData.maxStack || 1;
            this.healAmount = itemData.healAmount || 0;
            this.damage = itemData.damage || 0;
            this.defense = itemData.defense || 0;
        }
    },
    
    getItemData: function() {
        var itemTypes = {
            // Weapons
            [Types.Entities.SWORD1]: {
                level: 1,
                damage: 10,
                type: 'weapon'
            },
            [Types.Entities.SWORD2]: {
                level: 2,
                damage: 20,
                type: 'weapon'
            },
            [Types.Entities.REDSWORD]: {
                level: 3,
                damage: 30,
                type: 'weapon'
            },
            [Types.Entities.BLUESWORD]: {
                level: 4,
                damage: 40,
                type: 'weapon'
            },
            [Types.Entities.GOLDENSWORD]: {
                level: 5,
                damage: 50,
                type: 'weapon'
            },
            [Types.Entities.AXE]: {
                level: 2,
                damage: 25,
                type: 'weapon'
            },
            
            // Armor
            [Types.Entities.CLOTHARMOR]: {
                level: 1,
                defense: 5,
                type: 'armor'
            },
            [Types.Entities.LEATHERARMOR]: {
                level: 2,
                defense: 10,
                type: 'armor'
            },
            [Types.Entities.MAILARMOR]: {
                level: 3,
                defense: 15,
                type: 'armor'
            },
            [Types.Entities.PLATEARMOR]: {
                level: 4,
                defense: 20,
                type: 'armor'
            },
            [Types.Entities.REDARMOR]: {
                level: 5,
                defense: 25,
                type: 'armor'
            },
            [Types.Entities.GOLDENARMOR]: {
                level: 6,
                defense: 30,
                type: 'armor'
            },
            
            // Food
            [Types.Entities.CAKE]: {
                healAmount: 50,
                type: 'food',
                isStackable: true,
                maxStack: 5
            },
            [Types.Entities.BURGER]: {
                healAmount: 100,
                type: 'food',
                isStackable: true,
                maxStack: 3
            },
            [Types.Entities.FLASK]: {
                healAmount: 40,
                type: 'food',
                isStackable: true,
                maxStack: 10
            }
        };
        
        return itemTypes[this.itemType] || null;
    },
    
    isWeapon: function() {
        var weaponTypes = [
            Types.Entities.SWORD1,
            Types.Entities.SWORD2,
            Types.Entities.REDSWORD,
            Types.Entities.BLUESWORD,
            Types.Entities.GOLDENSWORD,
            Types.Entities.AXE
        ];
        
        return weaponTypes.indexOf(this.itemType) !== -1;
    },
    
    isArmor: function() {
        var armorTypes = [
            Types.Entities.CLOTHARMOR,
            Types.Entities.LEATHERARMOR,
            Types.Entities.MAILARMOR,
            Types.Entities.PLATEARMOR,
            Types.Entities.REDARMOR,
            Types.Entities.GOLDENARMOR
        ];
        
        return armorTypes.indexOf(this.itemType) !== -1;
    },
    
    isFood: function() {
        var foodTypes = [
            Types.Entities.CAKE,
            Types.Entities.BURGER,
            Types.Entities.FLASK
        ];
        
        return foodTypes.indexOf(this.itemType) !== -1;
    },
    
    getHealAmount: function() {
        return this.healAmount || 0;
    },
    
    getDamage: function() {
        return this.damage || 0;
    },
    
    getDefense: function() {
        return this.defense || 0;
    },
    
    getLevel: function() {
        return this.level;
    },
    
    canLoot: function(player) {
        if (!this.isLootable || this.isDead) {
            return false;
        }
        
        // Check if player is close enough
        var distance = this.distanceTo(player);
        return distance <= 1;
    },
    
    loot: function(player) {
        if (!this.canLoot(player)) {
            return false;
        }
        
        this.isLootable = false;
        this.isDead = true;
        
        return true;
    },
    
    despawn: function() {
        this.isDead = true;
        this.isLootable = false;
        
        // Remove from world
        delete this.world.items[this.id];
        this.world.broadcast([Messages.DESPAWN, this.id]);
    },
    
    shouldBlink: function() {
        return Date.now() >= this.blinkStart;
    },
    
    shouldDespawn: function() {
        return Date.now() >= this.despawnTime;
    },
    
    update: function(deltaTime) {
        this._super(deltaTime);
        
        if (this.shouldDespawn()) {
            this.despawn();
        }
    }
});

module.exports = Item;
