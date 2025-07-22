define(['npc'], function(NPC) {
    'use strict';
    
    // Advanced NPC system inspired by iappsbeats
    var AdvancedNPC = function(id, kind, x, y) {
        NPC.call(this, id, kind, x, y);
        
        // Advanced properties inspired by iappsbeats
        this.script = null;
        this.dialogue = [];
        this.currentDialogue = 0;
        this.questGiver = false;
        this.shopkeeper = false;
        this.interactive = true;
        this.nonblocking = false;
        this.drawunder = false;
        
        // AI behavior
        this.aiType = 'static'; // static, wander, guard, follow
        this.aiTimer = 0;
        this.aiInterval = 2000;
        this.patrolPath = [];
        this.currentPatrolIndex = 0;
        
        // State management
        this.state = 'idle';
        this.lastInteraction = 0;
        this.cooldown = 1000;
    };
    
    AdvancedNPC.prototype = Object.create(NPC.prototype);
    AdvancedNPC.prototype.constructor = AdvancedNPC;
    
    AdvancedNPC.prototype.setDialogue = function(dialogue) {
        this.dialogue = dialogue;
        this.currentDialogue = 0;
    };
    
    AdvancedNPC.prototype.interact = function(player) {
        var now = Date.now();
        if (now - this.lastInteraction < this.cooldown) {
            return null;
        }
        
        this.lastInteraction = now;
        
        if (this.dialogue.length > 0) {
            var message = this.dialogue[this.currentDialogue];
            this.currentDialogue = (this.currentDialogue + 1) % this.dialogue.length;
            return message;
        }
        
        return "Hello, traveler!";
    };
    
    AdvancedNPC.prototype.updateAI = function(deltaTime) {
        this.aiTimer += deltaTime;
        
        if (this.aiTimer >= this.aiInterval) {
            this.aiTimer = 0;
            
            switch (this.aiType) {
                case 'wander':
                    this.wander();
                    break;
                case 'patrol':
                    this.patrol();
                    break;
                case 'guard':
                    this.guard();
                    break;
            }
        }
    };
    
    AdvancedNPC.prototype.wander = function() {
        // Random movement within a small area
        var range = 3;
        var newX = this.x + Math.floor(Math.random() * range * 2) - range;
        var newY = this.y + Math.floor(Math.random() * range * 2) - range;
        
        // Basic bounds checking would be done by the game
        this.setTarget(newX, newY);
    };
    
    AdvancedNPC.prototype.patrol = function() {
        if (this.patrolPath.length === 0) return;
        
        var target = this.patrolPath[this.currentPatrolIndex];
        this.setTarget(target.x, target.y);
        
        // Move to next patrol point
        this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPath.length;
    };
    
    AdvancedNPC.prototype.guard = function() {
        // Look for threats or return to guard position
        // Implementation would depend on game mechanics
        if (this.state !== 'guarding') {
            this.state = 'guarding';
        }
    };
    
    AdvancedNPC.prototype.setTarget = function(x, y) {
        this.targetX = x;
        this.targetY = y;
        this.state = 'moving';
    };
    
    AdvancedNPC.prototype.setPatrolPath = function(path) {
        this.patrolPath = path;
        this.aiType = 'patrol';
        this.currentPatrolIndex = 0;
    };
    
    AdvancedNPC.prototype.setAIType = function(type) {
        this.aiType = type;
        this.state = 'idle';
    };
    
    return AdvancedNPC;
});