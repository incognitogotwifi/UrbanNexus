define(['camera'], function(Camera) {
    'use strict';
    
    var Renderer = function(game) {
        this.game = game;
        
        this.canvas = null;
        this.context = null;
        
        this.camera = null;
        
        this.tileSize = 32;
        this.mapWidth = 172;
        this.mapHeight = 314;
        
        console.log('Renderer initialized');
    };
    
    Renderer.prototype.initCanvas = function() {
        // Get the entities canvas (main rendering surface)
        this.canvas = document.getElementById('entities');
        
        if (!this.canvas) {
            console.error('Entities canvas not found');
            return;
        }
        
        this.context = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.canvas.style.width = '800px';
        this.canvas.style.height = '600px';
        
        // Initialize camera
        this.camera = new Camera(this.canvas.width, this.canvas.height);
        
        console.log('Canvas initialized - Size:', this.canvas.width, 'x', this.canvas.height);
    };
    
    Renderer.prototype.initMap = function() {
        // Initialize background canvas
        var bgCanvas = document.getElementById('background');
        if (bgCanvas) {
            var bgContext = bgCanvas.getContext('2d');
            bgCanvas.width = this.canvas.width;
            bgCanvas.height = this.canvas.height;
            
            // Draw simple grid background
            this.drawMapBackground(bgContext);
        }
    };
    
    Renderer.prototype.drawMapBackground = function(context) {
        var tileSize = this.tileSize;
        var width = this.canvas.width;
        var height = this.canvas.height;
        
        // Draw a simple grid background
        context.fillStyle = '#90EE90'; // Light green
        context.fillRect(0, 0, width, height);
        
        // Draw grid lines
        context.strokeStyle = '#228B22'; // Forest green
        context.lineWidth = 1;
        
        // Vertical lines
        for (var x = 0; x < width; x += tileSize) {
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, height);
            context.stroke();
        }
        
        // Horizontal lines
        for (var y = 0; y < height; y += tileSize) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(width, y);
            context.stroke();
        }
        
        console.log('Map background drawn');
    };
    
    Renderer.prototype.render = function() {
        if (!this.context) return;
        
        // Clear canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update camera
        if (this.camera && this.game.player) {
            this.camera.update(this.game.player.x, this.game.player.y);
        }
        
        // Render entities
        this.renderEntities();
        
        // Render UI
        this.renderUI();
    };
    
    Renderer.prototype.renderEntities = function() {
        var self = this;
        var entities = this.game.entities;
        
        Object.keys(entities).forEach(function(id) {
            var entity = entities[id];
            self.renderEntity(entity);
        });
    };
    
    Renderer.prototype.renderEntity = function(entity) {
        if (!entity) return;
        
        var screenX = entity.x;
        var screenY = entity.y;
        
        // Apply camera offset
        if (this.camera) {
            screenX -= this.camera.x;
            screenY -= this.camera.y;
        }
        
        // Skip if entity is off-screen
        if (screenX < -50 || screenX > this.canvas.width + 50 ||
            screenY < -50 || screenY > this.canvas.height + 50) {
            return;
        }
        
        // Draw entity based on type
        this.context.save();
        
        if (entity.type === 'player') {
            // Draw player as blue circle
            this.context.fillStyle = entity === this.game.player ? '#0066FF' : '#4488FF';
            this.context.beginPath();
            this.context.arc(screenX, screenY, 16, 0, Math.PI * 2);
            this.context.fill();
            
            // Draw player name
            if (entity.name) {
                this.context.fillStyle = '#000000';
                this.context.font = '12px Arial';
                this.context.textAlign = 'center';
                this.context.fillText(entity.name, screenX, screenY - 25);
            }
        } else {
            // Draw other entities as red squares
            this.context.fillStyle = '#FF0000';
            this.context.fillRect(screenX - 8, screenY - 8, 16, 16);
        }
        
        this.context.restore();
    };
    
    Renderer.prototype.renderUI = function() {
        // Draw simple UI info
        this.context.fillStyle = '#000000';
        this.context.font = '14px Arial';
        this.context.textAlign = 'left';
        
        var y = 20;
        
        if (this.game.player) {
            this.context.fillText('Player: ' + this.game.player.name, 10, y);
            y += 20;
            this.context.fillText('Position: ' + this.game.player.x + ', ' + this.game.player.y, 10, y);
            y += 20;
            this.context.fillText('HP: ' + (this.game.player.hitPoints || 100), 10, y);
            y += 20;
        }
        
        this.context.fillText('Players online: ' + Object.keys(this.game.players).length, 10, y);
        y += 20;
        
        this.context.fillText('Click to move, Enter to chat', 10, y);
    };
    
    Renderer.prototype.handleResize = function() {
        // Handle window resize if needed
        console.log('Renderer resize handled');
    };
    
    return Renderer;
});