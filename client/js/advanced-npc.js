define(['entity'], function(Entity) {
    'use strict';
    
    var AdvancedNPC = function(id, x, y, config) {
        Entity.call(this, id, x, y);
        
        this.type = 'npc';
        this.config = config || {};
        
        // iAppsBeats NPC features
        this.scriptClass = this.config.scriptClass || null;
        this.image = this.config.image || 'npc.png';
        this.name = this.config.name || 'NPC';
        this.nameColor = this.config.nameColor || '#FFC627';
        this.drawunder = this.config.drawunder || false;
        this.nonblocking = this.config.nonblocking || false;
        this.tileHeight = this.config.tileHeight || 1;
        this.tileWidth = this.config.tileWidth || 1;
        
        // AI Behavior
        this.aiType = this.config.aiType || 'static'; // static, wander, patrol, guard, follow
        this.movementSpeed = this.config.movementSpeed || 1;
        this.detectionRange = this.config.detectionRange || 5;
        this.interactionRange = this.config.interactionRange || 2;
        
        // Patrol/Guard specific
        this.patrolPoints = this.config.patrolPoints || [];
        this.currentPatrolIndex = 0;
        this.guardPosition = { x: x, y: y };
        this.guardRange = this.config.guardRange || 3;
        
        // Wander specific
        this.wanderRadius = this.config.wanderRadius || 5;
        this.wanderTimer = 0;
        this.wanderDelay = this.config.wanderDelay || 120; // frames
        
        // Follow specific
        this.followTarget = null;
        this.followDistance = this.config.followDistance || 2;
        
        // Interaction
        this.dialogue = this.config.dialogue || [];
        this.currentDialogueIndex = 0;
        this.shop = this.config.shop || null;
        this.questGiver = this.config.questGiver || false;
        this.quests = this.config.quests || [];
        
        // State
        this.state = 'idle';
        this.stateTimer = 0;
        this.lastInteraction = 0;
        this.interactionCooldown = this.config.interactionCooldown || 1000;
        
        // Animation
        this.sprite = this.config.sprite || null;
        this.animation = this.config.animation || 'idle';
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = this.config.animationSpeed || 10;
        
        // Events
        this.onPlayerNear = this.config.onPlayerNear || null;
        this.onPlayerInteract = this.config.onPlayerInteract || null;
        this.onPlayerLeave = this.config.onPlayerLeave || null;
        
        this.initializeNPC();
    };
    
    AdvancedNPC.prototype = Object.create(Entity.prototype);
    AdvancedNPC.prototype.constructor = AdvancedNPC;
    
    AdvancedNPC.prototype.initializeNPC = function() {
        // Load script class if specified
        if (this.scriptClass) {
            this.loadScript(this.scriptClass);
        }
        
        // Initialize patrol if needed
        if (this.aiType === 'patrol' && this.patrolPoints.length === 0) {
            // Generate default patrol points
            this.generateDefaultPatrol();
        }
    };
    
    AdvancedNPC.prototype.loadScript = function(scriptClass) {
        var self = this;
        // Load NPC script (placeholder implementation)
        // In a real implementation, this would load from scriptclasses folder
        this.script = {
            init: function(npc) {
                console.log('NPC script initialized:', scriptClass);
            },
            onPlayerNear: function(npc, player) {
                if (self.onPlayerNear) {
                    self.onPlayerNear(player);
                }
            },
            onPlayerInteract: function(npc, player) {
                if (self.onPlayerInteract) {
                    self.onPlayerInteract(player);
                } else {
                    self.defaultInteraction(player);
                }
            },
            onPlayerLeave: function(npc, player) {
                if (self.onPlayerLeave) {
                    self.onPlayerLeave(player);
                }
            },
            update: function(npc) {
                // Custom script update logic
            }
        };
        
        this.script.init(this);
    };
    
    AdvancedNPC.prototype.update = function(game) {
        Entity.prototype.update.call(this, game);
        
        this.updateAI(game);
        this.updateAnimation();
        this.updateInteractions(game);
        
        if (this.script && this.script.update) {
            this.script.update(this);
        }
        
        this.stateTimer++;
    };
    
    AdvancedNPC.prototype.updateAI = function(game) {
        switch (this.aiType) {
            case 'wander':
                this.updateWander();
                break;
            case 'patrol':
                this.updatePatrol();
                break;
            case 'guard':
                this.updateGuard(game);
                break;
            case 'follow':
                this.updateFollow(game);
                break;
            case 'static':
            default:
                // No movement
                break;
        }
    };
    
    AdvancedNPC.prototype.updateWander = function() {
        this.wanderTimer++;
        
        if (this.wanderTimer >= this.wanderDelay) {
            this.wanderTimer = 0;
            
            // Choose random direction within wander radius
            var angle = Math.random() * Math.PI * 2;
            var distance = Math.random() * this.wanderRadius;
            
            var targetX = this.guardPosition.x + Math.cos(angle) * distance;
            var targetY = this.guardPosition.y + Math.sin(angle) * distance;
            
            this.moveTo(targetX, targetY);
        }
    };
    
    AdvancedNPC.prototype.updatePatrol = function() {
        if (this.patrolPoints.length === 0) return;
        
        var currentTarget = this.patrolPoints[this.currentPatrolIndex];
        var distance = this.getDistance(currentTarget.x, currentTarget.y);
        
        if (distance < 1) {
            // Reached patrol point, move to next
            this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
            this.stateTimer = 0;
        } else {
            this.moveTo(currentTarget.x, currentTarget.y);
        }
    };
    
    AdvancedNPC.prototype.updateGuard = function(game) {
        // Return to guard position if too far away
        var guardDistance = this.getDistance(this.guardPosition.x, this.guardPosition.y);
        
        if (guardDistance > this.guardRange) {
            this.moveTo(this.guardPosition.x, this.guardPosition.y);
            this.state = 'returning';
        } else {
            this.state = 'guarding';
            
            // Look for threats or players to interact with
            var nearbyPlayers = this.findNearbyPlayers(game, this.detectionRange);
            if (nearbyPlayers.length > 0) {
                this.facePlayer(nearbyPlayers[0]);
            }
        }
    };
    
    AdvancedNPC.prototype.updateFollow = function(game) {
        if (!this.followTarget) {
            // Find nearest player to follow
            var nearbyPlayers = this.findNearbyPlayers(game, this.detectionRange);
            if (nearbyPlayers.length > 0) {
                this.followTarget = nearbyPlayers[0];
            }
            return;
        }
        
        var distance = this.getDistance(this.followTarget.x, this.followTarget.y);
        
        if (distance > this.followDistance) {
            this.moveTo(this.followTarget.x, this.followTarget.y);
            this.state = 'following';
        } else {
            this.state = 'waiting';
        }
        
        // Stop following if target is too far away
        if (distance > this.detectionRange * 2) {
            this.followTarget = null;
        }
    };
    
    AdvancedNPC.prototype.updateAnimation = function() {
        this.animationTimer++;
        
        if (this.animationTimer >= this.animationSpeed) {
            this.animationTimer = 0;
            this.animationFrame++;
            
            // Cycle animation frames based on current state
            var maxFrames = this.getMaxFramesForAnimation(this.animation);
            if (this.animationFrame >= maxFrames) {
                this.animationFrame = 0;
            }
        }
    };
    
    AdvancedNPC.prototype.updateInteractions = function(game) {
        var nearbyPlayers = this.findNearbyPlayers(game, this.interactionRange);
        
        nearbyPlayers.forEach(function(player) {
            if (this.script && this.script.onPlayerNear) {
                this.script.onPlayerNear(this, player);
            }
        }.bind(this));
    };
    
    AdvancedNPC.prototype.interact = function(player) {
        var currentTime = Date.now();
        if (currentTime - this.lastInteraction < this.interactionCooldown) {
            return;
        }
        
        this.lastInteraction = currentTime;
        
        if (this.script && this.script.onPlayerInteract) {
            this.script.onPlayerInteract(this, player);
        } else {
            this.defaultInteraction(player);
        }
    };
    
    AdvancedNPC.prototype.defaultInteraction = function(player) {
        if (this.shop) {
            this.openShop(player);
        } else if (this.dialogue.length > 0) {
            this.showDialogue(player);
        } else if (this.questGiver && this.quests.length > 0) {
            this.offerQuest(player);
        } else {
            // Default greeting
            this.say("Hello, " + player.name + "!");
        }
    };
    
    AdvancedNPC.prototype.showDialogue = function(player) {
        if (this.currentDialogueIndex >= this.dialogue.length) {
            this.currentDialogueIndex = 0;
        }
        
        var message = this.dialogue[this.currentDialogueIndex];
        this.say(message);
        
        this.currentDialogueIndex++;
    };
    
    AdvancedNPC.prototype.openShop = function(player) {
        // Open shop interface for player
        this.say("Welcome to my shop!");
        // Trigger shop UI
    };
    
    AdvancedNPC.prototype.offerQuest = function(player) {
        // Offer quest to player
        this.say("I have a quest for you!");
        // Trigger quest UI
    };
    
    AdvancedNPC.prototype.say = function(message) {
        // Display speech bubble or chat message
        this.speechBubble = {
            text: message,
            timer: 180, // 3 seconds at 60fps
            maxTimer: 180
        };
    };
    
    AdvancedNPC.prototype.moveTo = function(x, y) {
        var dx = x - this.x;
        var dy = y - this.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.vx = (dx / distance) * this.movementSpeed;
            this.vy = (dy / distance) * this.movementSpeed;
            
            this.x += this.vx;
            this.y += this.vy;
            
            this.animation = 'walk';
            
            // Set direction
            if (Math.abs(dx) > Math.abs(dy)) {
                this.direction = dx > 0 ? 'right' : 'left';
            } else {
                this.direction = dy > 0 ? 'down' : 'up';
            }
        } else {
            this.vx = 0;
            this.vy = 0;
            this.animation = 'idle';
        }
    };
    
    AdvancedNPC.prototype.facePlayer = function(player) {
        var dx = player.x - this.x;
        var dy = player.y - this.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            this.direction = dx > 0 ? 'right' : 'left';
        } else {
            this.direction = dy > 0 ? 'down' : 'up';
        }
    };
    
    AdvancedNPC.prototype.findNearbyPlayers = function(game, range) {
        var nearbyPlayers = [];
        
        if (game.players) {
            game.players.forEach(function(player) {
                var distance = this.getDistance(player.x, player.y);
                if (distance <= range) {
                    nearbyPlayers.push(player);
                }
            }.bind(this));
        }
        
        return nearbyPlayers;
    };
    
    AdvancedNPC.prototype.getDistance = function(x, y) {
        var dx = x - this.x;
        var dy = y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    };
    
    AdvancedNPC.prototype.generateDefaultPatrol = function() {
        // Generate a simple square patrol pattern
        var radius = 3;
        this.patrolPoints = [
            { x: this.x + radius, y: this.y },
            { x: this.x + radius, y: this.y + radius },
            { x: this.x, y: this.y + radius },
            { x: this.x, y: this.y }
        ];
    };
    
    AdvancedNPC.prototype.getMaxFramesForAnimation = function(animation) {
        // Return max frames for animation (placeholder)
        switch (animation) {
            case 'idle':
                return 1;
            case 'walk':
                return 4;
            default:
                return 1;
        }
    };
    
    AdvancedNPC.prototype.render = function(ctx, camera) {
        if (!ctx || !camera) return;
        
        var screenPos = camera.worldToScreen(this.x * 32, this.y * 32);
        
        // Render NPC sprite
        if (this.sprite) {
            // Render sprite with current animation frame
            ctx.drawImage(this.sprite, screenPos.x, screenPos.y);
        } else {
            // Render placeholder rectangle
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(screenPos.x, screenPos.y, 32, 32);
        }
        
        // Render name
        if (this.name) {
            ctx.fillStyle = this.nameColor;
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.name, screenPos.x + 16, screenPos.y - 5);
        }
        
        // Render speech bubble
        if (this.speechBubble && this.speechBubble.timer > 0) {
            this.renderSpeechBubble(ctx, screenPos);
            this.speechBubble.timer--;
        }
    };
    
    AdvancedNPC.prototype.renderSpeechBubble = function(ctx, screenPos) {
        var bubble = this.speechBubble;
        var text = bubble.text;
        var bubbleWidth = Math.max(text.length * 8, 60);
        var bubbleHeight = 30;
        var bubbleX = screenPos.x + 16 - bubbleWidth / 2;
        var bubbleY = screenPos.y - bubbleHeight - 10;
        
        // Bubble background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight);
        
        // Bubble border
        ctx.strokeStyle = '#000';
        ctx.strokeRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight);
        
        // Bubble text
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, bubbleX + bubbleWidth / 2, bubbleY + bubbleHeight / 2 + 4);
    };
    
    return AdvancedNPC;
});