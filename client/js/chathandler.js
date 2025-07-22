define([], function() {
    'use strict';
    
    var ChatHandler = function(game) {
        this.game = game;
        this.isOpen = false;
        this.messageHistory = [];
        this.historyIndex = -1;
        this.maxMessages = 100;
        
        // Chat elements
        this.$chatbox = $('#chatbox');
        this.$chatlog = $('#chatlog');
        this.$chatinput = $('#chatinput');
        
        // Chat state
        this.isVisible = true;
        
        this.initializeChat();
        this.bindEvents();
    };
    
    ChatHandler.prototype.initializeChat = function() {
        // Hide chat input initially
        this.$chatinput.hide();
        
        // Add welcome message
        this.addSystemMessage('Welcome to BrowserQuest!');
        this.addSystemMessage('Press Enter to chat');
    };
    
    ChatHandler.prototype.bindEvents = function() {
        var self = this;
        
        // Chat input events
        this.$chatinput.keydown(function(e) {
            switch (e.keyCode) {
                case 13: // Enter
                    e.preventDefault();
                    self.sendMessage();
                    break;
                case 27: // Escape
                    e.preventDefault();
                    self.close();
                    break;
                case 38: // Up arrow
                    e.preventDefault();
                    self.showPreviousMessage();
                    break;
                case 40: // Down arrow
                    e.preventDefault();
                    self.showNextMessage();
                    break;
            }
        });
        
        // Focus events
        this.$chatinput.on('blur', function() {
            // Don't close chat immediately to allow for clicking
            setTimeout(function() {
                if (!self.$chatinput.is(':focus')) {
                    self.close();
                }
            }, 100);
        });
    };
    
    ChatHandler.prototype.toggle = function() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    };
    
    ChatHandler.prototype.open = function() {
        if (!this.isOpen) {
            this.isOpen = true;
            this.$chatinput.show();
            this.$chatinput.focus();
            this.historyIndex = -1;
        }
    };
    
    ChatHandler.prototype.close = function() {
        if (this.isOpen) {
            this.isOpen = false;
            this.$chatinput.hide();
            this.$chatinput.val('');
            this.$chatinput.blur();
        }
    };
    
    ChatHandler.prototype.sendMessage = function() {
        var message = this.$chatinput.val().trim();
        
        if (message.length > 0) {
            // Add to history
            this.addToHistory(message);
            
            // Process the message
            if (message.charAt(0) === '/') {
                this.processCommand(message);
            } else {
                this.sendChatMessage(message);
            }
            
            // Clear input and close
            this.$chatinput.val('');
            this.close();
        }
    };
    
    ChatHandler.prototype.sendChatMessage = function(message) {
        if (this.game.client && this.game.player) {
            this.game.client.sendChat(message);
            
            // Add own message to chat log immediately
            this.addPlayerMessage(this.game.player.name, message);
        }
    };
    
    ChatHandler.prototype.processCommand = function(command) {
        var parts = command.split(' ');
        var cmd = parts[0].toLowerCase();
        var args = parts.slice(1);
        
        switch (cmd) {
            case '/help':
                this.showHelp();
                break;
            case '/who':
            case '/online':
                this.showOnlinePlayers();
                break;
            case '/clear':
                this.clearChat();
                break;
            case '/mute':
                this.toggleMute();
                break;
            case '/time':
                this.showTime();
                break;
            case '/ping':
                this.checkPing();
                break;
            case '/suicide':
                this.suicide();
                break;
            default:
                this.addSystemMessage('Unknown command: ' + cmd);
                this.addSystemMessage('Type /help for available commands');
                break;
        }
    };
    
    ChatHandler.prototype.showHelp = function() {
        this.addSystemMessage('Available commands:');
        this.addSystemMessage('/help - Show this help');
        this.addSystemMessage('/who - Show online players');
        this.addSystemMessage('/clear - Clear chat log');
        this.addSystemMessage('/mute - Toggle game sounds');
        this.addSystemMessage('/time - Show current time');
        this.addSystemMessage('/ping - Check connection');
        this.addSystemMessage('/suicide - Kill your character');
    };
    
    ChatHandler.prototype.showOnlinePlayers = function() {
        if (this.game.client) {
            this.game.client.sendWho();
        }
    };
    
    ChatHandler.prototype.clearChat = function() {
        this.$chatlog.empty();
        this.addSystemMessage('Chat cleared');
    };
    
    ChatHandler.prototype.toggleMute = function() {
        if (this.game.audio) {
            var muted = this.game.audio.toggleMute();
            this.addSystemMessage(muted ? 'Audio muted' : 'Audio unmuted');
        }
    };
    
    ChatHandler.prototype.showTime = function() {
        var now = new Date();
        var timeString = now.toLocaleTimeString();
        this.addSystemMessage('Current time: ' + timeString);
    };
    
    ChatHandler.prototype.checkPing = function() {
        if (this.game.client) {
            var startTime = Date.now();
            this.game.client.sendPing(startTime);
        }
    };
    
    ChatHandler.prototype.suicide = function() {
        if (this.game.client && this.game.player && !this.game.player.isDead) {
            this.addSystemMessage('Goodbye, cruel world...');
            this.game.client.sendSuicide();
        }
    };
    
    ChatHandler.prototype.addMessage = function(message, className) {
        var $message = $('<div class="chat-message">').addClass(className).text(message);
        this.$chatlog.append($message);
        
        // Remove old messages if we have too many
        var $messages = this.$chatlog.find('.chat-message');
        if ($messages.length > this.maxMessages) {
            $messages.first().remove();
        }
        
        // Scroll to bottom
        this.$chatlog.scrollTop(this.$chatlog[0].scrollHeight);
    };
    
    ChatHandler.prototype.addSystemMessage = function(message) {
        this.addMessage(message, 'system');
    };
    
    ChatHandler.prototype.addPlayerMessage = function(playerName, message) {
        var formattedMessage = playerName + ': ' + message;
        this.addMessage(formattedMessage, 'player');
    };
    
    ChatHandler.prototype.addPrivateMessage = function(fromPlayer, toPlayer, message) {
        var formattedMessage = '[' + fromPlayer + ' -> ' + toPlayer + ']: ' + message;
        this.addMessage(formattedMessage, 'private');
    };
    
    ChatHandler.prototype.addToHistory = function(message) {
        // Don't add duplicate messages
        if (this.messageHistory.length === 0 || 
            this.messageHistory[this.messageHistory.length - 1] !== message) {
            this.messageHistory.push(message);
            
            // Limit history size
            if (this.messageHistory.length > 20) {
                this.messageHistory.shift();
            }
        }
    };
    
    ChatHandler.prototype.showPreviousMessage = function() {
        if (this.messageHistory.length > 0) {
            if (this.historyIndex === -1) {
                this.historyIndex = this.messageHistory.length - 1;
            } else if (this.historyIndex > 0) {
                this.historyIndex--;
            }
            
            this.$chatinput.val(this.messageHistory[this.historyIndex]);
        }
    };
    
    ChatHandler.prototype.showNextMessage = function() {
        if (this.historyIndex !== -1) {
            if (this.historyIndex < this.messageHistory.length - 1) {
                this.historyIndex++;
                this.$chatinput.val(this.messageHistory[this.historyIndex]);
            } else {
                this.historyIndex = -1;
                this.$chatinput.val('');
            }
        }
    };
    
    ChatHandler.prototype.handleIncomingMessage = function(data) {
        switch (data.type) {
            case 'chat':
                this.addPlayerMessage(data.name, data.message);
                break;
            case 'system':
                this.addSystemMessage(data.message);
                break;
            case 'private':
                this.addPrivateMessage(data.from, data.to, data.message);
                break;
            case 'who':
                this.handleWhoResponse(data.players);
                break;
            case 'pong':
                this.handlePongResponse(data.startTime);
                break;
        }
    };
    
    ChatHandler.prototype.handleWhoResponse = function(players) {
        this.addSystemMessage('Online players (' + players.length + '):');
        for (var i = 0; i < players.length; i++) {
            this.addSystemMessage('- ' + players[i]);
        }
    };
    
    ChatHandler.prototype.handlePongResponse = function(startTime) {
        var ping = Date.now() - startTime;
        this.addSystemMessage('Ping: ' + ping + 'ms');
    };
    
    ChatHandler.prototype.show = function() {
        this.isVisible = true;
        this.$chatbox.show();
    };
    
    ChatHandler.prototype.hide = function() {
        this.isVisible = false;
        this.$chatbox.hide();
        this.close();
    };
    
    ChatHandler.prototype.setVisible = function(visible) {
        if (visible) {
            this.show();
        } else {
            this.hide();
        }
    };
    
    ChatHandler.prototype.isInputFocused = function() {
        return this.$chatinput.is(':focus');
    };
    
    return ChatHandler;
});

