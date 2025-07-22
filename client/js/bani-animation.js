define([], function() {
    'use strict';
    
    var BANIAnimation = function() {
        this.animations = {};
        this.loadedAnimations = {};
        
        this.initializeBANI();
    };
    
    BANIAnimation.prototype.initializeBANI = function() {
        // Load BANI animations from attached assets
        this.loadBANIAnimations();
    };
    
    BANIAnimation.prototype.loadBANIAnimations = function() {
        var self = this;
        
        // Load player_idle BANI animation
        this.loadBANIFile('player_idle', function(data) {
            if (data) {
                self.animations['player_idle'] = data;
                console.log('Loaded BANI animation: player_idle');
            }
        });
        
        // Load player_walk BANI animation  
        this.loadBANIFile('player_walk', function(data) {
            if (data) {
                self.animations['player_walk'] = data;
                console.log('Loaded BANI animation: player_walk');
            }
        });
        
        // Load custom animations from attached assets
        this.loadCustomAnimations();
    };
    
    BANIAnimation.prototype.loadBANIFile = function(animationName, callback) {
        var self = this;
        
        // Try to load from attached assets first
        $.get('attached_assets/' + animationName + '_*.bani', function(data) {
            var baniData = self.parseBANI(data);
            if (callback) callback(baniData);
        }).fail(function() {
            // Create default animation if file not found
            var defaultAnim = self.createDefaultAnimation(animationName);
            if (callback) callback(defaultAnim);
        });
    };
    
    BANIAnimation.prototype.loadCustomAnimations = function() {
        // Load character templates and animations
        var animations = [
            'westlaw_dj-on',
            'action-clapping', 
            'player_sit',
            'westlaw_sassy',
            'westlaw_twerk',
            'westlaw_misck-rolf',
            'westlaw_cry',
            'westlaw_cowboy-train',
            'westlaw_firedance',
            'westlaw_duck-funk',
            'westlaw_pojo-mojo',
            'westlaw_chila',
            'westlaw_blunt-atk',
            'westlaw_walletcage1',
            'westlaw_rpss',
            'westlaw_player-happyjump',
            'westlaw_deathpart1',
            'player_rob',
            'westlaw_hug',
            'westlaw_bandage-atk',
            'bestlaw-1'
        ];
        
        var self = this;
        animations.forEach(function(animName) {
            self.animations[animName] = self.createDefaultAnimation(animName);
        });
    };
    
    BANIAnimation.prototype.parseBANI = function(baniData) {
        try {
            // BANI format parsing
            var animation = {
                name: '',
                version: '1.0',
                frameCount: 1,
                frameRate: 10,
                looping: true,
                frames: [],
                sprites: []
            };
            
            // Parse BANI data (simplified implementation)
            if (typeof baniData === 'string') {
                // Parse text-based BANI format
                var lines = baniData.split('\n');
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i].trim();
                    if (line.startsWith('name:')) {
                        animation.name = line.substring(5).trim();
                    } else if (line.startsWith('frameCount:')) {
                        animation.frameCount = parseInt(line.substring(11).trim());
                    } else if (line.startsWith('frameRate:')) {
                        animation.frameRate = parseInt(line.substring(10).trim());
                    }
                }
            }
            
            return animation;
        } catch (e) {
            console.warn('Failed to parse BANI data:', e);
            return null;
        }
    };
    
    BANIAnimation.prototype.createDefaultAnimation = function(name) {
        return {
            name: name,
            version: '1.0',
            frameCount: 4,
            frameRate: 10,
            looping: true,
            frames: [
                { duration: 100, spriteIndex: 0, x: 0, y: 0 },
                { duration: 100, spriteIndex: 1, x: 0, y: 0 },
                { duration: 100, spriteIndex: 2, x: 0, y: 0 },
                { duration: 100, spriteIndex: 3, x: 0, y: 0 }
            ],
            sprites: [
                { image: name + '_0.png', width: 32, height: 32 },
                { image: name + '_1.png', width: 32, height: 32 },
                { image: name + '_2.png', width: 32, height: 32 },
                { image: name + '_3.png', width: 32, height: 32 }
            ]
        };
    };
    
    BANIAnimation.prototype.getAnimation = function(name) {
        return this.animations[name] || null;
    };
    
    BANIAnimation.prototype.hasAnimation = function(name) {
        return this.animations.hasOwnProperty(name);
    };
    
    BANIAnimation.prototype.playAnimation = function(name, entity) {
        var animation = this.getAnimation(name);
        if (!animation || !entity) return false;
        
        entity.currentAnimation = animation;
        entity.animationFrame = 0;
        entity.animationTimer = 0;
        entity.animation = name;
        
        return true;
    };
    
    BANIAnimation.prototype.updateEntityAnimation = function(entity, deltaTime) {
        if (!entity.currentAnimation) return;
        
        var animation = entity.currentAnimation;
        entity.animationTimer += deltaTime;
        
        var currentFrame = animation.frames[entity.animationFrame];
        if (entity.animationTimer >= currentFrame.duration) {
            entity.animationTimer = 0;
            entity.animationFrame++;
            
            if (entity.animationFrame >= animation.frameCount) {
                if (animation.looping) {
                    entity.animationFrame = 0;
                } else {
                    entity.animationFrame = animation.frameCount - 1;
                    entity.currentAnimation = null; // Animation finished
                }
            }
        }
    };
    
    BANIAnimation.prototype.renderEntityAnimation = function(ctx, entity, camera) {
        if (!entity.currentAnimation || !ctx || !camera) return;
        
        var animation = entity.currentAnimation;
        var frame = animation.frames[entity.animationFrame];
        var sprite = animation.sprites[frame.spriteIndex];
        
        if (!sprite) return;
        
        var screenPos = camera.worldToScreen(entity.x * 32, entity.y * 32);
        
        // Draw animation frame
        ctx.save();
        ctx.translate(screenPos.x + frame.x, screenPos.y + frame.y);
        
        // If sprite image is available, draw it
        if (sprite.image && this.loadedAnimations[sprite.image]) {
            ctx.drawImage(this.loadedAnimations[sprite.image], 0, 0, sprite.width, sprite.height);
        } else {
            // Draw placeholder rectangle with animation-specific color
            var color = this.getAnimationColor(animation.name);
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, sprite.width, sprite.height);
            
            // Draw animation name
            ctx.fillStyle = '#FFF';
            ctx.font = '8px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(animation.name.substring(0, 8), sprite.width / 2, sprite.height / 2);
        }
        
        ctx.restore();
    };
    
    BANIAnimation.prototype.getAnimationColor = function(animationName) {
        // Return different colors for different animation types
        if (animationName.includes('dance')) return '#FF69B4';
        if (animationName.includes('fire')) return '#FF4500';
        if (animationName.includes('death')) return '#8B0000';
        if (animationName.includes('heal') || animationName.includes('bandage')) return '#00FF00';
        if (animationName.includes('sit') || animationName.includes('idle')) return '#87CEEB';
        if (animationName.includes('attack') || animationName.includes('blunt')) return '#FFD700';
        return '#DDA0DD'; // Default purple for unknown animations
    };
    
    BANIAnimation.prototype.preloadAnimationImages = function() {
        var self = this;
        
        Object.keys(this.animations).forEach(function(animName) {
            var animation = self.animations[animName];
            animation.sprites.forEach(function(sprite) {
                if (sprite.image && !self.loadedAnimations[sprite.image]) {
                    var img = new Image();
                    img.onload = function() {
                        self.loadedAnimations[sprite.image] = img;
                    };
                    img.onerror = function() {
                        console.warn('Failed to load animation image:', sprite.image);
                    };
                    img.src = 'img/' + sprite.image;
                }
            });
        });
    };
    
    return BANIAnimation;
});