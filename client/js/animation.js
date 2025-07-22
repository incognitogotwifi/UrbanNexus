define([], function() {
    'use strict';
    
    var Animation = function(name, frames, speed, loop) {
        this.name = name;
        this.frames = frames || [0];
        this.speed = speed || 200; // milliseconds per frame
        this.loop = loop !== undefined ? loop : true;
        
        this.currentFrame = 0;
        this.currentCount = 0;
        this.lastTime = 0;
        this.isPlaying = false;
        this.isComplete = false;
        
        // Animation callbacks
        this.onComplete = null;
        this.onFrame = null;
        this.onLoop = null;
    };
    
    Animation.prototype.start = function() {
        this.isPlaying = true;
        this.isComplete = false;
        this.currentFrame = 0;
        this.currentCount = 0;
        this.lastTime = Date.now();
    };
    
    Animation.prototype.stop = function() {
        this.isPlaying = false;
        this.isComplete = true;
    };
    
    Animation.prototype.pause = function() {
        this.isPlaying = false;
    };
    
    Animation.prototype.resume = function() {
        this.isPlaying = true;
        this.lastTime = Date.now();
    };
    
    Animation.prototype.reset = function() {
        this.currentFrame = 0;
        this.currentCount = 0;
        this.isComplete = false;
        this.lastTime = Date.now();
    };
    
    Animation.prototype.update = function(currentTime) {
        if (!this.isPlaying || this.isComplete) {
            return false;
        }
        
        currentTime = currentTime || Date.now();
        var deltaTime = currentTime - this.lastTime;
        
        if (deltaTime >= this.speed) {
            this.nextFrame();
            this.lastTime = currentTime;
            
            // Call frame callback
            if (this.onFrame) {
                this.onFrame(this.currentFrame, this.getCurrentFrameValue());
            }
            
            return true;
        }
        
        return false;
    };
    
    Animation.prototype.nextFrame = function() {
        this.currentFrame++;
        
        if (this.currentFrame >= this.frames.length) {
            this.currentFrame = 0;
            this.currentCount++;
            
            // Call loop callback
            if (this.onLoop) {
                this.onLoop(this.currentCount);
            }
            
            if (!this.loop) {
                this.isComplete = true;
                this.isPlaying = false;
                
                // Call completion callback
                if (this.onComplete) {
                    this.onComplete();
                }
            }
        }
    };
    
    Animation.prototype.getCurrentFrameValue = function() {
        if (this.currentFrame >= 0 && this.currentFrame < this.frames.length) {
            return this.frames[this.currentFrame];
        }
        return this.frames[0] || 0;
    };
    
    Animation.prototype.getFrameAt = function(index) {
        if (index >= 0 && index < this.frames.length) {
            return this.frames[index];
        }
        return this.frames[0] || 0;
    };
    
    Animation.prototype.setSpeed = function(speed) {
        this.speed = speed;
    };
    
    Animation.prototype.setLoop = function(loop) {
        this.loop = loop;
    };
    
    Animation.prototype.setFrames = function(frames) {
        this.frames = frames || [0];
        this.reset();
    };
    
    Animation.prototype.getFrameCount = function() {
        return this.frames.length;
    };
    
    Animation.prototype.getDuration = function() {
        return this.frames.length * this.speed;
    };
    
    Animation.prototype.getProgress = function() {
        if (this.frames.length === 0) {
            return 0;
        }
        return this.currentFrame / this.frames.length;
    };
    
    Animation.prototype.setProgress = function(progress) {
        progress = Math.max(0, Math.min(1, progress));
        this.currentFrame = Math.floor(progress * this.frames.length);
        
        if (this.currentFrame >= this.frames.length) {
            this.currentFrame = this.frames.length - 1;
        }
    };
    
    Animation.prototype.clone = function() {
        var clone = new Animation(this.name, this.frames.slice(), this.speed, this.loop);
        clone.onComplete = this.onComplete;
        clone.onFrame = this.onFrame;
        clone.onLoop = this.onLoop;
        return clone;
    };
    
    Animation.prototype.toString = function() {
        return 'Animation(' + this.name + ') ' + this.frames.length + ' frames, ' + this.speed + 'ms';
    };
    
    // Static helper methods
    Animation.createSimple = function(name, frameCount, speed, loop) {
        var frames = [];
        for (var i = 0; i < frameCount; i++) {
            frames.push(i);
        }
        return new Animation(name, frames, speed, loop);
    };
    
    Animation.createFromRange = function(name, startFrame, endFrame, speed, loop) {
        var frames = [];
        for (var i = startFrame; i <= endFrame; i++) {
            frames.push(i);
        }
        return new Animation(name, frames, speed, loop);
    };
    
    Animation.createReverse = function(name, frames, speed, loop) {
        var reversedFrames = frames.slice().reverse();
        return new Animation(name, reversedFrames, speed, loop);
    };
    
    Animation.createPingPong = function(name, frames, speed, loop) {
        var pingPongFrames = frames.slice();
        
        // Add reverse frames (excluding first and last to avoid duplication)
        for (var i = frames.length - 2; i > 0; i--) {
            pingPongFrames.push(frames[i]);
        }
        
        return new Animation(name, pingPongFrames, speed, loop);
    };
    
    // Animation manager class
    var AnimationManager = function() {
        this.animations = {};
        this.currentAnimation = null;
        this.defaultAnimation = null;
    };
    
    AnimationManager.prototype.addAnimation = function(animation) {
        this.animations[animation.name] = animation;
        
        if (!this.defaultAnimation) {
            this.defaultAnimation = animation.name;
        }
    };
    
    AnimationManager.prototype.removeAnimation = function(name) {
        delete this.animations[name];
        
        if (this.currentAnimation && this.currentAnimation.name === name) {
            this.currentAnimation = null;
        }
        
        if (this.defaultAnimation === name) {
            var keys = Object.keys(this.animations);
            this.defaultAnimation = keys.length > 0 ? keys[0] : null;
        }
    };
    
    AnimationManager.prototype.play = function(name, reset) {
        if (name in this.animations) {
            if (this.currentAnimation && this.currentAnimation.name === name && !reset) {
                return; // Already playing this animation
            }
            
            this.currentAnimation = this.animations[name];
            this.currentAnimation.start();
        }
    };
    
    AnimationManager.prototype.stop = function() {
        if (this.currentAnimation) {
            this.currentAnimation.stop();
            this.currentAnimation = null;
        }
    };
    
    AnimationManager.prototype.pause = function() {
        if (this.currentAnimation) {
            this.currentAnimation.pause();
        }
    };
    
    AnimationManager.prototype.resume = function() {
        if (this.currentAnimation) {
            this.currentAnimation.resume();
        }
    };
    
    AnimationManager.prototype.update = function(currentTime) {
        if (this.currentAnimation) {
            return this.currentAnimation.update(currentTime);
        }
        return false;
    };
    
    AnimationManager.prototype.getCurrentFrame = function() {
        if (this.currentAnimation) {
            return this.currentAnimation.getCurrentFrameValue();
        }
        return 0;
    };
    
    AnimationManager.prototype.hasAnimation = function(name) {
        return name in this.animations;
    };
    
    AnimationManager.prototype.isPlaying = function(name) {
        if (name) {
            return this.currentAnimation && this.currentAnimation.name === name && this.currentAnimation.isPlaying;
        }
        return this.currentAnimation && this.currentAnimation.isPlaying;
    };
    
    AnimationManager.prototype.getCurrentAnimationName = function() {
        return this.currentAnimation ? this.currentAnimation.name : null;
    };
    
    // Export both classes
    Animation.Manager = AnimationManager;
    
    return Animation;
});

