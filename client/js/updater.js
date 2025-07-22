define(['timer'], function(Timer) {
    'use strict';
    
    var Updater = function(game) {
        this.game = game;
        this.timer = new Timer();
        
        this.isRunning = false;
        this.lastUpdate = 0;
        this.updateInterval = 1000 / 50; // 50 FPS target
        
        // Performance tracking
        this.frameTime = 0;
        this.averageFrameTime = 0;
        this.frameTimeHistory = [];
        this.maxFrameTimeHistory = 60;
        
        // Update callbacks
        this.updateCallbacks = [];
        
        // Animation frame ID
        this.animationFrameId = null;
    };
    
    Updater.prototype.start = function() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.timer.start();
            this.lastUpdate = Date.now();
            this.scheduleNextUpdate();
        }
    };
    
    Updater.prototype.stop = function() {
        this.isRunning = false;
        this.timer.stop();
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    };
    
    Updater.prototype.pause = function() {
        this.isRunning = false;
        this.timer.pause();
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    };
    
    Updater.prototype.resume = function() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.timer.resume();
            this.lastUpdate = Date.now();
            this.scheduleNextUpdate();
        }
    };
    
    Updater.prototype.scheduleNextUpdate = function() {
        if (!this.isRunning) {
            return;
        }
        
        var self = this;
        this.animationFrameId = requestAnimationFrame(function(timestamp) {
            self.update(timestamp);
        });
    };
    
    Updater.prototype.update = function(timestamp) {
        if (!this.isRunning) {
            return;
        }
        
        var startTime = performance.now();
        var currentTime = Date.now();
        var deltaTime = currentTime - this.lastUpdate;
        
        // Update timer
        this.timer.update();
        
        // Update game components
        this.updateGame(deltaTime);
        
        // Update entities
        this.updateEntities(deltaTime);
        
        // Update animations
        this.updateAnimations(deltaTime);
        
        // Update transitions
        this.updateTransitions();
        
        // Call custom update callbacks
        this.callUpdateCallbacks(deltaTime);
        
        // Update performance metrics
        this.updatePerformanceMetrics(startTime);
        
        this.lastUpdate = currentTime;
        
        // Schedule next update
        this.scheduleNextUpdate();
    };
    
    Updater.prototype.updateGame = function(deltaTime) {
        if (this.game && this.game.update) {
            this.game.update(deltaTime);
        }
    };
    
    Updater.prototype.updateEntities = function(deltaTime) {
        if (!this.game || !this.game.entities) {
            return;
        }
        
        for (var i = 0; i < this.game.entities.length; i++) {
            var entity = this.game.entities[i];
            if (entity && entity.update) {
                entity.update(deltaTime);
            }
        }
    };
    
    Updater.prototype.updateAnimations = function(deltaTime) {
        if (!this.game || !this.game.entities) {
            return;
        }
        
        for (var i = 0; i < this.game.entities.length; i++) {
            var entity = this.game.entities[i];
            if (entity && entity.currentAnimation) {
                entity.currentAnimation.update();
            }
        }
    };
    
    Updater.prototype.updateTransitions = function() {
        if (this.game && this.game.transitionManager) {
            this.game.transitionManager.update();
        }
    };
    
    Updater.prototype.callUpdateCallbacks = function(deltaTime) {
        for (var i = 0; i < this.updateCallbacks.length; i++) {
            var callback = this.updateCallbacks[i];
            if (typeof callback === 'function') {
                callback(deltaTime);
            }
        }
    };
    
    Updater.prototype.updatePerformanceMetrics = function(startTime) {
        this.frameTime = performance.now() - startTime;
        
        // Add to history
        this.frameTimeHistory.push(this.frameTime);
        if (this.frameTimeHistory.length > this.maxFrameTimeHistory) {
            this.frameTimeHistory.shift();
        }
        
        // Calculate average
        var sum = 0;
        for (var i = 0; i < this.frameTimeHistory.length; i++) {
            sum += this.frameTimeHistory[i];
        }
        this.averageFrameTime = sum / this.frameTimeHistory.length;
    };
    
    Updater.prototype.addUpdateCallback = function(callback) {
        if (typeof callback === 'function') {
            this.updateCallbacks.push(callback);
        }
    };
    
    Updater.prototype.removeUpdateCallback = function(callback) {
        var index = this.updateCallbacks.indexOf(callback);
        if (index !== -1) {
            this.updateCallbacks.splice(index, 1);
        }
    };
    
    Updater.prototype.clearUpdateCallbacks = function() {
        this.updateCallbacks = [];
    };
    
    Updater.prototype.getFrameTime = function() {
        return this.frameTime;
    };
    
    Updater.prototype.getAverageFrameTime = function() {
        return this.averageFrameTime;
    };
    
    Updater.prototype.getFPS = function() {
        return this.timer.getFPS();
    };
    
    Updater.prototype.getRunningTime = function() {
        return this.timer.getTime();
    };
    
    Updater.prototype.isUpdateRunning = function() {
        return this.isRunning;
    };
    
    Updater.prototype.setUpdateInterval = function(interval) {
        this.updateInterval = interval;
    };
    
    Updater.prototype.getUpdateInterval = function() {
        return this.updateInterval;
    };
    
    // Performance analysis
    Updater.prototype.getPerformanceReport = function() {
        return {
            fps: this.getFPS(),
            frameTime: this.frameTime,
            averageFrameTime: this.averageFrameTime,
            runningTime: this.getRunningTime(),
            entityCount: this.game ? this.game.entities.length : 0,
            isRunning: this.isRunning
        };
    };
    
    Updater.prototype.logPerformance = function() {
        var report = this.getPerformanceReport();
        console.log('Performance Report:', report);
    };
    
    // Utility methods
    Updater.prototype.setFixedTimeStep = function(enabled, stepSize) {
        this.fixedTimeStep = enabled;
        this.timeStepSize = stepSize || 1000 / 60; // 60 FPS default
    };
    
    Updater.prototype.throttleUpdates = function(enabled, threshold) {
        this.throttleEnabled = enabled;
        this.throttleThreshold = threshold || 32; // ~30 FPS threshold
    };
    
    return Updater;
});
