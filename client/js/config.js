// BrowserQuest Client Configuration
// This file provides the main configuration for the client-side game

define([], function() {
    'use strict';
    
    var Config = {
        // Server connection settings
        host: window.location.hostname || '0.0.0.0',
        port: 5000,
        
        // Game settings
        game: {
            name: "West Law",
            version: "1.0.0",
            debug: false
        },
        
        // World configuration
        world: {
            width: 172 * 16,  // From world_server.json
            height: 314 * 16, // From world_server.json
            tileSize: 16
        },
        
        // Renderer settings
        renderer: {
            mobile: {
                scale: 1.0,
                tileSize: 16
            },
            desktop: {
                scale: 2.0,
                tileSize: 16
            }
        },
        
        // Player settings
        player: {
            startHP: 100,
            startCoins: 1000,
            startBombs: 10,
            startArrows: 100,
            maxArrows: 999,
            maxBombs: 999
        },
        
        // UI settings
        ui: {
            hotkeys: 5,
            shiftChat: false,
            enableMinimap: true,
            enableParticles: true
        },
        
        // Audio settings
        audio: {
            enabled: true,
            volume: 0.5,
            sfxVolume: 0.7,
            musicVolume: 0.3
        },
        
        // Feature flags
        features: {
            supportsWorkers: !!window.Worker,
            enableAdvancedNPCs: true,
            enableParticleEngine: true,
            enableBaniAnimations: true,
            enableScripting: true
        }
    };
    
    // Mobile detection
    Config.isMobile = (window.navigator && window.navigator.userAgent.match(/(iPad|iPhone|iPod|Android|webOS|BlackBerry|Windows Phone)/g) ? true : false);
    
    // Auto-start configuration
    window.autoStartGame = true;
    
    return Config;
});