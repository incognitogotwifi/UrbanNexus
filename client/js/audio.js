define([], function() {
    'use strict';
    
    var Audio = function(game) {
        this.game = game;
        this.enabled = true;
        this.muted = false;
        
        // Audio context
        this.context = null;
        this.masterGain = null;
        
        // Audio files
        this.sounds = {};
        this.music = {};
        this.currentMusic = null;
        
        // Volume settings
        this.masterVolume = 1.0;
        this.soundVolume = 0.8;
        this.musicVolume = 0.6;
        
        // Music state
        this.currentTrack = null;
        this.isPlayingMusic = false;
        this.fadeTimeout = null;
        
        this.initializeAudio();
    };
    
    Audio.prototype.initializeAudio = function() {
        try {
            // Initialize Web Audio API
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
            this.masterGain = this.context.createGain();
            this.masterGain.connect(this.context.destination);
            this.masterGain.gain.value = this.masterVolume;
            
            this.enabled = true;
        } catch (e) {
            console.warn('Web Audio API not supported, falling back to HTML5 audio');
            this.enabled = false;
        }
        
        // Load audio files
        this.loadAudioFiles();
    };
    
    Audio.prototype.loadAudioFiles = function() {
        // Sound effects (using WAV format for better browser compatibility)
        this.loadSound('hit', 'audio/hit.wav');
        this.loadSound('hurt', 'audio/hurt.wav');
        this.loadSound('heal', 'audio/heal.wav');
        this.loadSound('chat', 'audio/chat.wav');
        this.loadSound('revive', 'audio/revive.wav');
        this.loadSound('death', 'audio/death.wav');
        this.loadSound('sword', 'audio/sword.wav');
        this.loadSound('loot', 'audio/loot.wav');
        this.loadSound('armor', 'audio/armor.wav');
        this.loadSound('achievement', 'audio/achievement.wav');
        this.loadSound('firefox', 'audio/firefox.wav');
        this.loadSound('teleport', 'audio/teleport.wav');
        this.loadSound('npc', 'audio/npc.wav');
        this.loadSound('npc-end', 'audio/npc-end.wav');
        
        // Music tracks (using WAV format for better browser compatibility)
        this.loadMusic('village', 'audio/village.wav');
        this.loadMusic('beach', 'audio/beach.wav');
        this.loadMusic('forest', 'audio/forest.wav');
        this.loadMusic('cave', 'audio/cave.wav');
        this.loadMusic('desert', 'audio/desert.wav');
        this.loadMusic('lavaland', 'audio/lavaland.wav');
        this.loadMusic('boss', 'audio/boss.wav');
    };
    
    Audio.prototype.loadSound = function(name, url) {
        if (!this.enabled) {
            return;
        }
        
        var self = this;
        var request = new XMLHttpRequest();
        
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        
        request.onload = function() {
            self.context.decodeAudioData(request.response, function(buffer) {
                self.sounds[name] = buffer;
            }, function(e) {
                console.warn('Error decoding audio: ' + name, e);
            });
        };
        
        request.onerror = function() {
            console.warn('Error loading audio: ' + name);
        };
        
        request.send();
    };
    
    Audio.prototype.loadMusic = function(name, url) {
        var audio = new HTMLAudio();
        audio.preload = 'auto';
        audio.loop = true;
        audio.volume = this.musicVolume;
        
        var self = this;
        audio.addEventListener('canplaythrough', function() {
            self.music[name] = audio;
        });
        
        audio.addEventListener('error', function() {
            console.warn('Error loading music: ' + name);
        });
        
        audio.src = url;
    };
    
    Audio.prototype.playSound = function(name, volume) {
        if (!this.enabled || this.muted || !this.sounds[name]) {
            return;
        }
        
        try {
            var source = this.context.createBufferSource();
            var gainNode = this.context.createGain();
            
            source.buffer = this.sounds[name];
            source.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            var soundVolume = (volume !== undefined ? volume : this.soundVolume);
            gainNode.gain.value = soundVolume;
            
            source.start(0);
        } catch (e) {
            console.warn('Error playing sound: ' + name, e);
        }
    };
    
    Audio.prototype.playMusic = function(name, fadeIn) {
        if (this.muted || !this.music[name]) {
            return;
        }
        
        // Stop current music
        this.stopMusic(fadeIn);
        
        var track = this.music[name];
        this.currentTrack = name;
        this.currentMusic = track;
        this.isPlayingMusic = true;
        
        if (fadeIn) {
            track.volume = 0;
            track.play();
            this.fadeInMusic(track, this.musicVolume, 2000);
        } else {
            track.volume = this.musicVolume;
            track.play();
        }
    };
    
    Audio.prototype.stopMusic = function(fadeOut) {
        if (!this.currentMusic) {
            return;
        }
        
        if (this.fadeTimeout) {
            clearTimeout(this.fadeTimeout);
            this.fadeTimeout = null;
        }
        
        if (fadeOut) {
            this.fadeOutMusic(this.currentMusic, 1000);
        } else {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
            this.currentMusic = null;
            this.currentTrack = null;
            this.isPlayingMusic = false;
        }
    };
    
    Audio.prototype.fadeInMusic = function(track, targetVolume, duration) {
        var startTime = Date.now();
        var startVolume = track.volume;
        
        var self = this;
        var fade = function() {
            var elapsed = Date.now() - startTime;
            var progress = Math.min(elapsed / duration, 1);
            
            track.volume = startVolume + (targetVolume - startVolume) * progress;
            
            if (progress < 1) {
                self.fadeTimeout = setTimeout(fade, 50);
            }
        };
        
        fade();
    };
    
    Audio.prototype.fadeOutMusic = function(track, duration) {
        var startTime = Date.now();
        var startVolume = track.volume;
        
        var self = this;
        var fade = function() {
            var elapsed = Date.now() - startTime;
            var progress = Math.min(elapsed / duration, 1);
            
            track.volume = startVolume * (1 - progress);
            
            if (progress < 1) {
                self.fadeTimeout = setTimeout(fade, 50);
            } else {
                track.pause();
                track.currentTime = 0;
                track.volume = self.musicVolume;
                
                if (self.currentMusic === track) {
                    self.currentMusic = null;
                    self.currentTrack = null;
                    self.isPlayingMusic = false;
                }
            }
        };
        
        fade();
    };
    
    Audio.prototype.updateMusicArea = function(area) {
        if (!area || !area.musicTrack) {
            return;
        }
        
        var newTrack = area.musicTrack;
        
        if (newTrack !== this.currentTrack) {
            this.playMusic(newTrack, true);
        }
    };
    
    Audio.prototype.setMasterVolume = function(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
    };
    
    Audio.prototype.setSoundVolume = function(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
    };
    
    Audio.prototype.setMusicVolume = function(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        if (this.currentMusic) {
            this.currentMusic.volume = this.musicVolume;
        }
        
        // Update all loaded music tracks
        for (var trackName in this.music) {
            if (this.music[trackName] !== this.currentMusic) {
                this.music[trackName].volume = this.musicVolume;
            }
        }
    };
    
    Audio.prototype.toggleMute = function() {
        this.muted = !this.muted;
        
        if (this.muted) {
            this.setMasterVolume(0);
            this.stopMusic();
        } else {
            this.setMasterVolume(this.masterVolume);
        }
        
        return this.muted;
    };
    
    Audio.prototype.isMuted = function() {
        return this.muted;
    };
    
    Audio.prototype.isEnabled = function() {
        return this.enabled;
    };
    
    Audio.prototype.getCurrentTrack = function() {
        return this.currentTrack;
    };
    
    Audio.prototype.isPlayingMusic = function() {
        return this.isPlayingMusic;
    };
    
    // Game event handlers
    Audio.prototype.playHitSound = function() {
        this.playSound('hit');
    };
    
    Audio.prototype.playHurtSound = function() {
        this.playSound('hurt');
    };
    
    Audio.prototype.playHealSound = function() {
        this.playSound('heal');
    };
    
    Audio.prototype.playChatSound = function() {
        this.playSound('chat', 0.3);
    };
    
    Audio.prototype.playReviveSound = function() {
        this.playSound('revive');
    };
    
    Audio.prototype.playDeathSound = function() {
        this.playSound('death');
    };
    
    Audio.prototype.playLootSound = function() {
        this.playSound('loot');
    };
    
    Audio.prototype.playArmorSound = function() {
        this.playSound('armor');
    };
    
    Audio.prototype.playAchievementSound = function() {
        this.playSound('achievement');
    };
    
    Audio.prototype.playTeleportSound = function() {
        this.playSound('teleport');
    };
    
    Audio.prototype.playNpcSound = function() {
        this.playSound('npc');
    };
    
    Audio.prototype.playNpcEndSound = function() {
        this.playSound('npc-end');
    };
    
    // HTMLAudio constructor fallback
    function HTMLAudio() {
        return new window.Audio();
    }
    
    return Audio;
});

