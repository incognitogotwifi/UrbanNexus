define(['timer'], function(Timer) {
    'use strict';
    
    var Transition = function(duration, ease) {
        this.duration = duration || 1000;
        this.ease = ease || Transition.Ease.LINEAR;
        
        this.startTime = 0;
        this.isRunning = false;
        this.isComplete = false;
        this.isPaused = false;
        this.pausedTime = 0;
        
        this.startValue = 0;
        this.endValue = 1;
        this.currentValue = 0;
        
        // Callbacks
        this.onStart = null;
        this.onUpdate = null;
        this.onComplete = null;
        this.onPause = null;
        this.onResume = null;
    };
    
    Transition.prototype.start = function(from, to) {
        this.startValue = from !== undefined ? from : 0;
        this.endValue = to !== undefined ? to : 1;
        this.currentValue = this.startValue;
        
        this.startTime = Timer.now();
        this.isRunning = true;
        this.isComplete = false;
        this.isPaused = false;
        this.pausedTime = 0;
        
        if (this.onStart) {
            this.onStart(this.startValue);
        }
    };
    
    Transition.prototype.stop = function() {
        this.isRunning = false;
        this.isComplete = true;
        this.isPaused = false;
    };
    
    Transition.prototype.pause = function() {
        if (this.isRunning && !this.isPaused) {
            this.isPaused = true;
            this.pausedTime = Timer.now();
            
            if (this.onPause) {
                this.onPause(this.currentValue);
            }
        }
    };
    
    Transition.prototype.resume = function() {
        if (this.isPaused) {
            var pauseDuration = Timer.now() - this.pausedTime;
            this.startTime += pauseDuration;
            this.isPaused = false;
            
            if (this.onResume) {
                this.onResume(this.currentValue);
            }
        }
    };
    
    Transition.prototype.update = function() {
        if (!this.isRunning || this.isPaused || this.isComplete) {
            return false;
        }
        
        var currentTime = Timer.now();
        var elapsed = currentTime - this.startTime;
        var progress = Math.min(elapsed / this.duration, 1);
        
        // Apply easing
        var easedProgress = this.ease(progress);
        
        // Calculate current value
        this.currentValue = this.startValue + (this.endValue - this.startValue) * easedProgress;
        
        // Call update callback
        if (this.onUpdate) {
            this.onUpdate(this.currentValue, progress);
        }
        
        // Check if complete
        if (progress >= 1) {
            this.isComplete = true;
            this.isRunning = false;
            this.currentValue = this.endValue;
            
            if (this.onComplete) {
                this.onComplete(this.endValue);
            }
        }
        
        return true;
    };
    
    Transition.prototype.getValue = function() {
        return this.currentValue;
    };
    
    Transition.prototype.getProgress = function() {
        if (!this.isRunning) {
            return this.isComplete ? 1 : 0;
        }
        
        var elapsed = Timer.now() - this.startTime;
        return Math.min(elapsed / this.duration, 1);
    };
    
    Transition.prototype.setDuration = function(duration) {
        this.duration = duration;
    };
    
    Transition.prototype.setEasing = function(ease) {
        this.ease = ease;
    };
    
    Transition.prototype.reverse = function() {
        var temp = this.startValue;
        this.startValue = this.endValue;
        this.endValue = temp;
        
        // Adjust start time to maintain current progress
        var progress = this.getProgress();
        this.startTime = Timer.now() - (1 - progress) * this.duration;
    };
    
    // Easing functions
    Transition.Ease = {
        LINEAR: function(t) {
            return t;
        },
        
        EASE_IN_QUAD: function(t) {
            return t * t;
        },
        
        EASE_OUT_QUAD: function(t) {
            return t * (2 - t);
        },
        
        EASE_IN_OUT_QUAD: function(t) {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        },
        
        EASE_IN_CUBIC: function(t) {
            return t * t * t;
        },
        
        EASE_OUT_CUBIC: function(t) {
            return (--t) * t * t + 1;
        },
        
        EASE_IN_OUT_CUBIC: function(t) {
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        },
        
        EASE_IN_QUART: function(t) {
            return t * t * t * t;
        },
        
        EASE_OUT_QUART: function(t) {
            return 1 - (--t) * t * t * t;
        },
        
        EASE_IN_OUT_QUART: function(t) {
            return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
        },
        
        EASE_IN_SINE: function(t) {
            return 1 - Math.cos((t * Math.PI) / 2);
        },
        
        EASE_OUT_SINE: function(t) {
            return Math.sin((t * Math.PI) / 2);
        },
        
        EASE_IN_OUT_SINE: function(t) {
            return -(Math.cos(Math.PI * t) - 1) / 2;
        },
        
        EASE_IN_EXPO: function(t) {
            return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
        },
        
        EASE_OUT_EXPO: function(t) {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        },
        
        EASE_IN_OUT_EXPO: function(t) {
            if (t === 0) return 0;
            if (t === 1) return 1;
            return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
        },
        
        EASE_IN_BACK: function(t) {
            var c1 = 1.70158;
            var c3 = c1 + 1;
            return c3 * t * t * t - c1 * t * t;
        },
        
        EASE_OUT_BACK: function(t) {
            var c1 = 1.70158;
            var c3 = c1 + 1;
            return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        },
        
        EASE_IN_OUT_BACK: function(t) {
            var c1 = 1.70158;
            var c2 = c1 * 1.525;
            return t < 0.5
                ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
                : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
        },
        
        EASE_IN_BOUNCE: function(t) {
            return 1 - Transition.Ease.EASE_OUT_BOUNCE(1 - t);
        },
        
        EASE_OUT_BOUNCE: function(t) {
            var n1 = 7.5625;
            var d1 = 2.75;
            
            if (t < 1 / d1) {
                return n1 * t * t;
            } else if (t < 2 / d1) {
                return n1 * (t -= 1.5 / d1) * t + 0.75;
            } else if (t < 2.5 / d1) {
                return n1 * (t -= 2.25 / d1) * t + 0.9375;
            } else {
                return n1 * (t -= 2.625 / d1) * t + 0.984375;
            }
        },
        
        EASE_IN_OUT_BOUNCE: function(t) {
            return t < 0.5
                ? (1 - Transition.Ease.EASE_OUT_BOUNCE(1 - 2 * t)) / 2
                : (1 + Transition.Ease.EASE_OUT_BOUNCE(2 * t - 1)) / 2;
        }
    };
    
    // Transition manager for handling multiple transitions
    var TransitionManager = function() {
        this.transitions = [];
    };
    
    TransitionManager.prototype.add = function(transition) {
        this.transitions.push(transition);
    };
    
    TransitionManager.prototype.remove = function(transition) {
        var index = this.transitions.indexOf(transition);
        if (index !== -1) {
            this.transitions.splice(index, 1);
        }
    };
    
    TransitionManager.prototype.clear = function() {
        this.transitions = [];
    };
    
    TransitionManager.prototype.update = function() {
        for (var i = this.transitions.length - 1; i >= 0; i--) {
            var transition = this.transitions[i];
            
            if (!transition.update()) {
                if (transition.isComplete) {
                    this.transitions.splice(i, 1);
                }
            }
        }
    };
    
    TransitionManager.prototype.pauseAll = function() {
        for (var i = 0; i < this.transitions.length; i++) {
            this.transitions[i].pause();
        }
    };
    
    TransitionManager.prototype.resumeAll = function() {
        for (var i = 0; i < this.transitions.length; i++) {
            this.transitions[i].resume();
        }
    };
    
    TransitionManager.prototype.stopAll = function() {
        for (var i = 0; i < this.transitions.length; i++) {
            this.transitions[i].stop();
        }
        this.clear();
    };
    
    // Helper functions for common transitions
    Transition.fadeIn = function(element, duration, callback) {
        var transition = new Transition(duration || 300, Transition.Ease.EASE_OUT_QUAD);
        
        transition.onUpdate = function(value) {
            element.style.opacity = value;
        };
        
        transition.onComplete = function() {
            if (callback) callback();
        };
        
        transition.start(0, 1);
        return transition;
    };
    
    Transition.fadeOut = function(element, duration, callback) {
        var transition = new Transition(duration || 300, Transition.Ease.EASE_OUT_QUAD);
        
        transition.onUpdate = function(value) {
            element.style.opacity = value;
        };
        
        transition.onComplete = function() {
            if (callback) callback();
        };
        
        transition.start(1, 0);
        return transition;
    };
    
    Transition.slideIn = function(element, direction, duration, callback) {
        var transition = new Transition(duration || 300, Transition.Ease.EASE_OUT_CUBIC);
        var startPos = direction === 'left' ? -100 : direction === 'right' ? 100 : 0;
        
        transition.onUpdate = function(value) {
            var pos = startPos + (0 - startPos) * value;
            element.style.transform = 'translateX(' + pos + '%)';
        };
        
        transition.onComplete = function() {
            if (callback) callback();
        };
        
        transition.start(0, 1);
        return transition;
    };
    
    // Export both classes
    Transition.Manager = TransitionManager;
    
    return Transition;
});

