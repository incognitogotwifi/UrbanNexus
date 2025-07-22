var fs = require('fs'),
    path = require('path'),
    url = require('url');

function main(config) {
    var WorldServer = require("./worldserver"),
        log = console;
    log.info("Starting BrowserQuest game server...");
    
    // Create and start the world server
    var world = new WorldServer('world1', config, log);
    world.run(config.port);
    
    log.info("BrowserQuest world initialized successfully - ready for player connections");
    
    process.on('uncaughtException', function (e) {
        log.error('uncaughtException: ' + e);
    });
}

function getConfigFile(path, callback) {
    fs.readFile(path, 'utf8', function(err, json_string) {
        if(err) {
            console.error("Could not open config file:", err.path);
            callback(null);
        } else {
            callback(JSON.parse(json_string));
        }
    });
}

var defaultConfigPath = './config.json',
    customConfigPath = './config_local.json';

process.argv.forEach(function (val, index, array) {
    if(index === 2) {
        customConfigPath = val;
    }
});

getConfigFile(defaultConfigPath, function(defaultConfig) {
    getConfigFile(customConfigPath, function(localConfig) {
        if(localConfig) {
            main(localConfig);
        } else if(defaultConfig) {
            main(defaultConfig);
        } else {
            console.error("Server cannot start without any configuration file.");
            process.exit(1);
        }
    });
});