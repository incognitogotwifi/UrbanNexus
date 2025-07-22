define(['entity'], function(Entity) {
    'use strict';
    
    var Item = function(id, type, game) {
        Entity.call(this, id, 'item', game);
        
        this.itemType = type;
        this.isLootable = true;
        this.isClickable = true;
        
        // Item properties
        this.name = type;
        this.level = 1;
        
        // Equipment properties
        this.isWeapon = false;
        this.isArmor = false;
        
        // Stats
        this.damage = 0;
        this.defense = 0;
        
        // Blink when dropped
        this.blink(150);
        
        var self = this;
        setTimeout(function() {
            self.stopBlinking();
        }, 16000);
        
        // Despawn after 30 seconds
        setTimeout(function() {
            self.despawn();
        }, 30000);
    };
    
    Item.prototype = Object.create(Entity.prototype);
    Item.prototype.constructor = Item;
    
    Item.prototype.getSpriteName = function() {
        return this.itemType;
    };
    
    Item.prototype.despawn = function() {
        this.fade();
    };
    
    Item.prototype.isWeapon = function() {
        return this.isWeapon;
    };
    
    Item.prototype.isArmor = function() {
        return this.isArmor;
    };
    
    Item.prototype.getName = function() {
        return this.name;
    };
    
    Item.prototype.getLevel = function() {
        return this.level;
    };
    
    // Weapon types
    var Sword1 = function(id, game) {
        Item.call(this, id, 'sword1', game);
        this.name = 'Sword';
        this.level = 1;
        this.isWeapon = true;
        this.damage = 10;
        this.setSprite('sword1');
    };
    Sword1.prototype = Object.create(Item.prototype);
    Sword1.prototype.constructor = Sword1;
    
    var Sword2 = function(id, game) {
        Item.call(this, id, 'sword2', game);
        this.name = 'Steel Sword';
        this.level = 2;
        this.isWeapon = true;
        this.damage = 20;
        this.setSprite('sword2');
    };
    Sword2.prototype = Object.create(Item.prototype);
    Sword2.prototype.constructor = Sword2;
    
    var Redsword = function(id, game) {
        Item.call(this, id, 'redsword', game);
        this.name = 'Red Sword';
        this.level = 3;
        this.isWeapon = true;
        this.damage = 30;
        this.setSprite('redsword');
    };
    Redsword.prototype = Object.create(Item.prototype);
    Redsword.prototype.constructor = Redsword;
    
    var Bluesword = function(id, game) {
        Item.call(this, id, 'bluesword', game);
        this.name = 'Blue Sword';
        this.level = 4;
        this.isWeapon = true;
        this.damage = 40;
        this.setSprite('bluesword');
    };
    Bluesword.prototype = Object.create(Item.prototype);
    Bluesword.prototype.constructor = Bluesword;
    
    var Goldensword = function(id, game) {
        Item.call(this, id, 'goldensword', game);
        this.name = 'Golden Sword';
        this.level = 5;
        this.isWeapon = true;
        this.damage = 50;
        this.setSprite('goldensword');
    };
    Goldensword.prototype = Object.create(Item.prototype);
    Goldensword.prototype.constructor = Goldensword;
    
    var Axe = function(id, game) {
        Item.call(this, id, 'axe', game);
        this.name = 'Axe';
        this.level = 2;
        this.isWeapon = true;
        this.damage = 25;
        this.setSprite('axe');
    };
    Axe.prototype = Object.create(Item.prototype);
    Axe.prototype.constructor = Axe;
    
    // Armor types
    var Clotharmor = function(id, game) {
        Item.call(this, id, 'clotharmor', game);
        this.name = 'Cloth Armor';
        this.level = 1;
        this.isArmor = true;
        this.defense = 5;
        this.setSprite('clotharmor');
    };
    Clotharmor.prototype = Object.create(Item.prototype);
    Clotharmor.prototype.constructor = Clotharmor;
    
    var Leatherarmor = function(id, game) {
        Item.call(this, id, 'leatherarmor', game);
        this.name = 'Leather Armor';
        this.level = 2;
        this.isArmor = true;
        this.defense = 10;
        this.setSprite('leatherarmor');
    };
    Leatherarmor.prototype = Object.create(Item.prototype);
    Leatherarmor.prototype.constructor = Leatherarmor;
    
    var Mailarmor = function(id, game) {
        Item.call(this, id, 'mailarmor', game);
        this.name = 'Mail Armor';
        this.level = 3;
        this.isArmor = true;
        this.defense = 15;
        this.setSprite('mailarmor');
    };
    Mailarmor.prototype = Object.create(Item.prototype);
    Mailarmor.prototype.constructor = Mailarmor;
    
    var Platearmor = function(id, game) {
        Item.call(this, id, 'platearmor', game);
        this.name = 'Plate Armor';
        this.level = 4;
        this.isArmor = true;
        this.defense = 20;
        this.setSprite('platearmor');
    };
    Platearmor.prototype = Object.create(Item.prototype);
    Platearmor.prototype.constructor = Platearmor;
    
    var Redarmor = function(id, game) {
        Item.call(this, id, 'redarmor', game);
        this.name = 'Red Armor';
        this.level = 5;
        this.isArmor = true;
        this.defense = 25;
        this.setSprite('redarmor');
    };
    Redarmor.prototype = Object.create(Item.prototype);
    Redarmor.prototype.constructor = Redarmor;
    
    var Goldenarmor = function(id, game) {
        Item.call(this, id, 'goldenarmor', game);
        this.name = 'Golden Armor';
        this.level = 6;
        this.isArmor = true;
        this.defense = 30;
        this.setSprite('goldenarmor');
    };
    Goldenarmor.prototype = Object.create(Item.prototype);
    Goldenarmor.prototype.constructor = Goldenarmor;
    
    // Food items
    var Cake = function(id, game) {
        Item.call(this, id, 'cake', game);
        this.name = 'Cake';
        this.healAmount = 50;
        this.setSprite('cake');
    };
    Cake.prototype = Object.create(Item.prototype);
    Cake.prototype.constructor = Cake;
    
    var Burger = function(id, game) {
        Item.call(this, id, 'burger', game);
        this.name = 'Burger';
        this.healAmount = 100;
        this.setSprite('burger');
    };
    Burger.prototype = Object.create(Item.prototype);
    Burger.prototype.constructor = Burger;
    
    var Flask = function(id, game) {
        Item.call(this, id, 'flask', game);
        this.name = 'Health Potion';
        this.healAmount = 40;
        this.setSprite('flask');
    };
    Flask.prototype = Object.create(Item.prototype);
    Flask.prototype.constructor = Flask;
    
    // Factory function
    Item.create = function(id, type, game) {
        switch (type) {
            // Weapons
            case 'sword1':
                return new Sword1(id, game);
            case 'sword2':
                return new Sword2(id, game);
            case 'redsword':
                return new Redsword(id, game);
            case 'bluesword':
                return new Bluesword(id, game);
            case 'goldensword':
                return new Goldensword(id, game);
            case 'axe':
                return new Axe(id, game);
                
            // Armor
            case 'clotharmor':
                return new Clotharmor(id, game);
            case 'leatherarmor':
                return new Leatherarmor(id, game);
            case 'mailarmor':
                return new Mailarmor(id, game);
            case 'platearmor':
                return new Platearmor(id, game);
            case 'redarmor':
                return new Redarmor(id, game);
            case 'goldenarmor':
                return new Goldenarmor(id, game);
                
            // Food
            case 'cake':
                return new Cake(id, game);
            case 'burger':
                return new Burger(id, game);
            case 'flask':
                return new Flask(id, game);
                
            default:
                return new Item(id, type, game);
        }
    };
    
    return Item;
});
