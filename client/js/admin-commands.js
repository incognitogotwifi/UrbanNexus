define(['config'], function(Config) {
    'use strict';
    
    var AdminCommands = function(game) {
        this.game = game;
        this.adminRights = {};
        this.playerAdminLevel = 0;
        
        this.loadAdminRights();
        this.initializeCommands();
    };
    
    AdminCommands.prototype.loadAdminRights = function() {
        var self = this;
        $.getJSON('config/adminrights.json', function(data) {
            self.adminRights = data.adminrights;
        }).fail(function() {
            console.warn('Could not load admin rights configuration');
        });
    };
    
    AdminCommands.prototype.initializeCommands = function() {
        this.commands = {
            // Level 1 Commands
            'stealth': this.commandStealth.bind(this),
            
            // Level 2 Commands  
            'warpto': this.commandWarpTo.bind(this),
            
            // Level 3 Commands
            'profile': this.commandProfile.bind(this),
            'summon': this.commandSummon.bind(this),
            'zoom': this.commandZoom.bind(this),
            'gag': this.commandGag.bind(this),
            'resetname': this.commandResetName.bind(this),
            'resetstatus': this.commandResetStatus.bind(this),
            'resetstory': this.commandResetStory.bind(this),
            'disconnect': this.commandDisconnect.bind(this),
            'mute': this.commandMute.bind(this),
            'lockitems': this.commandLockItems.bind(this),
            'blockuploads': this.commandBlockUploads.bind(this),
            'jail': this.commandJail.bind(this),
            'tojail': this.commandToJail.bind(this),
            
            // Level 4 Commands
            'addeventcoin': this.commandAddEventCoin.bind(this),
            'editevent': this.commandEditEvent.bind(this),
            
            // Level 5 Commands
            'setposition': this.commandSetPosition.bind(this),
            'unstickplayer': this.commandUnstickPlayer.bind(this),
            'sethp': this.commandSetHP.bind(this),
            
            // Level 6 Commands
            'setadminlevel': this.commandSetAdminLevel.bind(this),
            'setclanname': this.commandSetClanName.bind(this),
            'addscriptnpc': this.commandAddScriptNPC.bind(this),
            'addshopnpc': this.commandAddShopNPC.bind(this),
            
            // Level 7 Commands
            'addclanstats': this.commandAddClanStats.bind(this),
            'addtree': this.commandAddTree.bind(this),
            'additem': this.commandAddItem.bind(this),
            'addfireworks': this.commandAddFireworks.bind(this),
            'addmonsters': this.commandAddMonsters.bind(this),
            'addplayeritem': this.commandAddPlayerItem.bind(this),
            'addtalknpc': this.commandAddTalkNPC.bind(this),
            'addstats': this.commandAddStats.bind(this),
            'ani': this.commandAnimation.bind(this),
            'clanadmin': this.commandClanAdmin.bind(this),
            'countplayers': this.commandCountPlayers.bind(this),
            'debugevents': this.commandDebugEvents.bind(this),
            'pushannouncements': this.commandPushAnnouncements.bind(this),
            'setnpcname': this.commandSetNPCName.bind(this),
            'movenpc': this.commandMoveNPC.bind(this),
            'removenpc': this.commandRemoveNPC.bind(this),
            'itemdisplay': this.commandItemDisplay.bind(this),
            'refillarrows': this.commandRefillArrows.bind(this),
            'refillbombs': this.commandRefillBombs.bind(this),
            'refundupload': this.commandRefundUpload.bind(this),
            'removeitem': this.commandRemoveItem.bind(this),
            'setclanleader': this.commandSetClanLeader.bind(this),
            'serverstory': this.commandServerStory.bind(this),
            'serverpings': this.commandServerPings.bind(this),
            'reloadconfig': this.commandReloadConfig.bind(this),
            'settag': this.commandSetTag.bind(this),
            'stories': this.commandStories.bind(this),
            'story': this.commandStory.bind(this),
            'summonclan': this.commandSummonClan.bind(this),
            'uploadadmin': this.commandUploadAdmin.bind(this),
            'uploaditems': this.commandUploadItems.bind(this),
            'setmap': this.commandSetMap.bind(this),
            'tradeadmin': this.commandTradeAdmin.bind(this),
            'spar': this.commandSpar.bind(this),
            'reloadmap': this.commandReloadMap.bind(this),
            'auction': this.commandAuction.bind(this),
            
            // Level 8 Commands
            'addcoins': this.commandAddCoins.bind(this),
            'addball': this.commandAddBall.bind(this),
            'addbomb': this.commandAddBomb.bind(this),
            'addsnowhill': this.commandAddSnowHill.bind(this),
            'addballoon': this.commandAddBalloon.bind(this),
            'addsnowman': this.commandAddSnowman.bind(this),
            'editnpc': this.commandEditNPC.bind(this),
            'profilerlog': this.commandProfilerLog.bind(this),
            'reloadtranslations': this.commandReloadTranslations.bind(this),
            'testcoins': this.commandTestCoins.bind(this),
            'shutdown': this.commandShutdown.bind(this),
            'transferaccount': this.commandTransferAccount.bind(this),
            'transferlogin': this.commandTransferLogin.bind(this),
            
            // Level 9 Commands
            'activeobjects': this.commandActiveObjects.bind(this),
            'addbunny': this.commandAddBunny.bind(this),
            'addship': this.commandAddShip.bind(this),
            'mapmemorylog': this.commandMapMemoryLog.bind(this),
            'memorylog': this.commandMemoryLog.bind(this),
            'preloadmap': this.commandPreloadMap.bind(this),
            'shutdownfull': this.commandShutdownFull.bind(this),
            'rungc': this.commandRunGC.bind(this)
        };
    };
    
    AdminCommands.prototype.hasPermission = function(command) {
        if (this.playerAdminLevel === 0) return false;
        
        for (var i = 0; i < this.adminRights.length; i++) {
            var level = this.adminRights[i];
            if (level.type <= this.playerAdminLevel) {
                if (level.commands && level.commands.includes(command)) {
                    return true;
                }
            }
        }
        return false;
    };
    
    AdminCommands.prototype.executeCommand = function(commandLine) {
        var parts = commandLine.split(' ');
        var command = parts[0].toLowerCase();
        var args = parts.slice(1);
        
        if (!this.hasPermission(command)) {
            return "You don't have permission to use this command.";
        }
        
        if (this.commands[command]) {
            return this.commands[command](args);
        } else {
            return "Unknown command: " + command;
        }
    };
    
    // Command implementations
    AdminCommands.prototype.commandStealth = function(args) {
        // Toggle stealth mode
        this.game.player.stealth = !this.game.player.stealth;
        return "Stealth mode " + (this.game.player.stealth ? "enabled" : "disabled");
    };
    
    AdminCommands.prototype.commandWarpTo = function(args) {
        if (args.length < 2) return "Usage: warpto <x> <y> [map]";
        var x = parseInt(args[0]);
        var y = parseInt(args[1]);
        var map = args[2] || this.game.map.name;
        
        this.game.player.setPosition(x, y);
        if (map !== this.game.map.name) {
            this.game.changeMap(map);
        }
        return "Warped to " + x + ", " + y + (map ? " on " + map : "");
    };
    
    AdminCommands.prototype.commandProfile = function(args) {
        if (args.length < 1) return "Usage: profile <playername>";
        var playerName = args[0];
        // Show player profile
        return "Showing profile for " + playerName;
    };
    
    AdminCommands.prototype.commandSummon = function(args) {
        if (args.length < 1) return "Usage: summon <playername>";
        var playerName = args[0];
        // Summon player to current location
        return "Summoning " + playerName;
    };
    
    AdminCommands.prototype.commandZoom = function(args) {
        if (args.length < 1) return "Usage: zoom <level>";
        var zoomLevel = parseFloat(args[0]);
        this.game.camera.setZoom(zoomLevel);
        return "Zoom set to " + zoomLevel;
    };
    
    AdminCommands.prototype.commandGag = function(args) {
        if (args.length < 1) return "Usage: gag <playername> [duration]";
        var playerName = args[0];
        var duration = args[1] || "permanent";
        return "Gagged " + playerName + " for " + duration;
    };
    
    AdminCommands.prototype.commandResetName = function(args) {
        if (args.length < 1) return "Usage: resetname <playername>";
        var playerName = args[0];
        return "Reset name for " + playerName;
    };
    
    AdminCommands.prototype.commandResetStatus = function(args) {
        if (args.length < 1) return "Usage: resetstatus <playername>";
        var playerName = args[0];
        return "Reset status for " + playerName;
    };
    
    AdminCommands.prototype.commandResetStory = function(args) {
        if (args.length < 1) return "Usage: resetstory <playername>";
        var playerName = args[0];
        return "Reset story for " + playerName;
    };
    
    AdminCommands.prototype.commandDisconnect = function(args) {
        if (args.length < 1) return "Usage: disconnect <playername>";
        var playerName = args[0];
        return "Disconnected " + playerName;
    };
    
    AdminCommands.prototype.commandMute = function(args) {
        if (args.length < 1) return "Usage: mute <playername> [duration]";
        var playerName = args[0];
        var duration = args[1] || "permanent";
        return "Muted " + playerName + " for " + duration;
    };
    
    AdminCommands.prototype.commandLockItems = function(args) {
        if (args.length < 1) return "Usage: lockitems <playername>";
        var playerName = args[0];
        return "Locked items for " + playerName;
    };
    
    AdminCommands.prototype.commandBlockUploads = function(args) {
        if (args.length < 1) return "Usage: blockuploads <playername>";
        var playerName = args[0];
        return "Blocked uploads for " + playerName;
    };
    
    AdminCommands.prototype.commandJail = function(args) {
        if (args.length < 1) return "Usage: jail <playername> [duration]";
        var playerName = args[0];
        var duration = args[1] || "permanent";
        return "Jailed " + playerName + " for " + duration;
    };
    
    AdminCommands.prototype.commandToJail = function(args) {
        if (args.length < 1) return "Usage: tojail <playername>";
        var playerName = args[0];
        return "Sent " + playerName + " to jail";
    };
    
    AdminCommands.prototype.commandAddEventCoin = function(args) {
        if (args.length < 2) return "Usage: addeventcoin <playername> <amount>";
        var playerName = args[0];
        var amount = parseInt(args[1]);
        return "Added " + amount + " event coins to " + playerName;
    };
    
    AdminCommands.prototype.commandEditEvent = function(args) {
        if (args.length < 1) return "Usage: editevent <eventname>";
        var eventName = args[0];
        return "Editing event: " + eventName;
    };
    
    AdminCommands.prototype.commandSetPosition = function(args) {
        if (args.length < 3) return "Usage: setposition <playername> <x> <y>";
        var playerName = args[0];
        var x = parseInt(args[1]);
        var y = parseInt(args[2]);
        return "Set position of " + playerName + " to " + x + ", " + y;
    };
    
    AdminCommands.prototype.commandUnstickPlayer = function(args) {
        if (args.length < 1) return "Usage: unstickplayer <playername>";
        var playerName = args[0];
        return "Unstuck player " + playerName;
    };
    
    AdminCommands.prototype.commandSetHP = function(args) {
        if (args.length < 2) return "Usage: sethp <playername> <hp>";
        var playerName = args[0];
        var hp = parseInt(args[1]);
        return "Set HP of " + playerName + " to " + hp;
    };
    
    AdminCommands.prototype.commandSetAdminLevel = function(args) {
        if (args.length < 2) return "Usage: setadminlevel <playername> <level>";
        var playerName = args[0];
        var level = parseInt(args[1]);
        return "Set admin level of " + playerName + " to " + level;
    };
    
    AdminCommands.prototype.commandAddCoins = function(args) {
        if (args.length < 2) return "Usage: addcoins <playername> <amount>";
        var playerName = args[0];
        var amount = parseInt(args[1]);
        return "Added " + amount + " coins to " + playerName;
    };
    
    AdminCommands.prototype.commandAnimation = function(args) {
        if (args.length < 2) return "Usage: ani <playername> <animation>";
        var playerName = args[0];
        var animation = args[1];
        return "Playing animation " + animation + " for " + playerName;
    };
    
    AdminCommands.prototype.commandCountPlayers = function(args) {
        var count = this.game.players.length;
        return "Current player count: " + count;
    };
    
    AdminCommands.prototype.commandAddItem = function(args) {
        if (args.length < 2) return "Usage: additem <playername> <itemname> [count]";
        var playerName = args[0];
        var itemName = args[1];
        var count = parseInt(args[2]) || 1;
        return "Added " + count + "x " + itemName + " to " + playerName;
    };
    
    AdminCommands.prototype.commandAddScriptNPC = function(args) {
        if (args.length < 3) return "Usage: addscriptnpc <x> <y> <scriptclass>";
        var x = parseInt(args[0]);
        var y = parseInt(args[1]);
        var scriptClass = args[2];
        return "Added script NPC at " + x + ", " + y + " with class " + scriptClass;
    };
    
    AdminCommands.prototype.commandAddShopNPC = function(args) {
        if (args.length < 2) return "Usage: addshopnpc <x> <y>";
        var x = parseInt(args[0]);
        var y = parseInt(args[1]);
        return "Added shop NPC at " + x + ", " + y;
    };
    
    AdminCommands.prototype.commandReloadConfig = function(args) {
        // Reload server configuration
        this.loadAdminRights();
        return "Configuration reloaded";
    };
    
    AdminCommands.prototype.commandShutdown = function(args) {
        return "Server shutdown initiated";
    };
    
    AdminCommands.prototype.commandRunGC = function(args) {
        if (window.gc) {
            window.gc();
            return "Garbage collection run";
        } else {
            return "Garbage collection not available";
        }
    };
    
    // Placeholder implementations for remaining commands
    AdminCommands.prototype.commandSetClanName = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandAddClanStats = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandAddTree = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandAddFireworks = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandAddMonsters = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandAddPlayerItem = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandAddTalkNPC = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandAddStats = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandClanAdmin = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandDebugEvents = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandPushAnnouncements = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandSetNPCName = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandMoveNPC = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandRemoveNPC = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandItemDisplay = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandRefillArrows = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandRefillBombs = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandRefundUpload = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandRemoveItem = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandSetClanLeader = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandServerStory = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandServerPings = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandSetTag = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandStories = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandStory = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandSummonClan = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandUploadAdmin = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandUploadItems = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandSetMap = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandTradeAdmin = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandSpar = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandReloadMap = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandAuction = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandAddBall = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandAddBomb = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandAddSnowHill = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandAddBalloon = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandAddSnowman = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandEditNPC = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandProfilerLog = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandReloadTranslations = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandTestCoins = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandTransferAccount = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandTransferLogin = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandActiveObjects = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandAddBunny = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandAddShip = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandMapMemoryLog = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandMemoryLog = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandPreloadMap = function(args) { return "Command not implemented yet"; };
    AdminCommands.prototype.commandShutdownFull = function(args) { return "Command not implemented yet"; };
    
    return AdminCommands;
});