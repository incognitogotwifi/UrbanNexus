define([], function() {
    'use strict';
    
    // BANI Animation Loader inspired by iappsbeats
    var BaniLoader = function() {
        this.animations = {};
        this.sprites = {};
    };
    
    BaniLoader.prototype.loadAnimation = function(name, url, callback) {
        var self = this;
        
        $.getJSON(url)
            .done(function(data) {
                self.animations[name] = self.parseAnimation(data);
                if (callback) callback(null, self.animations[name]);
            })
            .fail(function(xhr, status, error) {
                console.warn('Failed to load animation:', name, error);
                if (callback) callback(error);
            });
    };
    
    BaniLoader.prototype.parseAnimation = function(data) {
        var animation = {
            name: data.name,
            options: data.options || {},
            frames: [],
            sprites: data.sprites || {},
            defaults: data.defaults || {}
        };
        
        // Parse frames
        if (data.frames) {
            animation.frames = data.frames.map(function(frameData) {
                return {
                    directions: frameData.directions || [],
                    duration: frameData.duration || 100
                };
            });
        }
        
        // Setup looping
        animation.looping = data.options && data.options.looping;
        animation.continuous = data.options && data.options.continuous;
        
        return animation;
    };
    
    BaniLoader.prototype.createAnimationInstance = function(animationName) {
        var animDef = this.animations[animationName];
        if (!animDef) {
            console.warn('Animation not found:', animationName);
            return null;
        }
        
        return new BaniAnimation(animDef);
    };
    
    // BANI Animation Instance
    var BaniAnimation = function(definition) {
        this.definition = definition;
        this.currentFrame = 0;
        this.currentTime = 0;
        this.direction = 0; // 0=down, 1=left, 2=up, 3=right
        this.playing = false;
        this.loop = definition.looping || false;
    };
    
    BaniAnimation.prototype.play = function() {
        this.playing = true;
        this.currentTime = 0;
        this.currentFrame = 0;
    };
    
    BaniAnimation.prototype.stop = function() {
        this.playing = false;
        this.currentFrame = 0;
        this.currentTime = 0;
    };
    
    BaniAnimation.prototype.update = function(deltaTime) {
        if (!this.playing || !this.definition.frames.length) {
            return;
        }
        
        this.currentTime += deltaTime;
        var frame = this.definition.frames[this.currentFrame];
        
        if (this.currentTime >= frame.duration) {
            this.currentTime = 0;
            this.currentFrame++;
            
            if (this.currentFrame >= this.definition.frames.length) {
                if (this.loop) {
                    this.currentFrame = 0;
                } else {
                    this.currentFrame = this.definition.frames.length - 1;
                    this.playing = false;
                }
            }
        }
    };
    
    BaniAnimation.prototype.setDirection = function(direction) {
        this.direction = Math.max(0, Math.min(3, direction));
    };
    
    BaniAnimation.prototype.getCurrentFrame = function() {
        if (!this.definition.frames.length) return null;
        
        var frame = this.definition.frames[this.currentFrame];
        if (!frame.directions || !frame.directions[this.direction]) {
            return null;
        }
        
        return {
            sprites: frame.directions[this.direction],
            duration: frame.duration
        };
    };
    
    BaniAnimation.prototype.render = function(ctx, x, y, scale) {
        var frame = this.getCurrentFrame();
        if (!frame) return;
        
        scale = scale || 1;
        
        // Render each sprite in the frame
        frame.sprites.forEach(function(sprite) {
            if (sprite.length >= 3) {
                var spriteId = sprite[0];
                var offsetX = sprite[1] * scale;
                var offsetY = sprite[2] * scale;
                
                // Here you would render the actual sprite
                // This is a placeholder for sprite rendering
                this.renderSprite(ctx, spriteId, x + offsetX, y + offsetY, scale);
            }
        }.bind(this));
    };
    
    BaniAnimation.prototype.renderSprite = function(ctx, spriteId, x, y, scale) {
        // Placeholder sprite rendering - would need actual sprite data
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fillRect(x, y, 16 * scale, 16 * scale);
    };
    
    return {
        BaniLoader: BaniLoader,
        BaniAnimation: BaniAnimation
    };
});