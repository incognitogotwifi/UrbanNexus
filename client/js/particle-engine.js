define([], function() {
    'use strict';
    
    var ParticleEngine = function(renderer) {
        this.renderer = renderer;
        this.emitters = [];
        this.particles = [];
        this.maxParticles = 1000;
        
        this.particlePool = [];
        this.initializePool();
    };
    
    ParticleEngine.prototype.initializePool = function() {
        // Create particle pool for performance
        for (var i = 0; i < this.maxParticles; i++) {
            this.particlePool.push(this.createParticle());
        }
    };
    
    ParticleEngine.prototype.createParticle = function() {
        return {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            life: 0,
            maxLife: 1,
            size: 1,
            startSize: 1,
            endSize: 0,
            color: { r: 255, g: 255, b: 255, a: 1 },
            startColor: { r: 255, g: 255, b: 255, a: 1 },
            endColor: { r: 255, g: 255, b: 255, a: 0 },
            gravity: 0,
            friction: 1,
            active: false,
            sprite: null,
            rotation: 0,
            rotationSpeed: 0
        };
    };
    
    ParticleEngine.prototype.getParticleFromPool = function() {
        for (var i = 0; i < this.particlePool.length; i++) {
            if (!this.particlePool[i].active) {
                return this.particlePool[i];
            }
        }
        return null;
    };
    
    ParticleEngine.prototype.createEmitter = function(config) {
        var emitter = {
            x: config.x || 0,
            y: config.y || 0,
            particleCount: config.particleCount || 10,
            particleLife: config.particleLife || 60,
            emissionRate: config.emissionRate || 5,
            spread: config.spread || Math.PI / 4,
            speed: config.speed || 1,
            speedVariation: config.speedVariation || 0.5,
            size: config.size || 2,
            sizeVariation: config.sizeVariation || 0.5,
            color: config.color || { r: 255, g: 255, b: 255, a: 1 },
            endColor: config.endColor || { r: 255, g: 255, b: 255, a: 0 },
            gravity: config.gravity || 0,
            friction: config.friction || 0.98,
            direction: config.direction || 0,
            sprite: config.sprite || null,
            active: true,
            emissionTimer: 0,
            duration: config.duration || -1, // -1 = infinite
            startTime: Date.now()
        };
        
        this.emitters.push(emitter);
        return emitter;
    };
    
    ParticleEngine.prototype.emitParticles = function(emitter) {
        for (var i = 0; i < emitter.emissionRate; i++) {
            var particle = this.getParticleFromPool();
            if (!particle) break;
            
            // Position
            particle.x = emitter.x;
            particle.y = emitter.y;
            
            // Velocity
            var angle = emitter.direction + (Math.random() - 0.5) * emitter.spread;
            var speed = emitter.speed + (Math.random() - 0.5) * emitter.speedVariation;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            
            // Life
            particle.life = 0;
            particle.maxLife = emitter.particleLife;
            
            // Size
            particle.startSize = emitter.size + (Math.random() - 0.5) * emitter.sizeVariation;
            particle.endSize = particle.startSize * 0.1;
            particle.size = particle.startSize;
            
            // Color
            particle.startColor = Object.assign({}, emitter.color);
            particle.endColor = Object.assign({}, emitter.endColor);
            particle.color = Object.assign({}, particle.startColor);
            
            // Physics
            particle.gravity = emitter.gravity;
            particle.friction = emitter.friction;
            
            // Sprite
            particle.sprite = emitter.sprite;
            
            // Rotation
            particle.rotation = Math.random() * Math.PI * 2;
            particle.rotationSpeed = (Math.random() - 0.5) * 0.1;
            
            particle.active = true;
            this.particles.push(particle);
        }
    };
    
    ParticleEngine.prototype.updateParticles = function() {
        for (var i = this.particles.length - 1; i >= 0; i--) {
            var particle = this.particles[i];
            
            if (!particle.active) {
                this.particles.splice(i, 1);
                continue;
            }
            
            // Update life
            particle.life++;
            var lifeRatio = particle.life / particle.maxLife;
            
            if (lifeRatio >= 1) {
                particle.active = false;
                this.particles.splice(i, 1);
                continue;
            }
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Apply gravity
            particle.vy += particle.gravity;
            
            // Apply friction
            particle.vx *= particle.friction;
            particle.vy *= particle.friction;
            
            // Update size
            particle.size = this.lerp(particle.startSize, particle.endSize, lifeRatio);
            
            // Update color
            particle.color.r = this.lerp(particle.startColor.r, particle.endColor.r, lifeRatio);
            particle.color.g = this.lerp(particle.startColor.g, particle.endColor.g, lifeRatio);
            particle.color.b = this.lerp(particle.startColor.b, particle.endColor.b, lifeRatio);
            particle.color.a = this.lerp(particle.startColor.a, particle.endColor.a, lifeRatio);
            
            // Update rotation
            particle.rotation += particle.rotationSpeed;
        }
    };
    
    ParticleEngine.prototype.updateEmitters = function() {
        for (var i = this.emitters.length - 1; i >= 0; i--) {
            var emitter = this.emitters[i];
            
            if (!emitter.active) {
                this.emitters.splice(i, 1);
                continue;
            }
            
            // Check duration
            if (emitter.duration > 0 && Date.now() - emitter.startTime > emitter.duration) {
                emitter.active = false;
                continue;
            }
            
            // Emit particles
            emitter.emissionTimer++;
            if (emitter.emissionTimer >= 60 / emitter.emissionRate) {
                this.emitParticles(emitter);
                emitter.emissionTimer = 0;
            }
        }
    };
    
    ParticleEngine.prototype.renderParticles = function(ctx) {
        if (!ctx) return;
        
        for (var i = 0; i < this.particles.length; i++) {
            var particle = this.particles[i];
            
            ctx.save();
            ctx.globalAlpha = particle.color.a;
            
            if (particle.sprite) {
                // Render sprite particle
                ctx.translate(particle.x, particle.y);
                ctx.rotate(particle.rotation);
                ctx.scale(particle.size, particle.size);
                // Draw sprite here if available
                ctx.restore();
            } else {
                // Render colored circle particle
                ctx.fillStyle = 'rgba(' + 
                    Math.floor(particle.color.r) + ',' +
                    Math.floor(particle.color.g) + ',' +
                    Math.floor(particle.color.b) + ',' +
                    particle.color.a + ')';
                
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        }
    };
    
    ParticleEngine.prototype.update = function() {
        this.updateEmitters();
        this.updateParticles();
    };
    
    ParticleEngine.prototype.render = function() {
        if (this.renderer && this.renderer.context && this.renderer.context.entities) {
            this.renderParticles(this.renderer.context.entities);
        }
    };
    
    ParticleEngine.prototype.lerp = function(start, end, ratio) {
        return start + (end - start) * ratio;
    };
    
    // iAppsBeats-style particle effects
    ParticleEngine.prototype.createBulletFireEffect = function(x, y) {
        return this.createEmitter({
            x: x,
            y: y,
            particleCount: 5,
            particleLife: 30,
            emissionRate: 10,
            speed: 2,
            speedVariation: 1,
            size: 3,
            sizeVariation: 1,
            color: { r: 255, g: 200, b: 0, a: 1 },
            endColor: { r: 255, g: 0, b: 0, a: 0 },
            gravity: -0.1,
            friction: 0.95,
            duration: 200
        });
    };
    
    ParticleEngine.prototype.createExplosionEffect = function(x, y) {
        return this.createEmitter({
            x: x,
            y: y,
            particleCount: 20,
            particleLife: 60,
            emissionRate: 20,
            speed: 5,
            speedVariation: 3,
            size: 4,
            sizeVariation: 2,
            color: { r: 255, g: 100, b: 0, a: 1 },
            endColor: { r: 100, g: 0, b: 0, a: 0 },
            gravity: 0.2,
            friction: 0.9,
            duration: 100
        });
    };
    
    ParticleEngine.prototype.createHealEffect = function(x, y) {
        return this.createEmitter({
            x: x,
            y: y,
            particleCount: 10,
            particleLife: 90,
            emissionRate: 5,
            speed: 1,
            speedVariation: 0.5,
            size: 2,
            sizeVariation: 1,
            color: { r: 0, g: 255, b: 100, a: 1 },
            endColor: { r: 0, g: 255, b: 200, a: 0 },
            gravity: -0.05,
            friction: 0.98,
            duration: 500
        });
    };
    
    return ParticleEngine;
});