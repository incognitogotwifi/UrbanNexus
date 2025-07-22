define([], function() {
    'use strict';
    
    var Camera = function(screenWidth, screenHeight) {
        this.x = 0;
        this.y = 0;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.target = null;
        
        console.log('Camera initialized');
    };
    
    Camera.prototype.setTarget = function(target) {
        this.target = target;
        console.log('Camera target set');
    };
    
    Camera.prototype.update = function(targetX, targetY) {
        if (this.target) {
            targetX = this.target.x;
            targetY = this.target.y;
        }
        
        // Center camera on target
        this.x = targetX - this.screenWidth / 2;
        this.y = targetY - this.screenHeight / 2;
        
        // Clamp camera to map bounds (optional)
        this.x = Math.max(0, Math.min(this.x, 172 * 32 - this.screenWidth));
        this.y = Math.max(0, Math.min(this.y, 314 * 32 - this.screenHeight));
    };
    
    return Camera;
});