define(['audio'], function(Audio) {
    'use strict';
    
    var AudioManager = function(game) {
        this.game = game;
        this.audio = new Audio(game);
        
        // Audio state
        this.enabled = true;
        this.muted = false;
        this.currentArea = null;
        
        // Volume controls
        this.masterVolume = 1.0;
        this.soundVolume = 0.8;
        this.musicVolume = 0.6;
        
        // Initialize
        this.initialize();
    };
    
    AudioManager.prototype.initialize = function() {
        // Load settings from storage
        if (this.game.storage) {
            this.muted = this.game.storage.isMuted();
            this.masterVolume = this.game.storage.getVolume('master', 1.0);
            this.soundVolume = this.game.storage.getVolume('sound', 0.8);
            this.musicVolume = this.game.storage.getVolume('music', 0.6);
        }
        
        // Apply settings
        this.audio.setMasterVolume(this.masterVolume);
        this.audio.setSoundVolume(this.soundVolume);
        this.audio.setMusicVolume(this.musicVolume);
        
        if (this.muted) {
            this.audio.toggleMute();
        }
        
        // Bind UI events
        this.bindEvents();
    };
    
    AudioManager.prototype.bindEvents = function() {
        var self = this;
        
        // Mute button
        $('#mutebutton').click(function() {
            self.toggleMute();
        });
        
        // Game events
        if (this.game) {
            this.game.onPlayerMove = function(player) {
                self.handlePlayerMove(player);
            };
            
            this.game.onPlayerAttack = function(player) {
                self.handlePlayerAttack(player);
            };
            
            this.game.onPlayerHurt = function(player) {
                self.handlePlayerHurt(player);
            };
            
            this.game.onPlayerDeath = function(player) {
                self.handlePlayerDeath(player);
            };
            
            this.game.onPlayerLoot = function(player, item) {
                self.handlePlayerLoot(player, item);
            };
            
            this.game.onPlayerChat = function(player, message) {
                self.handlePlayerChat(player, message);
            };
        }
    };
    
    AudioManager.prototype.handlePlayerMove = function(player) {
        // Check if player entered a new area
        var currentArea = this.getCurrentArea(player);
        
        if (currentArea !== this.currentArea) {
            this.currentArea = currentArea;
            this.updateMusicForArea(currentArea);
        }
    };
    
    AudioManager.prototype.handlePlayerAttack = function(player) {
        if (player.weapon) {
            if (player.weapon.type === 'sword') {
                this.audio.playSound('sword');
            } else {
                this.audio.playHitSound();
            }
        } else {
            this.audio.playHitSound();
        }
    };
    
    AudioManager.prototype.handlePlayerHurt = function(player) {
        this.audio.playHurtSound();
    };
    
    AudioManager.prototype.handlePlayerDeath = function(player) {
        this.audio.playDeathSound();
    };
    
    AudioManager.prototype.handlePlayerLoot = function(player, item) {
        if (item.isArmor()) {
            this.audio.playArmorSound();
        } else {
            this.audio.playLootSound();
        }
    };
    
    AudioManager.prototype.handlePlayerChat = function(player, message) {
        this.audio.playChatSound();
    };
    
    AudioManager.prototype.getCurrentArea = function(player) {
        if (!player || !this.game.map) {
            return 'village';
        }
        
        var area = this.game.map.getMusicAreaAt(player.gridX, player.gridY);
        return area ? area.track : 'village';
    };
    
    AudioManager.prototype.updateMusicForArea = function(areaName) {
        if (this.audio.getCurrentTrack() !== areaName) {
            this.audio.playMusic(areaName, true);
        }
    };
    
    AudioManager.prototype.toggleMute = function() {
        this.muted = this.audio.toggleMute();
        
        // Update UI
        var $muteButton = $('#mutebutton');
        if (this.muted) {
            $muteButton.addClass('muted');
        } else {
            $muteButton.removeClass('muted');
        }
        
        // Save setting
        if (this.game.storage) {
            this.game.storage.setMuted(this.muted);
        }
        
        return this.muted;
    };
    
    AudioManager.prototype.setMasterVolume = function(volume) {
        this.masterVolume = volume;
        this.audio.setMasterVolume(volume);
        
        if (this.game.storage) {
            this.game.storage.setVolume('master', volume);
        }
    };
    
    AudioManager.prototype.setSoundVolume = function(volume) {
        this.soundVolume = volume;
        this.audio.setSoundVolume(volume);
        
        if (this.game.storage) {
            this.game.storage.setVolume('sound', volume);
        }
    };
    
    AudioManager.prototype.setMusicVolume = function(volume) {
        this.musicVolume = volume;
        this.audio.setMusicVolume(volume);
        
        if (this.game.storage) {
            this.game.storage.setVolume('music', volume);
        }
    };
    
    AudioManager.prototype.getMasterVolume = function() {
        return this.masterVolume;
    };
    
    AudioManager.prototype.getSoundVolume = function() {
        return this.soundVolume;
    };
    
    AudioManager.prototype.getMusicVolume = function() {
        return this.musicVolume;
    };
    
    AudioManager.prototype.isMuted = function() {
        return this.muted;
    };
    
    AudioManager.prototype.isEnabled = function() {
        return this.enabled && this.audio.isEnabled();
    };
    
    return AudioManager;
});
