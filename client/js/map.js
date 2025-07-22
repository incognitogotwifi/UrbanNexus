define([], function() {
    'use strict';
    
    var Map = function(data) {
        this.data = data;
        this.width = data.width;
        this.height = data.height;
        this.tileSize = data.tilesize || 32;
        
        // Map layers
        this.layers = data.layers || [];
        this.collision = [];
        this.zones = {};
        this.checkpoints = [];
        this.doors = [];
        this.musicAreas = [];
        
        // Initialize collision data
        this.initCollisions();
        this.initZones();
        this.initCheckpoints();
        this.initDoors();
        this.initMusicAreas();
    };
    
    Map.prototype.initCollisions = function() {
        // Initialize collision array
        this.collision = [];
        for (var i = 0; i < this.height; i++) {
            this.collision[i] = [];
            for (var j = 0; j < this.width; j++) {
                this.collision[i][j] = 0;
            }
        }
        
        // Find collision layer
        for (var l = 0; l < this.layers.length; l++) {
            var layer = this.layers[l];
            if (layer.name === 'collision' && layer.data) {
                for (var y = 0; y < this.height; y++) {
                    for (var x = 0; x < this.width; x++) {
                        var index = y * this.width + x;
                        if (layer.data[index] > 0) {
                            this.collision[y][x] = 1;
                        }
                    }
                }
                break;
            }
        }
    };
    
    Map.prototype.initZones = function() {
        // Find zones in object layers
        for (var l = 0; l < this.layers.length; l++) {
            var layer = this.layers[l];
            if (layer.type === 'objectgroup' && layer.objects) {
                for (var o = 0; o < layer.objects.length; o++) {
                    var obj = layer.objects[o];
                    if (obj.type === 'zone') {
                        this.zones[obj.name] = {
                            x: Math.floor(obj.x / this.tileSize),
                            y: Math.floor(obj.y / this.tileSize),
                            width: Math.floor(obj.width / this.tileSize),
                            height: Math.floor(obj.height / this.tileSize),
                            id: obj.name
                        };
                    }
                }
            }
        }
    };
    
    Map.prototype.initCheckpoints = function() {
        // Find checkpoint objects
        for (var l = 0; l < this.layers.length; l++) {
            var layer = this.layers[l];
            if (layer.type === 'objectgroup' && layer.objects) {
                for (var o = 0; o < layer.objects.length; o++) {
                    var obj = layer.objects[o];
                    if (obj.type === 'checkpoint') {
                        this.checkpoints.push({
                            id: obj.name,
                            x: Math.floor(obj.x / this.tileSize),
                            y: Math.floor(obj.y / this.tileSize),
                            width: Math.floor(obj.width / this.tileSize),
                            height: Math.floor(obj.height / this.tileSize)
                        });
                    }
                }
            }
        }
    };
    
    Map.prototype.initDoors = function() {
        // Find door objects
        for (var l = 0; l < this.layers.length; l++) {
            var layer = this.layers[l];
            if (layer.type === 'objectgroup' && layer.objects) {
                for (var o = 0; o < layer.objects.length; o++) {
                    var obj = layer.objects[o];
                    if (obj.type === 'door') {
                        this.doors.push({
                            id: obj.name,
                            x: Math.floor(obj.x / this.tileSize),
                            y: Math.floor(obj.y / this.tileSize),
                            destination: obj.properties ? obj.properties.destination : null,
                            targetX: obj.properties ? obj.properties.targetX : 0,
                            targetY: obj.properties ? obj.properties.targetY : 0
                        });
                    }
                }
            }
        }
    };
    
    Map.prototype.initMusicAreas = function() {
        // Find music area objects
        for (var l = 0; l < this.layers.length; l++) {
            var layer = this.layers[l];
            if (layer.type === 'objectgroup' && layer.objects) {
                for (var o = 0; o < layer.objects.length; o++) {
                    var obj = layer.objects[o];
                    if (obj.type === 'music') {
                        this.musicAreas.push({
                            id: obj.name,
                            x: Math.floor(obj.x / this.tileSize),
                            y: Math.floor(obj.y / this.tileSize),
                            width: Math.floor(obj.width / this.tileSize),
                            height: Math.floor(obj.height / this.tileSize),
                            track: obj.properties ? obj.properties.track : 'village'
                        });
                    }
                }
            }
        }
    };
    
    Map.prototype.getTileId = function(x, y, layer) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
            return 0;
        }
        
        layer = layer || 0;
        if (layer >= this.layers.length) {
            return 0;
        }
        
        var mapLayer = this.layers[layer];
        if (!mapLayer.data) {
            return 0;
        }
        
        var index = y * this.width + x;
        return mapLayer.data[index] || 0;
    };
    
    Map.prototype.isColliding = function(x, y) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
            return true; // Out of bounds
        }
        
        return this.collision[y][x] === 1;
    };
    
    Map.prototype.getZoneAt = function(x, y) {
        for (var zoneName in this.zones) {
            var zone = this.zones[zoneName];
            if (x >= zone.x && x < zone.x + zone.width &&
                y >= zone.y && y < zone.y + zone.height) {
                return zone;
            }
        }
        return null;
    };
    
    Map.prototype.getCheckpointAt = function(x, y) {
        for (var i = 0; i < this.checkpoints.length; i++) {
            var checkpoint = this.checkpoints[i];
            if (x >= checkpoint.x && x < checkpoint.x + checkpoint.width &&
                y >= checkpoint.y && y < checkpoint.y + checkpoint.height) {
                return checkpoint;
            }
        }
        return null;
    };
    
    Map.prototype.getDoorAt = function(x, y) {
        for (var i = 0; i < this.doors.length; i++) {
            var door = this.doors[i];
            if (x === door.x && y === door.y) {
                return door;
            }
        }
        return null;
    };
    
    Map.prototype.getMusicAreaAt = function(x, y) {
        for (var i = 0; i < this.musicAreas.length; i++) {
            var area = this.musicAreas[i];
            if (x >= area.x && x < area.x + area.width &&
                y >= area.y && y < area.y + area.height) {
                return area;
            }
        }
        return null;
    };
    
    Map.prototype.forEachTile = function(callback, layer) {
        layer = layer || 0;
        
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                var tileId = this.getTileId(x, y, layer);
                if (tileId > 0) {
                    callback(tileId, x, y);
                }
            }
        }
    };
    
    Map.prototype.forEachHighTile = function(callback) {
        this.forEachTile(callback, 2); // Foreground layer
    };
    
    Map.prototype.isOutOfBounds = function(x, y) {
        return x < 0 || y < 0 || x >= this.width || y >= this.height;
    };
    
    Map.prototype.isValid = function(x, y) {
        return !this.isOutOfBounds(x, y) && !this.isColliding(x, y);
    };
    
    Map.prototype.getRandomValidPosition = function() {
        var attempts = 0;
        var maxAttempts = 100;
        
        while (attempts < maxAttempts) {
            var x = Math.floor(Math.random() * this.width);
            var y = Math.floor(Math.random() * this.height);
            
            if (this.isValid(x, y)) {
                return { x: x, y: y };
            }
            
            attempts++;
        }
        
        // Fallback to center of map
        return { x: Math.floor(this.width / 2), y: Math.floor(this.height / 2) };
    };
    
    Map.prototype.getSpawnPosition = function() {
        // Look for spawn point in checkpoints
        for (var i = 0; i < this.checkpoints.length; i++) {
            var checkpoint = this.checkpoints[i];
            if (checkpoint.id === 'spawn' || checkpoint.id === 'start') {
                return { 
                    x: checkpoint.x + Math.floor(checkpoint.width / 2),
                    y: checkpoint.y + Math.floor(checkpoint.height / 2)
                };
            }
        }
        
        // Fallback to a safe position
        return this.getRandomValidPosition();
    };
    
    Map.prototype.getNearestValidPosition = function(x, y, maxDistance) {
        maxDistance = maxDistance || 5;
        
        // Check if current position is valid
        if (this.isValid(x, y)) {
            return { x: x, y: y };
        }
        
        // Search in expanding circles
        for (var distance = 1; distance <= maxDistance; distance++) {
            for (var dx = -distance; dx <= distance; dx++) {
                for (var dy = -distance; dy <= distance; dy++) {
                    if (Math.abs(dx) === distance || Math.abs(dy) === distance) {
                        var newX = x + dx;
                        var newY = y + dy;
                        
                        if (this.isValid(newX, newY)) {
                            return { x: newX, y: newY };
                        }
                    }
                }
            }
        }
        
        // No valid position found nearby
        return this.getRandomValidPosition();
    };
    
    return Map;
});

