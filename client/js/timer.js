define([], function() {
    'use strict';
    
    var Timer = function() {
        this.time = 0;
        this.lastTime = 0;
        this.delta = 0;
        
        this.isRunning = false;
        this.isPaused = false;
        
        // Performance tracking
        this.frameCount = 0;
        this.fps = 0;
        this.lastFpsUpdate = 0;
        
        // Timing intervals
        this.intervals = [];
        this.timeouts = [];
        this.nextIntervalId = 1;
        this.nextTimeoutId = 1;
    };
    
    Timer.prototype.start = function() {
        this.isRunning = true;
        this.isPaused = false;
        this.lastTime = Date.now();
    };
    
    Timer.prototype.stop = function() {
        this.isRunning = false;
        this.isPaused = false;
        this.clearAllIntervals();
        this.clearAllTimeouts();
    };
    
    Timer.prototype.pause = function() {
        this.isPaused = true;
    };
    
    Timer.prototype.resume = function() {
        this.isPaused = false;
        this.lastTime = Date.now();
    };
    
    Timer.prototype.update = function() {
        if (!this.isRunning || this.isPaused) {
            return;
        }
        
        var currentTime = Date.now();
        this.delta = currentTime - this.lastTime;
        this.time += this.delta;
        this.lastTime = currentTime;
        
        // Update FPS
        this.frameCount++;
        if (currentTime - this.lastFpsUpdate >= 1000) {
            this.fps = Math.round(this.frameCount * 1000 / (currentTime - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
        }
        
        // Update intervals
        this.updateIntervals(currentTime);
        
        // Update timeouts
        this.updateTimeouts(currentTime);
    };
    
    Timer.prototype.updateIntervals = function(currentTime) {
        for (var i = this.intervals.length - 1; i >= 0; i--) {
            var interval = this.intervals[i];
            
            if (currentTime - interval.lastCall >= interval.delay) {
                interval.callback();
                interval.lastCall = currentTime;
            }
        }
    };
    
    Timer.prototype.updateTimeouts = function(currentTime) {
        for (var i = this.timeouts.length - 1; i >= 0; i--) {
            var timeout = this.timeouts[i];
            
            if (currentTime - timeout.startTime >= timeout.delay) {
                timeout.callback();
                this.timeouts.splice(i, 1);
            }
        }
    };
    
    Timer.prototype.setInterval = function(callback, delay) {
        var id = this.nextIntervalId++;
        var interval = {
            id: id,
            callback: callback,
            delay: delay,
            lastCall: Date.now()
        };
        
        this.intervals.push(interval);
        return id;
    };
    
    Timer.prototype.clearInterval = function(id) {
        for (var i = this.intervals.length - 1; i >= 0; i--) {
            if (this.intervals[i].id === id) {
                this.intervals.splice(i, 1);
                break;
            }
        }
    };
    
    Timer.prototype.clearAllIntervals = function() {
        this.intervals = [];
    };
    
    Timer.prototype.setTimeout = function(callback, delay) {
        var id = this.nextTimeoutId++;
        var timeout = {
            id: id,
            callback: callback,
            delay: delay,
            startTime: Date.now()
        };
        
        this.timeouts.push(timeout);
        return id;
    };
    
    Timer.prototype.clearTimeout = function(id) {
        for (var i = this.timeouts.length - 1; i >= 0; i--) {
            if (this.timeouts[i].id === id) {
                this.timeouts.splice(i, 1);
                break;
            }
        }
    };
    
    Timer.prototype.clearAllTimeouts = function() {
        this.timeouts = [];
    };
    
    Timer.prototype.getTime = function() {
        return this.time;
    };
    
    Timer.prototype.getDelta = function() {
        return this.delta;
    };
    
    Timer.prototype.getFPS = function() {
        return this.fps;
    };
    
    Timer.prototype.reset = function() {
        this.time = 0;
        this.lastTime = Date.now();
        this.delta = 0;
        this.frameCount = 0;
        this.fps = 0;
        this.lastFpsUpdate = Date.now();
    };
    
    // Utility methods for time formatting
    Timer.prototype.formatTime = function(milliseconds) {
        var seconds = Math.floor(milliseconds / 1000);
        var minutes = Math.floor(seconds / 60);
        var hours = Math.floor(minutes / 60);
        
        seconds = seconds % 60;
        minutes = minutes % 60;
        
        var result = '';
        
        if (hours > 0) {
            result += hours + ':';
        }
        
        if (minutes > 0 || hours > 0) {
            result += (minutes < 10 && hours > 0 ? '0' : '') + minutes + ':';
        }
        
        result += (seconds < 10 && (minutes > 0 || hours > 0) ? '0' : '') + seconds;
        
        return result;
    };
    
    Timer.prototype.formatDuration = function(milliseconds) {
        return this.formatTime(milliseconds);
    };
    
    Timer.prototype.getElapsedTime = function() {
        return this.formatTime(this.time);
    };
    
    // Performance measurement
    Timer.prototype.measurePerformance = function(name, func) {
        var startTime = performance.now();
        var result = func();
        var endTime = performance.now();
        
        console.log(name + ' took ' + (endTime - startTime) + ' milliseconds');
        
        return result;
    };
    
    Timer.prototype.measurePerformanceAsync = function(name, func) {
        var startTime = performance.now();
        
        return Promise.resolve(func()).then(function(result) {
            var endTime = performance.now();
            console.log(name + ' took ' + (endTime - startTime) + ' milliseconds');
            return result;
        });
    };
    
    // Static timer for global use
    Timer.global = new Timer();
    
    // Static utility methods
    Timer.now = function() {
        return Date.now();
    };
    
    Timer.sleep = function(milliseconds) {
        return new Promise(function(resolve) {
            setTimeout(resolve, milliseconds);
        });
    };
    
    Timer.debounce = function(func, delay) {
        var timeoutId;
        
        return function() {
            var context = this;
            var args = arguments;
            
            clearTimeout(timeoutId);
            timeoutId = setTimeout(function() {
                func.apply(context, args);
            }, delay);
        };
    };
    
    Timer.throttle = function(func, delay) {
        var lastCall = 0;
        
        return function() {
            var now = Date.now();
            
            if (now - lastCall >= delay) {
                lastCall = now;
                return func.apply(this, arguments);
            }
        };
    };
    
    Timer.frameThrottle = function(func) {
        var requestId;
        var lastArgs;
        
        return function() {
            lastArgs = arguments;
            
            if (!requestId) {
                requestId = requestAnimationFrame(function() {
                    requestId = null;
                    func.apply(this, lastArgs);
                }.bind(this));
            }
        };
    };
    
    return Timer;
});

