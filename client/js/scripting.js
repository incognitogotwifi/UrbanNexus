define(['config'], function(Config) {
    'use strict';
    
    var Scripting = function(game) {
        this.game = game;
        this.scripts = {};
        this.playerScripts = [];
        this.npcScripts = {};
        this.eventHandlers = {};
        
        // iAppsBeats scripting features
        this.asyncOperations = [];
        this.timers = {};
        this.intervals = {};
        
        this.initializeScripting();
    };
    
    Scripting.prototype.initializeScripting = function() {
        // Load player script classes from config
        if (this.game.config && this.game.config.playerscriptclasses) {
            this.loadPlayerScriptClasses(this.game.config.playerscriptclasses);
        }
        
        // Initialize event system
        this.setupEventHandlers();
    };
    
    Scripting.prototype.loadPlayerScriptClasses = function(scriptClasses) {
        var self = this;
        scriptClasses.forEach(function(scriptClass) {
            self.loadScript('player_scripts/' + scriptClass + '.js', function(script) {
                if (script) {
                    self.playerScripts.push(script);
                }
            });
        });
    };
    
    Scripting.prototype.loadScript = function(path, callback) {
        // Load script files (placeholder for actual implementation)
        var script = {
            name: path,
            init: function() {},
            onPlayerJoin: function(player) {},
            onPlayerLeave: function(player) {},
            onPlayerMessage: function(player, message) {},
            onPlayerMove: function(player, x, y) {},
            onPlayerAttack: function(player, target) {},
            onPlayerDeath: function(player) {},
            onPlayerLevelUp: function(player) {},
            onNPCInteraction: function(player, npc) {},
            onItemPickup: function(player, item) {},
            onItemUse: function(player, item) {}
        };
        
        if (callback) {
            callback(script);
        }
    };
    
    Scripting.prototype.setupEventHandlers = function() {
        var self = this;
        
        // Player events
        this.eventHandlers.playerJoin = function(player) {
            self.playerScripts.forEach(function(script) {
                if (script.onPlayerJoin) {
                    script.onPlayerJoin(player);
                }
            });
        };
        
        this.eventHandlers.playerMessage = function(player, message) {
            self.playerScripts.forEach(function(script) {
                if (script.onPlayerMessage) {
                    script.onPlayerMessage(player, message);
                }
            });
        };
        
        this.eventHandlers.playerMove = function(player, x, y) {
            self.playerScripts.forEach(function(script) {
                if (script.onPlayerMove) {
                    script.onPlayerMove(player, x, y);
                }
            });
        };
    };
    
    // iAppsBeats async/await support
    Scripting.prototype.async = function(operation) {
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                try {
                    var result = operation();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            }, 0);
        });
    };
    
    Scripting.prototype.await = function(promise, callback) {
        promise.then(callback).catch(function(error) {
            console.error('Script async operation failed:', error);
        });
    };
    
    // Timer system
    Scripting.prototype.setTimeout = function(callback, delay, id) {
        var timerId = id || 'timer_' + Date.now();
        this.timers[timerId] = setTimeout(callback, delay);
        return timerId;
    };
    
    Scripting.prototype.clearTimeout = function(timerId) {
        if (this.timers[timerId]) {
            clearTimeout(this.timers[timerId]);
            delete this.timers[timerId];
        }
    };
    
    Scripting.prototype.setInterval = function(callback, interval, id) {
        var intervalId = id || 'interval_' + Date.now();
        this.intervals[intervalId] = setInterval(callback, interval);
        return intervalId;
    };
    
    Scripting.prototype.clearInterval = function(intervalId) {
        if (this.intervals[intervalId]) {
            clearInterval(this.intervals[intervalId]);
            delete this.intervals[intervalId];
        }
    };
    
    // NPC scripting
    Scripting.prototype.addScriptNPC = function(npc, scriptClass) {
        var script = this.loadNPCScript(scriptClass);
        if (script) {
            this.npcScripts[npc.id] = script;
            script.init(npc);
        }
    };
    
    Scripting.prototype.loadNPCScript = function(scriptClass) {
        // Load NPC script (placeholder implementation)
        return {
            init: function(npc) {
                npc.scriptClass = scriptClass;
            },
            onPlayerNear: function(npc, player) {},
            onPlayerInteract: function(npc, player) {},
            onPlayerLeave: function(npc, player) {},
            update: function(npc) {}
        };
    };
    
    // Event triggering
    Scripting.prototype.triggerEvent = function(eventName, data) {
        if (this.eventHandlers[eventName]) {
            this.eventHandlers[eventName](data);
        }
    };
    
    // Cleanup
    Scripting.prototype.cleanup = function() {
        // Clear all timers and intervals
        Object.keys(this.timers).forEach(function(timerId) {
            clearTimeout(this.timers[timerId]);
        });
        
        Object.keys(this.intervals).forEach(function(intervalId) {
            clearInterval(this.intervals[intervalId]);
        });
        
        this.timers = {};
        this.intervals = {};
    };
    
    return Scripting;
});