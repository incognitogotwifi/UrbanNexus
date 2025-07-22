define(['entity'], function(Entity) {
    'use strict';
    
    var NPC = function(id, type, game) {
        Entity.call(this, id, 'npc', game);
        
        this.npcType = type;
        this.talkIndex = 0;
        this.questIndex = 0;
        
        this.isClickable = true;
        
        // Dialog system
        this.messages = [];
        this.currentMessage = null;
        
        // Quest system
        this.quests = [];
        
        // Store system (for merchant NPCs)
        this.items = [];
        this.isStore = false;
    };
    
    NPC.prototype = Object.create(Entity.prototype);
    NPC.prototype.constructor = NPC;
    
    NPC.prototype.talk = function(player) {
        if (this.messages.length > 0) {
            var message = this.messages[this.talkIndex % this.messages.length];
            this.talkIndex++;
            
            // Show dialog bubble
            this.showDialog(message);
            
            return message;
        }
        return null;
    };
    
    NPC.prototype.showDialog = function(message) {
        // Create dialog bubble
        var bubble = this.game.createBubble(this, message);
        
        var self = this;
        setTimeout(function() {
            if (bubble) {
                bubble.destroy();
            }
        }, 3000);
    };
    
    NPC.prototype.setMessages = function(messages) {
        this.messages = messages || [];
    };
    
    NPC.prototype.addMessage = function(message) {
        this.messages.push(message);
    };
    
    NPC.prototype.hasQuest = function(player) {
        // Check if NPC has any available quests for the player
        for (var i = 0; i < this.quests.length; i++) {
            var quest = this.quests[i];
            if (quest.isAvailableFor(player)) {
                return true;
            }
        }
        return false;
    };
    
    NPC.prototype.getAvailableQuest = function(player) {
        for (var i = 0; i < this.quests.length; i++) {
            var quest = this.quests[i];
            if (quest.isAvailableFor(player)) {
                return quest;
            }
        }
        return null;
    };
    
    NPC.prototype.giveQuest = function(player, questId) {
        var quest = this.getQuestById(questId);
        if (quest && quest.isAvailableFor(player)) {
            player.acceptQuest(quest);
            return quest;
        }
        return null;
    };
    
    NPC.prototype.getQuestById = function(questId) {
        for (var i = 0; i < this.quests.length; i++) {
            if (this.quests[i].id === questId) {
                return this.quests[i];
            }
        }
        return null;
    };
    
    NPC.prototype.canSell = function() {
        return this.isStore && this.items.length > 0;
    };
    
    NPC.prototype.getStore = function() {
        if (this.isStore) {
            return {
                items: this.items,
                name: this.npcType + ' Shop'
            };
        }
        return null;
    };
    
    // Specific NPC types
    var Guard = function(id, game) {
        NPC.call(this, id, 'guard', game);
        this.setSprite('guard');
        this.setMessages([
            'Welcome to the village!',
            'Be careful out there, monsters are everywhere.',
            'The blacksmith can help you with weapons.'
        ]);
    };
    Guard.prototype = Object.create(NPC.prototype);
    Guard.prototype.constructor = Guard;
    
    var King = function(id, game) {
        NPC.call(this, id, 'king', game);
        this.setSprite('king');
        this.setMessages([
            'Greetings, brave adventurer!',
            'Our land is in great danger.',
            'Will you help us defeat the evil forces?'
        ]);
    };
    King.prototype = Object.create(NPC.prototype);
    King.prototype.constructor = King;
    
    var Villagegirl = function(id, game) {
        NPC.call(this, id, 'villagegirl', game);
        this.setSprite('villagegirl');
        this.setMessages([
            'Hello there!',
            'Have you seen my cat?',
            'She went missing this morning.'
        ]);
    };
    Villagegirl.prototype = Object.create(NPC.prototype);
    Villagegirl.prototype.constructor = Villagegirl;
    
    var Villager = function(id, game) {
        NPC.call(this, id, 'villager', game);
        this.setSprite('villager');
        this.setMessages([
            'Good day to you!',
            'The weather is nice today.',
            'I hope the monsters stay away.'
        ]);
    };
    Villager.prototype = Object.create(NPC.prototype);
    Villager.prototype.constructor = Villager;
    
    var Agent = function(id, game) {
        NPC.call(this, id, 'agent', game);
        this.setSprite('agent');
        this.setMessages([
            'I have information for sale.',
            'What do you want to know?',
            'Everything has a price.'
        ]);
    };
    Agent.prototype = Object.create(NPC.prototype);
    Agent.prototype.constructor = Agent;
    
    var Rick = function(id, game) {
        NPC.call(this, id, 'rick', game);
        this.setSprite('rick');
        this.setMessages([
            'I used to be an adventurer like you.',
            'Then I took an arrow to the knee.',
            'Now I just tend to this store.'
        ]);
        this.isStore = true;
        this.items = ['sword1', 'sword2', 'axe', 'redarmor', 'mailarmor'];
    };
    Rick.prototype = Object.create(NPC.prototype);
    Rick.prototype.constructor = Rick;
    
    var Scientist = function(id, game) {
        NPC.call(this, id, 'scientist', game);
        this.setSprite('scientist');
        this.setMessages([
            'Fascinating! Another test subject!',
            'I mean... welcome, adventurer.',
            'Would you like to participate in my experiments?'
        ]);
    };
    Scientist.prototype = Object.create(NPC.prototype);
    Scientist.prototype.constructor = Scientist;
    
    var Nyan = function(id, game) {
        NPC.call(this, id, 'nyan', game);
        this.setSprite('nyan');
        this.setMessages([
            'Nyan nyan nyan!',
            'Nyan nyan nyan nyan!',
            'Nyan!'
        ]);
    };
    Nyan.prototype = Object.create(NPC.prototype);
    Nyan.prototype.constructor = Nyan;
    
    var Sorcerer = function(id, game) {
        NPC.call(this, id, 'sorcerer', game);
        this.setSprite('sorcerer');
        this.setMessages([
            'The ancient magic flows through this land.',
            'Beware the dark forces that gather.',
            'Only the chosen one can restore peace.'
        ]);
    };
    Sorcerer.prototype = Object.create(NPC.prototype);
    Sorcerer.prototype.constructor = Sorcerer;
    
    var Beachnpc = function(id, game) {
        NPC.call(this, id, 'beachnpc', game);
        this.setSprite('beachnpc');
        this.setMessages([
            'The ocean is beautiful today.',
            'I love the sound of the waves.',
            'Sometimes I see strange creatures in the water.'
        ]);
    };
    Beachnpc.prototype = Object.create(NPC.prototype);
    Beachnpc.prototype.constructor = Beachnpc;
    
    var Forestnpc = function(id, game) {
        NPC.call(this, id, 'forestnpc', game);
        this.setSprite('forestnpc');
        this.setMessages([
            'The forest can be dangerous.',
            'I know these woods like the back of my hand.',
            'Watch out for the goblins!'
        ]);
    };
    Forestnpc.prototype = Object.create(NPC.prototype);
    Forestnpc.prototype.constructor = Forestnpc;
    
    var Desertnpc = function(id, game) {
        NPC.call(this, id, 'desertnpc', game);
        this.setSprite('desertnpc');
        this.setMessages([
            'The desert is harsh and unforgiving.',
            'Make sure you have plenty of water.',
            'Ancient treasures lie buried in the sand.'
        ]);
    };
    Desertnpc.prototype = Object.create(NPC.prototype);
    Desertnpc.prototype.constructor = Desertnpc;
    
    var Lavanpc = function(id, game) {
        NPC.call(this, id, 'lavanpc', game);
        this.setSprite('lavanpc');
        this.setMessages([
            'The heat here is unbearable!',
            'Only the strongest can survive this place.',
            'Beware the fire demons!'
        ]);
    };
    Lavanpc.prototype = Object.create(NPC.prototype);
    Lavanpc.prototype.constructor = Lavanpc;
    
    // Factory function
    NPC.create = function(id, type, game) {
        switch (type) {
            case 'guard':
                return new Guard(id, game);
            case 'king':
                return new King(id, game);
            case 'villagegirl':
                return new Villagegirl(id, game);
            case 'villager':
                return new Villager(id, game);
            case 'agent':
                return new Agent(id, game);
            case 'rick':
                return new Rick(id, game);
            case 'scientist':
                return new Scientist(id, game);
            case 'nyan':
                return new Nyan(id, game);
            case 'sorcerer':
                return new Sorcerer(id, game);
            case 'beachnpc':
                return new Beachnpc(id, game);
            case 'forestnpc':
                return new Forestnpc(id, game);
            case 'desertnpc':
                return new Desertnpc(id, game);
            case 'lavanpc':
                return new Lavanpc(id, game);
            default:
                return new NPC(id, type, game);
        }
    };
    
    return NPC;
});
