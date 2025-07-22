define([], function() {
    'use strict';
    
    var Storage = function() {
        this.isLocalStorageSupported = this.checkLocalStorageSupport();
        this.data = {};
        
        // Initialize with localStorage data if available
        if (this.isLocalStorageSupported) {
            this.loadFromLocalStorage();
        }
    };
    
    Storage.prototype.checkLocalStorageSupport = function() {
        try {
            var test = 'localStorageTest';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    };
    
    Storage.prototype.loadFromLocalStorage = function() {
        try {
            var keys = Object.keys(localStorage);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (key.startsWith('browserquest.')) {
                    var gameKey = key.substring('browserquest.'.length);
                    this.data[gameKey] = JSON.parse(localStorage.getItem(key));
                }
            }
        } catch (e) {
            console.warn('Error loading from localStorage:', e);
        }
    };
    
    Storage.prototype.set = function(key, value) {
        this.data[key] = value;
        
        if (this.isLocalStorageSupported) {
            try {
                localStorage.setItem('browserquest.' + key, JSON.stringify(value));
            } catch (e) {
                console.warn('Error saving to localStorage:', e);
            }
        }
    };
    
    Storage.prototype.get = function(key, defaultValue) {
        if (key in this.data) {
            return this.data[key];
        }
        return defaultValue;
    };
    
    Storage.prototype.remove = function(key) {
        delete this.data[key];
        
        if (this.isLocalStorageSupported) {
            try {
                localStorage.removeItem('browserquest.' + key);
            } catch (e) {
                console.warn('Error removing from localStorage:', e);
            }
        }
    };
    
    Storage.prototype.clear = function() {
        this.data = {};
        
        if (this.isLocalStorageSupported) {
            try {
                var keys = Object.keys(localStorage);
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    if (key.startsWith('browserquest.')) {
                        localStorage.removeItem(key);
                    }
                }
            } catch (e) {
                console.warn('Error clearing localStorage:', e);
            }
        }
    };
    
    Storage.prototype.has = function(key) {
        return key in this.data;
    };
    
    Storage.prototype.keys = function() {
        return Object.keys(this.data);
    };
    
    Storage.prototype.values = function() {
        return Object.values(this.data);
    };
    
    Storage.prototype.size = function() {
        return Object.keys(this.data).length;
    };
    
    // Game-specific storage methods
    Storage.prototype.setPlayerName = function(name) {
        this.set('playerName', name);
    };
    
    Storage.prototype.getPlayerName = function() {
        return this.get('playerName', '');
    };
    
    Storage.prototype.setVolume = function(type, volume) {
        var volumes = this.get('volumes', {});
        volumes[type] = volume;
        this.set('volumes', volumes);
    };
    
    Storage.prototype.getVolume = function(type, defaultValue) {
        var volumes = this.get('volumes', {});
        return volumes[type] !== undefined ? volumes[type] : defaultValue;
    };
    
    Storage.prototype.setMuted = function(muted) {
        this.set('muted', muted);
    };
    
    Storage.prototype.isMuted = function() {
        return this.get('muted', false);
    };
    
    Storage.prototype.setGraphicsSettings = function(settings) {
        this.set('graphics', settings);
    };
    
    Storage.prototype.getGraphicsSettings = function() {
        return this.get('graphics', {
            scale: 2,
            smoothing: false,
            particles: true,
            shadows: true
        });
    };
    
    Storage.prototype.setControlSettings = function(settings) {
        this.set('controls', settings);
    };
    
    Storage.prototype.getControlSettings = function() {
        return this.get('controls', {
            clickToMove: true,
            rightClickContext: true,
            keyboardShortcuts: true
        });
    };
    
    Storage.prototype.setLastServer = function(server) {
        this.set('lastServer', server);
    };
    
    Storage.prototype.getLastServer = function() {
        return this.get('lastServer', 'localhost');
    };
    
    Storage.prototype.addRecentPlayer = function(playerName) {
        var recent = this.get('recentPlayers', []);
        
        // Remove if already exists
        var index = recent.indexOf(playerName);
        if (index !== -1) {
            recent.splice(index, 1);
        }
        
        // Add to beginning
        recent.unshift(playerName);
        
        // Limit to 10 recent players
        if (recent.length > 10) {
            recent = recent.slice(0, 10);
        }
        
        this.set('recentPlayers', recent);
    };
    
    Storage.prototype.getRecentPlayers = function() {
        return this.get('recentPlayers', []);
    };
    
    Storage.prototype.setAchievements = function(achievements) {
        this.set('achievements', achievements);
    };
    
    Storage.prototype.getAchievements = function() {
        return this.get('achievements', []);
    };
    
    Storage.prototype.addAchievement = function(achievement) {
        var achievements = this.getAchievements();
        if (achievements.indexOf(achievement) === -1) {
            achievements.push(achievement);
            this.setAchievements(achievements);
            return true;
        }
        return false;
    };
    
    Storage.prototype.hasAchievement = function(achievement) {
        var achievements = this.getAchievements();
        return achievements.indexOf(achievement) !== -1;
    };
    
    Storage.prototype.setStatistics = function(stats) {
        this.set('statistics', stats);
    };
    
    Storage.prototype.getStatistics = function() {
        return this.get('statistics', {
            timePlayed: 0,
            mobsKilled: 0,
            deaths: 0,
            itemsLooted: 0,
            messagesSpent: 0,
            maxLevel: 1
        });
    };
    
    Storage.prototype.updateStatistic = function(key, value) {
        var stats = this.getStatistics();
        
        if (typeof value === 'number') {
            stats[key] = (stats[key] || 0) + value;
        } else {
            stats[key] = value;
        }
        
        this.setStatistics(stats);
    };
    
    Storage.prototype.incrementStatistic = function(key) {
        this.updateStatistic(key, 1);
    };
    
    Storage.prototype.setHotkeys = function(hotkeys) {
        this.set('hotkeys', hotkeys);
    };
    
    Storage.prototype.getHotkeys = function() {
        return this.get('hotkeys', {
            chat: 13,      // Enter
            help: 112,     // F1
            inventory: 73, // I
            map: 77,       // M
            logout: 27     // Escape
        });
    };
    
    Storage.prototype.export = function() {
        return JSON.stringify(this.data);
    };
    
    Storage.prototype.import = function(jsonData) {
        try {
            var importedData = JSON.parse(jsonData);
            
            for (var key in importedData) {
                this.set(key, importedData[key]);
            }
            
            return true;
        } catch (e) {
            console.warn('Error importing data:', e);
            return false;
        }
    };
    
    Storage.prototype.migrate = function(oldVersion, newVersion) {
        // Handle data migration between versions
        console.log('Migrating storage from version', oldVersion, 'to', newVersion);
        
        // Example migration logic
        if (oldVersion < 2) {
            // Convert old volume format
            var oldVolume = this.get('volume');
            if (oldVolume !== undefined) {
                this.setVolume('master', oldVolume);
                this.remove('volume');
            }
        }
        
        this.set('version', newVersion);
    };
    
    Storage.prototype.getVersion = function() {
        return this.get('version', 1);
    };
    
    return Storage;
});

