define(['game'], function(Game) {
    'use strict';
    
    var App = function() {
        this.currentPage = 1;
        this.blurred = false;
        this.hidden = false;
        this.updateTime = new Date();
        this.started = false;
        
        this.bindEvents();
    };
    
    App.prototype.run = function() {
        var self = this;
        
        this.game = new Game(this);
        this.game.setup($('#gamecontainer'), $('#canvas'));
        
        this.game.onGameStart = function() {
            self.started = true;
            $('#gamecontainer').css('visibility', 'visible');
            $('#startscreen').hide();
            console.log('Game started successfully');
        };
        
        // Show login interface
        this.showLogin();
        
        // Start the game loop
        this.gameLoop();
    };
    
    App.prototype.showLogin = function() {
        var self = this;
        
        // Create simple login interface
        var $loginContainer = $('<div id="login-container" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border: 2px solid #333;">');
        var $nameInput = $('<input type="text" id="player-name" placeholder="Enter your name" style="margin: 10px; padding: 10px; width: 200px;">');
        var $playButton = $('<button id="play-button" style="margin: 10px; padding: 10px 20px;">Play</button>');
        
        $loginContainer.append('<h2>BrowserQuest</h2>');
        $loginContainer.append($nameInput);
        $loginContainer.append('<br>');
        $loginContainer.append($playButton);
        
        $('body').append($loginContainer);
        
        $playButton.click(function() {
            var playerName = $nameInput.val().trim();
            if (playerName) {
                $loginContainer.remove();
                self.startGame(playerName);
            } else {
                alert('Please enter your name');
            }
        });
        
        $nameInput.keypress(function(e) {
            if (e.which === 13) { // Enter key
                $playButton.click();
            }
        });
        
        $nameInput.focus();
    };
    
    App.prototype.startGame = function(playerName) {
        console.log('Starting game for player:', playerName);
        this.game.start(playerName);
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
    
    return App;
});