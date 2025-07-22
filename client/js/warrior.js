define(['player'], function(Player) {
    'use strict';
    
    var Warrior = function(id, name, game) {
        Player.call(this, id, name, game);
        
        this.spriteName = 'clotharmor';
        this.weaponName = 'sword1';
        
        this.setSprite(this.spriteName);
    };
    
    Warrior.prototype = Object.create(Player.prototype);
    Warrior.prototype.constructor = Warrior;
    
    return Warrior;
});
