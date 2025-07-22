define([], function() {
    'use strict';
    
    var Sprite = function(name, data) {
        this.name = name;
        this.data = data;
        
        // Sprite properties
        this.id = data.id || name;
        this.width = data.width || 1;
        this.height = data.height || 1;
        this.offsetX = data.offsetX || 0;
        this.offsetY = data.offsetY || 0;
        
        // Animation data
        this.animations = {};
        
        // Load animations
        if (data.animations) {
            this.loadAnimations(data.animations);
        }
        
        // Default animation frames
        this.idleFrames = data.idle || [0];
        this.walkFrames = data.walk || [0, 1];
        this.attackFrames = data.attack || [0];
        this.hurtFrames = data.hurt || [0];
        this.deathFrames = data.death || [0];
    };
    
    Sprite.prototype.loadAnimations = function(animData) {
        for (var animName in animData) {
            var anim = animData[animName];
            
            if (Array.isArray(anim)) {
                // Simple array of frame numbers
                this.animations[animName] = anim;
            } else if (typeof anim === 'object') {
                // Animation object with additional properties
                this.animations[animName] = anim.frames || [0];
                
                // Store additional animation properties
                if (anim.speed) {
                    this.animations[animName + '_speed'] = anim.speed;
                }
                if (anim.loop !== undefined) {
                    this.animations[animName + '_loop'] = anim.loop;
                }
            }
        }
        
        // Create directional animations if they don't exist
        this.createDirectionalAnimations();
    };
    
    Sprite.prototype.createDirectionalAnimations = function() {
        var directions = ['up', 'down', 'left', 'right'];
        
        // Create walk animations for each direction
        if (this.animations.walk) {
            var walkFrames = this.animations.walk;
            
            for (var i = 0; i < directions.length; i++) {
                var direction = directions[i];
                var animName = 'walk_' + direction;
                
                if (!this.animations[animName]) {
                    // Calculate frame offset based on direction
                    var offset = i * this.width;
                    var frames = [];
                    
                    for (var f = 0; f < walkFrames.length; f++) {
                        frames.push(walkFrames[f] + offset);
                    }
                    
                    this.animations[animName] = frames;
                }
            }
        }
        
        // Create attack animations for each direction
        if (this.animations.attack) {
            var attackFrames = this.animations.attack;
            
            for (var i = 0; i < directions.length; i++) {
                var direction = directions[i];
                var animName = 'atk_' + direction;
                
                if (!this.animations[animName]) {
                    var offset = i * this.width;
                    var frames = [];
                    
                    for (var f = 0; f < attackFrames.length; f++) {
                        frames.push(attackFrames[f] + offset);
                    }
                    
                    this.animations[animName] = frames;
                }
            }
        }
        
        // Create simplified animation names
        if (!this.animations.atk && this.animations.attack) {
            this.animations.atk = this.animations.attack;
        }
        
        if (!this.animations.idle && this.idleFrames) {
            this.animations.idle = this.idleFrames;
        }
    };
    
    Sprite.prototype.getAnimation = function(name) {
        return this.animations[name] || null;
    };
    
    Sprite.prototype.hasAnimation = function(name) {
        return name in this.animations;
    };
    
    Sprite.prototype.getAnimationSpeed = function(name) {
        var speedKey = name + '_speed';
        if (speedKey in this.animations) {
            return this.animations[speedKey];
        }
        
        // Default speeds based on animation type
        if (name.indexOf('walk') === 0) {
            return 150;
        } else if (name.indexOf('atk') === 0 || name.indexOf('attack') === 0) {
            return 100;
        } else if (name === 'hurt') {
            return 200;
        } else if (name === 'death') {
            return 300;
        }
        
        return 200; // Default speed
    };
    
    Sprite.prototype.getAnimationLoop = function(name) {
        var loopKey = name + '_loop';
        if (loopKey in this.animations) {
            return this.animations[loopKey];
        }
        
        // Default loop behavior
        if (name.indexOf('walk') === 0) {
            return true;
        } else if (name === 'idle') {
            return true;
        }
        
        return false; // Don't loop by default
    };
    
    Sprite.prototype.getFrameCount = function(animationName) {
        var animation = this.getAnimation(animationName);
        return animation ? animation.length : 0;
    };
    
    Sprite.prototype.getFrame = function(animationName, frameIndex) {
        var animation = this.getAnimation(animationName);
        if (animation && frameIndex >= 0 && frameIndex < animation.length) {
            return animation[frameIndex];
        }
        return 0;
    };
    
    Sprite.prototype.getIdleFrame = function() {
        return this.idleFrames[0] || 0;
    };
    
    Sprite.prototype.clone = function() {
        return new Sprite(this.name, this.data);
    };
    
    Sprite.prototype.toString = function() {
        return 'Sprite(' + this.name + ') ' + this.width + 'x' + this.height;
    };
    
    // Static helper methods
    Sprite.createFromData = function(name, data) {
        return new Sprite(name, data);
    };
    
    Sprite.createSimple = function(name, width, height, frames) {
        var data = {
            width: width || 1,
            height: height || 1,
            idle: frames || [0]
        };
        
        return new Sprite(name, data);
    };
    
    Sprite.createAnimated = function(name, width, height, animations) {
        var data = {
            width: width || 1,
            height: height || 1,
            animations: animations || {}
        };
        
        return new Sprite(name, data);
    };
    
    return Sprite;
});

