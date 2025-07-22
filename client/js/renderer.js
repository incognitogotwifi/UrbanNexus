define(['camera'], function(Camera) {
    'use strict';
    
    var Renderer = function(game) {
        this.game = game;
        
        this.canvas = {
            background: null,
            entities: null,
            foreground: null,
            cursor: null
        };
        
        this.context = {
            background: null,
            entities: null,
            foreground: null,
            cursor: null
        };
        
        this.sprites = {};
        this.tilesheet = null;
        
        this.animatedTiles = [];
        this.highTiles = [];
        
        this.tablet = Modernizr.touch;
        this.mobile = this.tablet || $(window).width() <= 1000;
        
        this.rescale = this.mobile ? 1 : 2;
        this.tilesize = 32;
        this.upscaledRendering = this.rescale === 2;
        
        this.supportsSilhouettes = true;
        
        this.lastTime = Date.now();
        this.frameCount = 0;
        this.realFPS = 0;
        this.debugInfoVisible = false;
        
        this.stopRendering = false;
        this.animateTiles = true;
        
        this.drawTarget = false;
        this.selectedCellVisible = false;
        
        this.camera = null;
    };
    
    Renderer.prototype.initCanvas = function() {
        this.canvas.background = document.getElementById('background');
        this.canvas.entities = document.getElementById('entities');
        this.canvas.foreground = document.getElementById('foreground');
        this.canvas.cursor = document.getElementById('cursor');
        
        if (!this.canvas.background) {
            // Create canvases if they don't exist
            this.createCanvases();
        }
        
        this.context.background = this.canvas.background.getContext('2d');
        this.context.entities = this.canvas.entities.getContext('2d');
        this.context.foreground = this.canvas.foreground.getContext('2d');
        this.context.cursor = this.canvas.cursor.getContext('2d');
        
        this.initCanvasSize();
        
        // Disable image smoothing for pixel art
        this.setImageSmoothing(false);
    };
    
    Renderer.prototype.createCanvases = function() {
        var container = $('#gamecontainer');
        
        this.canvas.background = $('<canvas id="background">').appendTo(container)[0];
        this.canvas.entities = $('<canvas id="entities">').appendTo(container)[0];
        this.canvas.foreground = $('<canvas id="foreground">').appendTo(container)[0];
        this.canvas.cursor = $('<canvas id="cursor">').appendTo(container)[0];
    };
    
    Renderer.prototype.initCanvasSize = function() {
        var w = $(window).width();
        var h = $(window).height();
        
        // Set canvas size
        Object.keys(this.canvas).forEach(function(key) {
            if (this.canvas[key]) {
                this.canvas[key].width = w;
                this.canvas[key].height = h;
            }
        }.bind(this));
    };
    
    Renderer.prototype.setImageSmoothing = function(enabled) {
        Object.keys(this.context).forEach(function(key) {
            var ctx = this.context[key];
            if (ctx) {
                ctx.imageSmoothingEnabled = enabled;
                ctx.webkitImageSmoothingEnabled = enabled;
                ctx.mozImageSmoothingEnabled = enabled;
                ctx.msImageSmoothingEnabled = enabled;
                ctx.oImageSmoothingEnabled = enabled;
            }
        }.bind(this));
    };
    
    Renderer.prototype.getWidth = function() {
        return this.canvas.background ? this.canvas.background.width : 0;
    };
    
    Renderer.prototype.getHeight = function() {
        return this.canvas.background ? this.canvas.background.height : 0;
    };
    
    Renderer.prototype.handleResize = function() {
        this.initCanvasSize();
        
        if (this.game.camera) {
            this.game.camera.setBounds(0, 0, 
                this.game.map.width * this.tilesize,
                this.game.map.height * this.tilesize
            );
        }
    };
    
    Renderer.prototype.loadSprites = function(spriteData) {
        this.sprites = spriteData;
        
        var self = this;
        
        // Load tilesheet
        this.tilesheet = new Image();
        this.tilesheet.onload = function() {
            self.tilesheetLoaded = true;
        };
        this.tilesheet.src = 'img/tilesheet.png';
    };
    
    Renderer.prototype.render = function() {
        if (this.stopRendering || !this.game.ready || !this.tilesheetLoaded) {
            return;
        }
        
        this.clearScreen();
        this.updateFPS();
        
        if (this.game.map && this.game.camera) {
            this.renderBackground();
            this.renderEntities();
            this.renderForeground();
            this.renderUI();
        }
    };
    
    Renderer.prototype.clearScreen = function() {
        Object.keys(this.context).forEach(function(key) {
            var ctx = this.context[key];
            if (ctx) {
                ctx.clearRect(0, 0, this.getWidth(), this.getHeight());
            }
        }.bind(this));
    };
    
    Renderer.prototype.renderBackground = function() {
        var ctx = this.context.background;
        var camera = this.game.camera;
        var map = this.game.map;
        
        if (!ctx || !camera || !map) return;
        
        var self = this;
        camera.forEachVisiblePosition(function(x, y) {
            if (x >= 0 && y >= 0 && x < map.width && y < map.height) {
                var tileId = map.getTileId(x, y, 0); // Background layer
                if (tileId && tileId > 0) {
                    self.drawTile(ctx, tileId, x, y);
                }
            }
        }, 1);
    };
    
    Renderer.prototype.renderEntities = function() {
        var ctx = this.context.entities;
        var camera = this.game.camera;
        
        if (!ctx || !camera) return;
        
        var entities = this.game.entities.slice();
        
        // Sort entities by Y position for proper layering
        entities.sort(function(a, b) {
            if (a.y === b.y) {
                return a.id - b.id; // Stable sort by ID if Y is the same
            }
            return a.y - b.y;
        });
        
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            if (entity.visible && camera.isVisible(entity)) {
                this.drawEntity(ctx, entity);
            }
        }
        
        // Render selected cell
        if (this.game.selectedCellVisible && this.drawTarget) {
            this.drawTarget();
        }
    };
    
    Renderer.prototype.renderForeground = function() {
        var ctx = this.context.foreground;
        var camera = this.game.camera;
        var map = this.game.map;
        
        if (!ctx || !camera || !map) return;
        
        var self = this;
        camera.forEachVisiblePosition(function(x, y) {
            if (x >= 0 && y >= 0 && x < map.width && y < map.height) {
                var tileId = map.getTileId(x, y, 2); // Foreground layer
                if (tileId && tileId > 0) {
                    self.drawTile(ctx, tileId, x, y);
                }
            }
        }, 1);
    };
    
    Renderer.prototype.renderUI = function() {
        if (this.debugInfoVisible) {
            this.drawDebugInfo();
        }
    };
    
    Renderer.prototype.drawEntity = function(ctx, entity) {
        var sprite = entity.sprite;
        if (!sprite || !this.sprites[sprite.name]) {
            return;
        }
        
        var spriteData = this.sprites[sprite.name];
        var frame = entity.getCurrentFrame();
        
        var screenPos = this.game.camera.worldToScreen(entity.x, entity.y);
        
        var sx = (frame % spriteData.w) * this.tilesize;
        var sy = Math.floor(frame / spriteData.w) * this.tilesize;
        
        var dx = screenPos.x;
        var dy = screenPos.y;
        
        // Apply entity-specific rendering effects
        ctx.save();
        
        if (entity.flipSpriteX) {
            ctx.scale(-1, 1);
            dx = -dx - this.tilesize;
        }
        
        if (entity.fadingAlpha < 1) {
            ctx.globalAlpha = entity.fadingAlpha;
        }
        
        // Draw entity shadow
        if (entity.hasShadow && entity.hasShadow()) {
            this.drawEntityShadow(ctx, entity, dx, dy);
        }
        
        // Draw entity sprite
        ctx.drawImage(
            this.tilesheet,
            sx, sy, this.tilesize, this.tilesize,
            dx, dy, this.tilesize * this.rescale, this.tilesize * this.rescale
        );
        
        // Draw health bar for characters
        if (entity.type === 'mob' || (entity.type === 'player' && entity !== this.game.player)) {
            this.drawHealthBar(ctx, entity, dx, dy - 8);
        }
        
        ctx.restore();
    };
    
    Renderer.prototype.drawEntityShadow = function(ctx, entity, x, y) {
        // Simple shadow implementation
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(x + 4, y + this.tilesize - 4, this.tilesize - 8, 4);
        ctx.restore();
    };
    
    Renderer.prototype.drawHealthBar = function(ctx, entity, x, y) {
        if (!entity.hitPoints || !entity.maxHitPoints) {
            return;
        }
        
        var percentage = entity.hitPoints / entity.maxHitPoints;
        var barWidth = 24;
        var barHeight = 3;
        
        ctx.save();
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x + 4, y, barWidth, barHeight);
        
        // Health bar
        if (percentage > 0.6) {
            ctx.fillStyle = 'green';
        } else if (percentage > 0.3) {
            ctx.fillStyle = 'orange';
        } else {
            ctx.fillStyle = 'red';
        }
        
        ctx.fillRect(x + 4, y, barWidth * percentage, barHeight);
        
        ctx.restore();
    };
    
    Renderer.prototype.drawTile = function(ctx, tileId, gridX, gridY) {
        if (!this.tilesheet || tileId <= 0) {
            return;
        }
        
        var tilesPerRow = Math.floor(this.tilesheet.width / this.tilesize);
        var sx = ((tileId - 1) % tilesPerRow) * this.tilesize;
        var sy = Math.floor((tileId - 1) / tilesPerRow) * this.tilesize;
        
        var screenPos = this.game.camera.worldToScreen(gridX * this.tilesize, gridY * this.tilesize);
        
        ctx.drawImage(
            this.tilesheet,
            sx, sy, this.tilesize, this.tilesize,
            screenPos.x, screenPos.y, this.tilesize * this.rescale, this.tilesize * this.rescale
        );
    };
    
    Renderer.prototype.drawTarget = function() {
        var ctx = this.context.cursor;
        var camera = this.game.camera;
        
        var screenPos = camera.worldToScreen(this.game.selectedX, this.game.selectedY);
        
        ctx.save();
        ctx.strokeStyle = this.game.targetBorderColor;
        ctx.fillStyle = this.game.targetColor;
        ctx.lineWidth = 2;
        
        ctx.fillRect(screenPos.x, screenPos.y, this.tilesize, this.tilesize);
        ctx.strokeRect(screenPos.x, screenPos.y, this.tilesize, this.tilesize);
        
        ctx.restore();
    };
    
    Renderer.prototype.drawDebugInfo = function() {
        var ctx = this.context.cursor;
        
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        
        var y = 20;
        ctx.fillText('FPS: ' + this.realFPS, 10, y);
        
        if (this.game.player) {
            y += 15;
            ctx.fillText('Player: (' + this.game.player.gridX + ', ' + this.game.player.gridY + ')', 10, y);
        }
        
        if (this.game.camera) {
            y += 15;
            ctx.fillText('Camera: (' + Math.round(this.game.camera.x) + ', ' + Math.round(this.game.camera.y) + ')', 10, y);
        }
        
        y += 15;
        ctx.fillText('Entities: ' + this.game.entities.length, 10, y);
        
        ctx.restore();
    };
    
    Renderer.prototype.updateFPS = function() {
        var now = Date.now();
        this.frameCount++;
        
        if (now - this.lastTime >= 1000) {
            this.realFPS = Math.round(this.frameCount * 1000 / (now - this.lastTime));
            this.frameCount = 0;
            this.lastTime = now;
        }
    };
    
    Renderer.prototype.onMouseMove = function(callback) {
        var self = this;
        $(this.canvas.cursor).mousemove(function(e) {
            var offset = $(self.canvas.cursor).offset();
            var x = e.pageX - offset.left;
            var y = e.pageY - offset.top;
            
            if (callback) {
                callback(x, y);
            }
        });
    };
    
    Renderer.prototype.onMouseClick = function(callback) {
        var self = this;
        $(this.canvas.cursor).click(function(e) {
            var offset = $(self.canvas.cursor).offset();
            var x = e.pageX - offset.left;
            var y = e.pageY - offset.top;
            
            if (callback) {
                callback(x, y);
            }
        });
    };
    
    Renderer.prototype.isWebGLSupported = function() {
        try {
            var canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    };
    
    Renderer.prototype.initWebGL = function() {
        // WebGL initialization would go here
        // For now, we'll stick with 2D canvas rendering
    };
    
    return Renderer;
});
