define([], function() {
    'use strict';
    
    var Map = function() {
        this.width = 172;
        this.height = 314;
        this.tilewidth = 16;
        this.tileheight = 16;
        this.isLoaded = true;
        
        console.log('Map initialized');
    };
    
    return Map;
});