define([], function() {
    'use strict';
    
    var ConfigManager = function() {
        this.configs = {};
        this.loaded = {};
        this.callbacks = {};
        
        this.initializeConfigManager();
    };
    
    ConfigManager.prototype.initializeConfigManager = function() {
        this.loadAllConfigs();
    };
    
    ConfigManager.prototype.loadAllConfigs = function() {
        var configFiles = [
            'main.json',
            'adminrights.json',
            'bans.json',
            'chatcommands.json',
            'mapmarkers.json',
            'nopkzones.json'
        ];
        
        var self = this;
        configFiles.forEach(function(configFile) {
            self.loadConfig(configFile);
        });
        
        // Load client config separately (JS file)
        this.loadClientConfig();
    };
    
    ConfigManager.prototype.loadConfig = function(configName, callback) {
        var self = this;
        
        if (this.loaded[configName]) {
            if (callback) callback(this.configs[configName]);
            return;
        }
        
        $.getJSON('config/' + configName, function(data) {
            self.configs[configName] = data;
            self.loaded[configName] = true;
            
            if (callback) callback(data);
            
            // Execute any pending callbacks
            if (self.callbacks[configName]) {
                self.callbacks[configName].forEach(function(cb) {
                    cb(data);
                });
                delete self.callbacks[configName];
            }
            
            console.log('Loaded config:', configName);
        }).fail(function() {
            console.warn('Failed to load config:', configName);
            self.configs[configName] = {};
            self.loaded[configName] = true;
            
            if (callback) callback({});
        });
    };
    
    ConfigManager.prototype.loadClientConfig = function() {
        var self = this;
        
        // Load clientconfig.js
        var script = document.createElement('script');
        script.src = 'config/clientconfig.js';
        script.onload = function() {
            if (typeof gameconfig !== 'undefined') {
                self.configs['clientconfig'] = gameconfig;
                self.loaded['clientconfig'] = true;
                console.log('Loaded client config');
            }
        };
        script.onerror = function() {
            console.warn('Failed to load client config');
            self.configs['clientconfig'] = {};
            self.loaded['clientconfig'] = true;
        };
        
        document.head.appendChild(script);
    };
    
    ConfigManager.prototype.getConfig = function(configName, callback) {
        if (this.loaded[configName]) {
            if (callback) callback(this.configs[configName]);
            return this.configs[configName];
        } else {
            if (callback) {
                if (!this.callbacks[configName]) {
                    this.callbacks[configName] = [];
                }
                this.callbacks[configName].push(callback);
            }
            
            this.loadConfig(configName);
            return null;
        }
    };
    
    ConfigManager.prototype.getMainConfig = function(callback) {
        return this.getConfig('main.json', callback);
    };
    
    ConfigManager.prototype.getAdminRights = function(callback) {
        return this.getConfig('adminrights.json', callback);
    };
    
    ConfigManager.prototype.getBans = function(callback) {
        return this.getConfig('bans.json', callback);
    };
    
    ConfigManager.prototype.getChatCommands = function(callback) {
        return this.getConfig('chatcommands.json', callback);
    };
    
    ConfigManager.prototype.getMapMarkers = function(callback) {
        return this.getConfig('mapmarkers.json', callback);
    };
    
    ConfigManager.prototype.getNoPKZones = function(callback) {
        return this.getConfig('nopkzones.json', callback);
    };
    
    ConfigManager.prototype.getClientConfig = function(callback) {
        return this.getConfig('clientconfig', callback);
    };
    
    ConfigManager.prototype.reloadConfig = function(configName, callback) {
        this.loaded[configName] = false;
        delete this.configs[configName];
        this.loadConfig(configName, callback);
    };
    
    ConfigManager.prototype.reloadAllConfigs = function(callback) {
        var self = this;
        this.loaded = {};
        this.configs = {};
        
        this.loadAllConfigs();
        
        if (callback) {
            // Wait for all configs to load
            var checkLoaded = function() {
                var allLoaded = true;
                var configFiles = ['main.json', 'adminrights.json', 'bans.json', 'chatcommands.json', 'mapmarkers.json', 'nopkzones.json', 'clientconfig'];
                
                configFiles.forEach(function(configFile) {
                    if (!self.loaded[configFile]) {
                        allLoaded = false;
                    }
                });
                
                if (allLoaded) {
                    callback();
                } else {
                    setTimeout(checkLoaded, 100);
                }
            };
            
            checkLoaded();
        }
    };
    
    // iAppsBeats specific config helpers
    ConfigManager.prototype.getPlayerHP = function() {
        var config = this.getMainConfig();
        return config ? (config.playerHp || 100) : 100;
    };
    
    ConfigManager.prototype.getTileSize = function() {
        var config = this.getMainConfig();
        return config ? (config.tilesize || 32) : 32;
    };
    
    ConfigManager.prototype.getDefaultMapName = function() {
        var config = this.getMainConfig();
        return config ? (config.defaultmapname || 'world_client') : 'world_client';
    };
    
    ConfigManager.prototype.getStartCoins = function() {
        var config = this.getMainConfig();
        return config ? (config.startcoins || 1000) : 1000;
    };
    
    ConfigManager.prototype.getStartBombs = function() {
        var config = this.getMainConfig();
        return config ? (config.startbombs || 10) : 10;
    };
    
    ConfigManager.prototype.getStartArrows = function() {
        var config = this.getMainConfig();
        return config ? (config.startarrows || 100) : 100;
    };
    
    ConfigManager.prototype.getMaxArrows = function() {
        var config = this.getMainConfig();
        return config ? (config.maxarrows || 999) : 999;
    };
    
    ConfigManager.prototype.getMaxBombs = function() {
        var config = this.getMainConfig();
        return config ? (config.maxbombs || 999) : 999;
    };
    
    ConfigManager.prototype.getIdlePose = function() {
        var config = this.getMainConfig();
        return config ? (config.idlepose || 'player_idle') : 'player_idle';
    };
    
    ConfigManager.prototype.getIdlePoseTime = function() {
        var config = this.getMainConfig();
        return config ? (config.idleposetime || 60) : 60;
    };
    
    ConfigManager.prototype.getHotkeys = function() {
        var config = this.getMainConfig();
        return config ? (config.hotkeys || 5) : 5;
    };
    
    ConfigManager.prototype.isGunServer = function() {
        var config = this.getMainConfig();
        return config ? (config.isgunserver || false) : false;
    };
    
    ConfigManager.prototype.getDefaultWeapon = function() {
        var config = this.getMainConfig();
        return config ? (config.defaultweapon || 'sword1') : 'sword1';
    };
    
    ConfigManager.prototype.getDefaultArmor = function() {
        var config = this.getMainConfig();
        return config ? (config.defaultarmor || 'clotharmor') : 'clotharmor';
    };
    
    ConfigManager.prototype.getDefaultHead = function() {
        var config = this.getMainConfig();
        return config ? (config.defaulthead || 'bbuilder_head1.png') : 'bbuilder_head1.png';
    };
    
    ConfigManager.prototype.getStartItems = function() {
        var config = this.getMainConfig();
        return config ? (config.startitems || []) : [];
    };
    
    ConfigManager.prototype.getStaffTags = function() {
        var config = this.getMainConfig();
        return config ? (config.staffTags || []) : [];
    };
    
    ConfigManager.prototype.getShoutLevel = function() {
        var config = this.getMainConfig();
        return config ? (config.shoutLevel || 0) : 0;
    };
    
    ConfigManager.prototype.getShoutKeywords = function() {
        var config = this.getMainConfig();
        return config ? (config.shoutKeyword || []) : [];
    };
    
    ConfigManager.prototype.getClanCreatePrice = function() {
        var config = this.getMainConfig();
        return config ? (config.clancreateprice || 5000) : 5000;
    };
    
    ConfigManager.prototype.getClanRenamePrice = function() {
        var config = this.getMainConfig();
        return config ? (config.clanrenameprice || 1000) : 1000;
    };
    
    ConfigManager.prototype.getClanMemberLimit = function() {
        var config = this.getMainConfig();
        return config ? (config.clanmemberlimit || 20) : 20;
    };
    
    return ConfigManager;
});