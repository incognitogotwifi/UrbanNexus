define([], function() {
    'use strict';
    
    var Camera = function(renderer) {
        this.renderer = renderer;
        
        this.x = 0;
        this.y = 0;
        this.gridX = 0;
        this.gridY = 0;
        
        this.rescale = 1;
        
        this.focusEntity = null;
        
        // Camera bounds
        this.maxX = 0;
        this.maxY = 0;
        this.minX = 0;
        this.minY = 0;
        
        this.lockX = false;
        this.lockY = false;
    };
    
    Camera.prototype.centerOn = function(entity) {
        if (entity) {
            this.focusEntity = entity;
            
            var newX = entity.x - this.renderer.getWidth() / 2;
            var newY = entity.y - this.renderer.getHeight() / 2;
            
            this.setPosition(newX, newY);
        }
    };
    
    Camera.prototype.setPosition = function(x, y) {
        this.x = this.clampX(x);
        this.y = this.clampY(y);
        
        this.gridX = Math.floor(this.x / 32);
        this.gridY = Math.floor(this.y / 32);
    };
    
    Camera.prototype.setGridPosition = function(x, y) {
        this.setPosition(x * 32, y * 32);
    };
    
    Camera.prototype.clampX = function(x) {
        if (this.lockX) {
            return this.x;
        }
        
        return Math.max(this.minX, Math.min(this.maxX, x));
    };
    
    Camera.prototype.clampY = function(y) {
        if (this.lockY) {
            return this.y;
        }
        
        return Math.max(this.minY, Math.min(this.maxY, y));
    };
    
    Camera.prototype.setBounds = function(minX, minY, maxX, maxY) {
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX - this.renderer.getWidth();
        this.maxY = maxY - this.renderer.getHeight();
    };
    
    Camera.prototype.worldToScreen = function(worldX, worldY) {
        return {
            x: worldX - this.x,
            y: worldY - this.y
        };
    };
    
    Camera.prototype.screenToWorld = function(screenX, screenY) {
        return {
            x: screenX + this.x,
            y: screenY + this.y
        };
    };
    
    Camera.prototype.worldToGridPosition = function(worldX, worldY) {
        return {
            x: Math.floor(worldX / 32),
            y: Math.floor(worldY / 32)
        };
    };
    
    Camera.prototype.gridToWorldPosition = function(gridX, gridY) {
        return {
            x: gridX * 32,
            y: gridY * 32
        };
    };
    
    Camera.prototype.isVisible = function(entity, buffer) {
        buffer = buffer || 32;
        
        var screenPos = this.worldToScreen(entity.x, entity.y);
        
        return screenPos.x >= -buffer &&
               screenPos.y >= -buffer &&
               screenPos.x < this.renderer.getWidth() + buffer &&
               screenPos.y < this.renderer.getHeight() + buffer;
    };
    
    Camera.prototype.isVisiblePosition = function(x, y, buffer) {
        buffer = buffer || 32;
        
        var screenPos = this.worldToScreen(x, y);
        
        return screenPos.x >= -buffer &&
               screenPos.y >= -buffer &&
               screenPos.x < this.renderer.getWidth() + buffer &&
               screenPos.y < this.renderer.getHeight() + buffer;
    };
    
    Camera.prototype.forEachVisiblePosition = function(callback, buffer) {
        buffer = buffer || 1;
        
        var startX = Math.floor(this.x / 32) - buffer;
        var startY = Math.floor(this.y / 32) - buffer;
        var endX = startX + Math.ceil(this.renderer.getWidth() / 32) + buffer * 2;
        var endY = startY + Math.ceil(this.renderer.getHeight() / 32) + buffer * 2;
        
        for (var y = startY; y <= endY; y++) {
            for (var x = startX; x <= endX; x++) {
                callback(x, y);
            }
        }
    };
    
    Camera.prototype.getVisibleArea = function() {
        return {
            x: this.x,
            y: this.y,
            width: this.renderer.getWidth(),
            height: this.renderer.getHeight()
        };
    };
    
    Camera.prototype.move = function(deltaX, deltaY) {
        this.setPosition(this.x + deltaX, this.y + deltaY);
    };
    
    Camera.prototype.moveTo = function(x, y, duration) {
        if (duration && duration > 0) {
            // Smooth camera movement
            var startX = this.x;
            var startY = this.y;
            var startTime = Date.now();
            
            var self = this;
            var animate = function() {
                var elapsed = Date.now() - startTime;
                var progress = Math.min(elapsed / duration, 1);
                
                var currentX = startX + (x - startX) * progress;
                var currentY = startY + (y - startY) * progress;
                
                self.setPosition(currentX, currentY);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            
            animate();
        } else {
            this.setPosition(x, y);
        }
    };
    
    Camera.prototype.shake = function(intensity, duration) {
        var originalX = this.x;
        var originalY = this.y;
        var startTime = Date.now();
        
        var self = this;
        var shake = function() {
            var elapsed = Date.now() - startTime;
            var progress = elapsed / duration;
            
            if (progress < 1) {
                var currentIntensity = intensity * (1 - progress);
                var shakeX = (Math.random() - 0.5) * currentIntensity;
                var shakeY = (Math.random() - 0.5) * currentIntensity;
                
                self.setPosition(originalX + shakeX, originalY + shakeY);
                
                requestAnimationFrame(shake);
            } else {
                self.setPosition(originalX, originalY);
            }
        };
        
        shake();
    };
    
    return Camera;
});
