define(['sprite'], function(Sprite) {
    'use strict';
    
    var Entity = function(id, type, game) {
        this.id = id;
        this.type = type;
        this.game = game;
        
        this.x = 0;
        this.y = 0;
        this.gridX = 0;
        this.gridY = 0;
        
        this.sprite = null;
        this.flipSpriteX = false;
        this.flipSpriteY = false;
        
        this.visible = true;
        this.dirty = true;
        
        this.animations = {};
        this.currentAnimation = null;
        
        // Movement
        this.isMoving = false;
        this.currentPath = [];
        this.nextGridX = -1;
        this.nextGridY = -1;
        this.movement = null;
        
        // Rendering
        this.shadowOffsetY = 0;
        this.fadingAlpha = 1.0;
        this.blinking = false;
        this.normalSprite = null;
        this.silhouetteSprite = null;
        
        // Interactions
        this.isClickable = false;
        this.isHighlighted = false;
    };
    
    Entity.prototype.setSprite = function(spriteName) {
        if (!this.game.sprites || !this.game.sprites[spriteName]) {
            return;
        }
        
        this.sprite = new Sprite(spriteName, this.game.sprites[spriteName]);
        this.normalSprite = this.sprite;
        this.animations = this.sprite.animations;
        this.dirty = true;
    };
    
    Entity.prototype.setGridPosition = function(x, y) {
        this.gridX = x;
        this.gridY = y;
        this.x = x * 32;
        this.y = y * 32;
        this.dirty = true;
    };
    
    Entity.prototype.setPosition = function(x, y) {
        this.x = x;
        this.y = y;
        this.gridX = Math.floor(x / 32);
        this.gridY = Math.floor(y / 32);
        this.dirty = true;
    };
    
    Entity.prototype.getDistance = function(entity) {
        var dx = Math.abs(this.gridX - entity.gridX);
        var dy = Math.abs(this.gridY - entity.gridY);
        return Math.sqrt(dx * dx + dy * dy);
    };
    
    Entity.prototype.getDistanceToGridPosition = function(x, y) {
        var dx = Math.abs(this.gridX - x);
        var dy = Math.abs(this.gridY - y);
        return Math.sqrt(dx * dx + dy * dy);
    };
    
    Entity.prototype.isAdjacentNonDiagonal = function(entity) {
        var dx = Math.abs(this.gridX - entity.gridX);
        var dy = Math.abs(this.gridY - entity.gridY);
        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    };
    
    Entity.prototype.isAdjacent = function(entity) {
        var dx = Math.abs(this.gridX - entity.gridX);
        var dy = Math.abs(this.gridY - entity.gridY);
        return dx <= 1 && dy <= 1 && !(dx === 0 && dy === 0);
    };
    
    Entity.prototype.isNextTo = function(entity) {
        var dx = Math.abs(this.nextGridX - entity.gridX);
        var dy = Math.abs(this.nextGridY - entity.gridY);
        return dx <= 1 && dy <= 1;
    };
    
    Entity.prototype.animate = function(name, speed, count, onEndCount) {
        var self = this;
        
        if (name in this.animations) {
            this.currentAnimation = {
                name: name,
                speed: speed,
                count: count || 0,
                onEndCount: onEndCount,
                currentFrame: 0,
                currentCount: 0,
                lastTime: Date.now()
            };
        }
    };
    
    Entity.prototype.update = function(time) {
        // Update animation
        if (this.currentAnimation) {
            var now = Date.now();
            var timeDiff = now - this.currentAnimation.lastTime;
            
            if (timeDiff >= this.currentAnimation.speed) {
                this.currentAnimation.currentFrame++;
                this.currentAnimation.lastTime = now;
                
                var animation = this.animations[this.currentAnimation.name];
                if (this.currentAnimation.currentFrame >= animation.length) {
                    this.currentAnimation.currentFrame = 0;
                    this.currentAnimation.currentCount++;
                    
                    if (this.currentAnimation.count > 0 && 
                        this.currentAnimation.currentCount >= this.currentAnimation.count) {
                        if (this.currentAnimation.onEndCount) {
                            this.currentAnimation.onEndCount();
                        }
                        this.currentAnimation = null;
                    }
                }
                
                this.dirty = true;
            }
        }
        
        // Update movement
        if (this.isMoving && this.currentPath && this.currentPath.length > 0) {
            this.updateMovement(time);
        }
    };
    
    Entity.prototype.updateMovement = function(time) {
        if (!this.movement) {
            // Start new movement to next position in path
            var next = this.currentPath.shift();
            if (next) {
                this.nextGridX = next[0];
                this.nextGridY = next[1];
                
                this.movement = {
                    startX: this.x,
                    startY: this.y,
                    endX: this.nextGridX * 32,
                    endY: this.nextGridY * 32,
                    duration: 200, // milliseconds
                    startTime: Date.now()
                };
            } else {
                this.isMoving = false;
                return;
            }
        }
        
        var elapsed = Date.now() - this.movement.startTime;
        var progress = Math.min(elapsed / this.movement.duration, 1);
        
        this.x = this.movement.startX + (this.movement.endX - this.movement.startX) * progress;
        this.y = this.movement.startY + (this.movement.endY - this.movement.startY) * progress;
        
        if (progress >= 1) {
            // Movement complete
            this.setGridPosition(this.nextGridX, this.nextGridY);
            this.movement = null;
            
            if (this.currentPath.length === 0) {
                this.isMoving = false;
                this.onMove();
            }
        }
        
        this.dirty = true;
    };
    
    Entity.prototype.onMove = function() {
        // Override in subclasses
    };
    
    Entity.prototype.stop = function() {
        this.isMoving = false;
        this.currentPath = [];
        this.movement = null;
    };
    
    Entity.prototype.followPath = function(path) {
        if (path) {
            this.currentPath = path.slice();
            this.isMoving = true;
            this.movement = null;
        } else {
            this.stop();
        }
    };
    
    Entity.prototype.lookAtEntity = function(entity) {
        if (entity.gridX > this.gridX) {
            this.flipSpriteX = false;
        } else if (entity.gridX < this.gridX) {
            this.flipSpriteX = true;
        }
    };
    
    Entity.prototype.getSpriteName = function() {
        return this.sprite ? this.sprite.name : null;
    };
    
    Entity.prototype.getCurrentFrame = function() {
        if (this.currentAnimation && this.animations[this.currentAnimation.name]) {
            var frames = this.animations[this.currentAnimation.name];
            return frames[this.currentAnimation.currentFrame];
        }
        return 0;
    };
    
    Entity.prototype.setVisible = function(visible) {
        this.visible = visible;
        this.dirty = true;
    };
    
    Entity.prototype.setHighlighted = function(highlighted) {
        this.isHighlighted = highlighted;
        this.dirty = true;
    };
    
    Entity.prototype.blink = function(speed) {
        var self = this;
        this.blinking = true;
        
        var toggle = function() {
            self.visible = !self.visible;
            self.dirty = true;
            
            if (self.blinking) {
                setTimeout(toggle, speed);
            } else {
                self.visible = true;
                self.dirty = true;
            }
        };
        
        toggle();
    };
    
    Entity.prototype.stopBlinking = function() {
        this.blinking = false;
    };
    
    Entity.prototype.fade = function() {
        var self = this;
        var step = 0.05;
        
        var fadeOut = function() {
            if (self.fadingAlpha > 0) {
                self.fadingAlpha -= step;
                self.dirty = true;
                setTimeout(fadeOut, 50);
            } else {
                self.setVisible(false);
            }
        };
        
        fadeOut();
    };
    
    Entity.prototype.show = function() {
        this.setVisible(true);
        this.fadingAlpha = 1.0;
    };
    
    Entity.prototype.hide = function() {
        this.setVisible(false);
    };
    
    return Entity;
});
