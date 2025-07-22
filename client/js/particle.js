define([], function() {
    'use strict';
    
    var Particle = function(x, y, options) {
        this.x = x;
        this.y = y;
        this.options = options || {};
        
        // Particle properties inspired by iappsbeats
        this.vx = this.options.vx || 0;
        this.vy = this.options.vy || 0;
        this.life = this.options.life || 1000;
        this.maxLife = this.life;
        this.size = this.options.size || 2;
        this.color = this.options.color || 'white';
        this.alpha = this.options.alpha || 1.0;
        this.gravity = this.options.gravity || 0;
        this.bounce = this.options.bounce || 0;
        
        this.isDead = false;
    };
    
    Particle.prototype.update = function(deltaTime) {
        if (this.isDead) return;
        
        // Update position
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Apply gravity
        this.vy += this.gravity * deltaTime;
        
        // Update life
        this.life -= deltaTime;
        if (this.life <= 0) {
            this.isDead = true;
            return;
        }
        
        // Update alpha based on life
        this.alpha = this.life / this.maxLife;
    };
    
    Particle.prototype.render = function(ctx) {
        if (this.isDead) return;
        
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };
    
    var ParticleEngine = function() {
        this.particles = [];
        this.emitters = [];
    };
    
    ParticleEngine.prototype.addParticle = function(particle) {
        this.particles.push(particle);
    };
    
    ParticleEngine.prototype.createExplosion = function(x, y, count, options) {
        for (var i = 0; i < count; i++) {
            var angle = (Math.PI * 2 * i) / count;
            var speed = options.speed || 50;
            var particle = new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: options.life || 1000,
                size: options.size || 2,
                color: options.color || 'orange',
                gravity: options.gravity || 20
            });
            this.addParticle(particle);
        }
    };
    
    ParticleEngine.prototype.update = function(deltaTime) {
        // Update all particles
        for (var i = this.particles.length - 1; i >= 0; i--) {
            var particle = this.particles[i];
            particle.update(deltaTime);
            
            // Remove dead particles
            if (particle.isDead) {
                this.particles.splice(i, 1);
            }
        }
    };
    
    ParticleEngine.prototype.render = function(ctx) {
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].render(ctx);
        }
    };
    
    return {
        Particle: Particle,
        ParticleEngine: ParticleEngine
    };
});