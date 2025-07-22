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
        this.game.setup($('#gamecontainer'), $('#canvases'));
        
        if (this.game.renderer.isWebGLSupported()) {
            this.game.renderer.initWebGL();
        }
        
        this.game.onGameStart(function() {
            self.started = true;
        });
        
        this.bindLoginEvents();
        this.loadAudio();
        
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
    
    App.prototype.bindLoginEvents = function() {
        var self = this;
        var $loginButton = $('#loginbutton');
        var $nameInput = $('#nameinput');
        
        $loginButton.click(function() {
            var name = $nameInput.val().trim();
            if (name && name.length > 0) {
                self.startGame(name);
            }
        });
        
        $nameInput.keypress(function(e) {
            if (e.which === 13) { // Enter key
                $loginButton.click();
            }
        });
        
        $nameInput.focus();
    };
    
    App.prototype.startGame = function(name) {
        $('#intro').fadeOut('slow');
        $('#game').show();
        
        // Connect to game server
        this.game.connect(name);
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
