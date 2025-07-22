// West Law Game Configuration
var Config = {
    host: window.location.hostname,
    port: 5000,
    game: {
        name: "West Law",
        version: "1.0.0"
    },
    debug: false,
    supportsWorkers: !!window.Worker,
    worldSize: {
        width: 1024,
        height: 1024
    },
    renderer: {
        mobile: {
            scale: 1.0,
            tileSize: 16
        },
        desktop: {
            scale: 2.0,
            tileSize: 16
        }
    }
};

// Mobile detection
var isMobile = (window.navigator && window.navigator.userAgent.match(/(iPad|iPhone|iPod|Android|webOS|BlackBerry|Windows Phone)/g)? true : false);

// Auto-start configuration
window.autoStartGame = true;