define([], function() {
    'use strict';
    
    var Map = function(mapData) {
        this.data = mapData;
        this.width = mapData.width || 172;
        this.height = mapData.height || 314;
        this.tilewidth = mapData.tilewidth || 16;
        this.tileheight = mapData.tileheight || 16;
        
        this.layers = mapData.layers || [];
        this.tilesets = mapData.tilesets || [];
        
        // Initialize collision data
        this.collisions = [];
        this.blocked = [];
        
        this.parseMapData();
    };
    
    Map.prototype.parseMapData = function() {
        // Initialize collision and blocking arrays
        for (var i = 0; i < this.width * this.height; i++) {
            this.collisions[i] = false;
            this.blocked[i] = false;
        }
        
        // Parse collision data from layers
        this.layers.forEach(function(layer) {
            if (layer.properties) {
                var collision = layer.properties.find(function(prop) {
                    return prop.name === 'collision' && prop.value === true;
                });
                
                if (collision && layer.data) {
                    this.parseCollisionLayer(layer);
                }
            }
        }.bind(this));
    };
    
    Map.prototype.parseCollisionLayer = function(layer) {
        if (!layer.data) return;
        
        for (var i = 0; i < layer.data.length; i++) {
            if (layer.data[i] > 0) {
                this.collisions[i] = true;
                this.blocked[i] = true;
            }
        }
    };
    
    Map.prototype.getTileId = function(x, y, layerIndex) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
            return 0;
        }
        
        var layer = this.layers[layerIndex || 0];
        if (!layer || !layer.data) {
            return 0;
        }
        
        var index = y * this.width + x;
        return layer.data[index] || 0;
    };
    
    Map.prototype.isColliding = function(x, y) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
            return true;
        }
        
        var index = y * this.width + x;
        return this.collisions[index] || false;
    };
    
    Map.prototype.isBlocked = function(x, y) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
            return true;
        }
        
        var index = y * this.width + x;
        return this.blocked[index] || false;
    };
    
    Map.prototype.getRandomSpawnPosition = function() {
        var attempts = 0;
        var maxAttempts = 100;
        
        while (attempts < maxAttempts) {
            var x = Math.floor(Math.random() * this.width);
            var y = Math.floor(Math.random() * this.height);
            
            if (!this.isBlocked(x, y)) {
                return { x: x, y: y };
            }
            
            attempts++;
        }
        
        // Fallback to center of map
        return { x: Math.floor(this.width / 2), y: Math.floor(this.height / 2) };
    };
    
    return Map;
});