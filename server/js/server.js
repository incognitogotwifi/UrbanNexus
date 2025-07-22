var _ = require('underscore');
var cls = require('./lib/class');
var Log = require('log');
var WorldServer = require('./worldserver');

var MultiWorldServer = cls.Class.extend({
    init: function(config, log) {
        var self = this;
        
        this.config = config;
        this.log = log;
        this.worlds = [];
        this.upTime = new Date();
        
        // Determine number of worlds to create
        this.nb_worlds = this.config.nb_worlds || 1;
        
        this.log.info("Initializing " + this.nb_worlds + " world(s)...");
        
        for(var i = 0; i < this.nb_worlds; i += 1) {
            this.worlds[i] = new WorldServer('world' + (i+1), this.config, this.log);
            this.worlds[i].run(this.config.port + i);
        }
        
        this.log.info("Server initialized successfully");
    },
    
    run: function() {
        var self = this;
        
        process.on('SIGINT', function() {
            self.log.info('Shutting down server...');
            _.each(self.worlds, function(world) {
                world.shutdown();
            });
            process.exit();
        });
        
        this.log.info("BrowserQuest server is now listening on port(s) " + 
                      this.config.port + 
                      (this.nb_worlds > 1 ? "-" + (this.config.port + this.nb_worlds - 1) : ""));
    },
    
    getUpTime: function() {
        return Date.now() - this.upTime;
    },
    
    getWorlds: function() {
        return this.worlds;
    }
});

if(typeof exports !== 'undefined') {
    module.exports = {
        MultiWorldServer: MultiWorldServer
    };
}
