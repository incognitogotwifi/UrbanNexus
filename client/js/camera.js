define([], function() {
    'use strict';
    
    var Camera = function(renderer) {
        this.renderer = renderer;
        this.x = 0;
        this.y = 0;
        this.bounds = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
        
        this.target = null;
        this.smoothing = 0.1;
    };
    
    Camera.prototype.setBounds = function(x, y, width, height) {
        this.bounds.x = x;
        this.bounds.y = y;
        this.bounds.width = width;
        this.bounds.height = height;
    };
    
    Camera.prototype.setTarget = function(entity) {
        this.target = entity;
    };
    
    Camera.prototype.update = function() {
        if (!this.target) return;
        
        var targetX = this.target.x - (this.renderer.getWidth() / 2);
        var targetY = this.target.y - (this.renderer.getHeight() / 2);
        
        // Smooth camera movement
        this.x += (targetX - this.x) * this.smoothing;
        this.y += (targetY - this.y) * this.smoothing;
        
        // Keep camera within bounds
        this.x = Math.max(this.bounds.x, Math.min(this.x, this.bounds.width - this.renderer.getWidth()));
        this.y = Math.max(this.bounds.y, Math.min(this.y, this.bounds.height - this.renderer.getHeight()));
    };
    
    Camera.prototype.forEachVisiblePosition = function(callback, margin) {
        if (!this.renderer) return;
        
        margin = margin || 0;
        var tileSize = this.renderer.tilesize || 32;
        
        var startX = Math.floor((this.x - margin * tileSize) / tileSize);
        var startY = Math.floor((this.y - margin * tileSize) / tileSize);
        var endX = Math.ceil((this.x + this.renderer.getWidth() + margin * tileSize) / tileSize);
        var endY = Math.ceil((this.y + this.renderer.getHeight() + margin * tileSize) / tileSize);
        
        for (var x = startX; x < endX; x++) {
            for (var y = startY; y < endY; y++) {
                callback(x, y);
            }
        }
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
    
    return Camera;
});