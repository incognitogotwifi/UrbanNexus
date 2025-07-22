#!/usr/bin/env node

var Log = require('log');
var fs = require('fs');
var config_file = process.argv[2] || './server/config/config_local.json';
var config_exists = fs.existsSync(config_file);

if (!config_exists) {
    console.log("The config file: " + config_file + " does not exist.");
    process.exit(0);
}

var config = JSON.parse(fs.readFileSync(config_file, 'utf8'));
var log = new Log(config.debug_level);
var ws = require('./server');

function main() {
    log.info("Starting BrowserQuest game server...");
    
    process.on('uncaughtException', function (e) {
        log.error('uncaughtException: ' + e.stack);
    });
    
    var server = new ws.MultiWorldServer(config, log);
    server.run();
}

if (require.main === module) {
    main();
}

module.exports = main;
