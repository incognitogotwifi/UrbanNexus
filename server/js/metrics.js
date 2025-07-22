var Metrics = function(config) {
    this.config = config;
    this.isReady = false;
    
    // Simple mock implementation for now
    setTimeout(() => {
        this.isReady = true;
    }, 100);
};

Metrics.prototype.getTotalPlayers = function(callback) {
    // Return a simple count for now
    callback(0);
};

Metrics.prototype.getOpenWorldCount = function(callback) {
    // Return default world count
    callback(this.config.nb_worlds || 1);
};

module.exports = Metrics;