var _ = require('underscore');
var Entity = require('./entity');
var Types = require('../shared/js/gametypes');

var NPC = Entity.extend({
    init: function(id, type, world) {
        this._super(id, type, world);
        
        this.npcType = type;
        this.type = 'npc';
        
        // Dialogue
        this.messages = [];
        this.talkIndex = 0;
        
        // Quest system
        this.quests = [];
        
        // Store system
        this.isStore = false;
        this.items = [];
        
        // Load NPC properties
        this.loadProperties();
    },
    
    loadProperties: function() {
        // Load NPC-specific properties like messages, quests, etc.
        var npcData = this.getNPCData();
        
        if (npcData) {
            this.messages = npcData.messages || [];
            this.quests = npcData.quests || [];
            this.isStore = npcData.isStore || false;
            this.items = npcData.items || [];
        }
    },
    
    getNPCData: function() {
        // Return NPC-specific data based on type
        var npcTypes = {
            'guard': {
                messages: [
                    "Welcome to the village!",
                    "Be careful out there, monsters are everywhere.",
                    "The blacksmith can help you with weapons."
                ]
            },
            'king': {
                messages: [
                    "Greetings, brave adventurer!",
                    "Our land is in great danger.",
                    "Will you help us defeat the evil forces?"
                ]
            },
            'villagegirl': {
                messages: [
                    "Hello there!",
                    "Have you seen my cat?",
                    "She went missing this morning."
                ]
            },
            'villager': {
                messages: [
                    "Good day to you!",
                    "The weather is nice today.",
                    "I hope the monsters stay away."
                ]
            },
            'agent': {
                messages: [
                    "I have information for sale.",
                    "What do you want to know?",
                    "Everything has a price."
                ]
            },
            'rick': {
                messages: [
                    "I used to be an adventurer like you.",
                    "Then I took an arrow to the knee.",
                    "Now I just tend to this store."
                ],
                isStore: true,
                items: [
                    Types.Entities.SWORD1,
                    Types.Entities.SWORD2,
                    Types.Entities.AXE,
                    Types.Entities.REDARMOR,
                    Types.Entities.MAILARMOR
                ]
            },
            'scientist': {
                messages: [
                    "Fascinating! Another test subject!",
                    "I mean... welcome, adventurer.",
                    "Would you like to participate in my experiments?"
                ]
            },
            'nyan': {
                messages: [
                    "Nyan nyan nyan!",
                    "Nyan nyan nyan nyan!",
                    "Nyan!"
                ]
            },
            'sorcerer': {
                messages: [
                    "The ancient magic flows through this land.",
                    "Beware the dark forces that gather.",
                    "Only the chosen one can restore peace."
                ]
            },
            'beachnpc': {
                messages: [
                    "The ocean is beautiful today.",
                    "I love the sound of the waves.",
                    "Sometimes I see strange creatures in the water."
                ]
            },
            'forestnpc': {
                messages: [
                    "The forest can be dangerous.",
                    "I know these woods like the back of my hand.",
                    "Watch out for the goblins!"
                ]
            },
            'desertnpc': {
                messages: [
                    "The desert is harsh and unforgiving.",
                    "Make sure you have plenty of water.",
                    "Ancient treasures lie buried in the sand."
                ]
            },
            'lavanpc': {
                messages: [
                    "The heat here is unbearable!",
                    "Only the strongest can survive this place.",
                    "Beware the fire demons!"
                ]
            }
        };
        
        return npcTypes[this.npcType] || null;
    },
    
    talk: function(player) {
        if (this.messages.length === 0) {
            return null;
        }
        
        var message = this.messages[this.talkIndex % this.messages.length];
        this.talkIndex++;
        
        return message;
    },
    
    hasQuest: function(player) {
        return _.some(this.quests, function(quest) {
            return quest.isAvailableFor(player);
        });
    },
    
    getAvailableQuest: function(player) {
        return _.find(this.quests, function(quest) {
            return quest.isAvailableFor(player);
        });
    },
    
    giveQuest: function(player, questId) {
        var quest = _.find(this.quests, function(q) {
            return q.id === questId;
        });
        
        if (quest && quest.isAvailableFor(player)) {
            player.acceptQuest(quest);
            return quest;
        }
        
        return null;
    },
    
    getStore: function() {
        if (!this.isStore) {
            return null;
        }
        
        return {
            npcId: this.id,
            npcType: this.npcType,
            items: this.items
        };
    },
    
    canSell: function(item) {
        return this.isStore && this.items.indexOf(item) !== -1;
    },
    
    sellItem: function(player, itemType) {
        if (!this.canSell(itemType)) {
            return false;
        }
        
        // Check if player has enough gold (if implemented)
        // For now, just give the item
        var item = this.world.createItem(itemType, player.x, player.y);
        this.world.items[item.id] = item;
        this.world.broadcast([Messages.SPAWN, item.id, item.type, item.x, item.y]);
        
        return true;
    },
    
    update: function(deltaTime) {
        this._super(deltaTime);
        
        // NPCs don't move or do much, but could have idle animations
        // or other behaviors in the future
    }
});

module.exports = NPC;
