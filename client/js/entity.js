define([], function() {
    'use strict';
    
    var Entity = function(id, x, y) {
        this.id = id;
        this.x = x || 0;
        this.y = y || 0;
        this.vx = 0;
        this.vy = 0;
        
        this.type = 'entity';
        this.direction = 'down';
        this.animation = 'idle';
        this.animationFrame = 0;
        this.animationSpeed = 10;
        this.animationTimer = 0;
        
        this.width = 32;
        this.height = 32;
        
        this.active = true;
        this.visible = true;
        
        this.sprite = null;
        this.name = '';
        this.nameColor = '#FFF';
    };
    
    Entity.prototype.update = function(game) {
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Update animation
        this.updateAnimation();
    };
    
    Entity.prototype.updateAnimation = function() {
        this.animationTimer++;
        
        if (this.animationTimer >= this.animationSpeed) {
            this.animationTimer = 0;
            this.animationFrame++;
            
            // Cycle animation frames
            var maxFrames = this.getMaxFramesForAnimation(this.animation);
            if (this.animationFrame >= maxFrames) {
                this.animationFrame = 0;
            }
        }
    };
    
    Entity.prototype.getMaxFramesForAnimation = function(animation) {
        // Override in subclasses
        return 1;
    };
    
    Entity.prototype.setPosition = function(x, y) {
        this.x = x;
        this.y = y;
    };
    
    Entity.prototype.setVelocity = function(vx, vy) {
        this.vx = vx;
        this.vy = vy;
    };
    
    Entity.prototype.setAnimation = function(animation) {
        if (this.animation !== animation) {
            this.animation = animation;
            this.animationFrame = 0;
            this.animationTimer = 0;
        }
    };
    
    Entity.prototype.setDirection = function(direction) {
        this.direction = direction;
    };
    
    Entity.prototype.getDistance = function(entity) {
        var dx = entity.x - this.x;
        var dy = entity.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    };
    
    Entity.prototype.isColliding = function(entity) {
        return (this.x < entity.x + entity.width &&
                this.x + this.width > entity.x &&
                this.y < entity.y + entity.height &&
                this.y + this.height > entity.y);
    };
    
    Entity.prototype.render = function(ctx, camera) {
        if (!this.visible || !ctx || !camera) return;
        
        var screenPos = camera.worldToScreen(this.x, this.y);
        
        // Render entity sprite or placeholder
        if (this.sprite) {
            ctx.drawImage(this.sprite, screenPos.x, screenPos.y);
        } else {
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(screenPos.x, screenPos.y, this.width, this.height);
        }
        
        // Render name if present
        if (this.name) {
            ctx.fillStyle = this.nameColor;
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.name, screenPos.x + this.width / 2, screenPos.y - 5);
        }
    };
    
    return Entity;
});