define(['game', 'gameclient'], function(Game, GameClient) {
    'use strict';
    
    var App = function() {
        this.currentPage = 1;
        this.blurred = false;
        this.hidden = false;
        this.updateTime = new Date();
        this.started = false;
        
        // Initialize audio context
        this.initializeAudio();
        
        // Bind events
        this.bindEvents();
    };
    
    App.prototype.run = function() {
        var self = this;
        
        this.game = new Game(this);
        this.game.setup($('#gamecontainer'), $('#canvas'));
        
        if (this.game.renderer && this.game.renderer.isWebGLSupported()) {
            this.game.renderer.initWebGL();
        }
        
        this.game.onGameStart = function() {
            self.started = true;
            $('#gamecontainer').css('visibility', 'visible');
            $('#startscreen').hide();
        };
        
        this.bindWestLawEvents();
        this.loadAudio();
        
        // Show start screen initially
        this.showStartScreen();
        
        // Start the game loop
        this.gameLoop();
    };
    
    App.prototype.gameLoop = function() {
        var self = this;
        
        if (this.started && !this.blurred && !this.hidden) {
            this.game.run();
        }
        
        requestAnimationFrame(function() {
            self.gameLoop();
        });
    };
    
    App.prototype.bindEvents = function() {
        var self = this;
        
        $(window).on('blur', function() {
            self.blurred = true;
        });
        
        $(window).on('focus', function() {
            self.blurred = false;
        });
        
        // Handle page visibility API
        document.addEventListener('visibilitychange', function() {
            self.hidden = document.hidden;
        });
        
        // Handle resize
        $(window).on('resize', function() {
            if (self.game && self.game.renderer) {
                self.game.renderer.handleResize();
            }
        });
    };
    
    App.prototype.bindWestLawEvents = function() {
        var self = this;
        
        // Play button click
        $('#playbutton').click(function() {
            self.startGame('Player_' + Math.floor(Math.random() * 1000));
        });
        
        // Identity/login screen
        $('#identifycognitobutton').click(function() {
            // For now, auto-start with a random name
            self.startGame('Player_' + Math.floor(Math.random() * 1000));
        });
        
        // Chat functionality
        $('#chatinput').keypress(function(e) {
            if (e.which === 13) { // Enter key
                var message = $(this).val().trim();
                if (message && self.game && self.game.client && self.game.client.connected) {
                    self.game.client.sendChat(message);
                    $(this).val('');
                    $('#chatbox').hide();
                }
            }
        });
        
        // Chat button
        $('#chatbutton').click(function() {
            $('#chatbox').toggle();
            $('#chatinput').focus();
        });
        
        // Menu and navigation buttons
        $('#menubutton').click(function() {
            // Toggle menu functionality
            console.log('Menu clicked');
        });
        
        $('#homebutton').click(function() {
            // Home/respawn functionality
            if (self.game && self.game.player) {
                self.game.player.respawn();
            }
        });
        
        // Hotkey functionality
        $(document).keydown(function(e) {
            if (self.game && self.game.started) {
                // Handle hotkeys 1, 2, etc.
                if (e.which >= 49 && e.which <= 57) {
                    var hotkeyNum = e.which - 48;
                    self.game.useHotkey(hotkeyNum);
                }
            }
        });
    };
    
    App.prototype.startGame = function(name) {
        $('#startscreen').fadeOut('slow');
        $('#identifyscreen').hide();
        $('#gamecontainer').css('visibility', 'visible');
        
        // Connect to game server
        this.game.connect(name);
    };
    
    App.prototype.showStartScreen = function() {
        $('#gamecontainer').css('visibility', 'hidden');
        $('#startscreen').show();
        
        // Auto-start if configured
        if (window.autoStartGame) {
            var self = this;
            setTimeout(function() {
                $('#playbutton .spinner').hide();
                $('#playbutton').text('Click to Play').removeClass('loading');
            }, 2000);
        }
    };
    
    App.prototype.initializeAudio = function() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    };
    
    App.prototype.loadAudio = function() {
        // Audio loading would be implemented here
        // Using HTML5 audio elements or Web Audio API
    };
    
    return App;
});
