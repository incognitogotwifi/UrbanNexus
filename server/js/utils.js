var Utils = {};

Utils.random = function(range) {
    return Math.floor(Math.random() * range);
};

Utils.randomRange = function(min, max) {
    return min + (Math.random() * (max - min));
};

Utils.randomInt = function(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
};

Utils.clamp = function(min, max, value) {
    if(value < min) {
        return min;
    } else if(value > max) {
        return max;
    } else {
        return value;
    }
};

Utils.randomOrientation = function() {
    var o, r = Utils.random(4);

    if(r === 0)
        o = Types.Orientations.LEFT;
    if(r === 1)
        o = Types.Orientations.RIGHT;
    if(r === 2)
        o = Types.Orientations.UP;
    if(r === 3)
        o = Types.Orientations.DOWN;

    return o;
};

Utils.Mixin = function(target, source) {
    if(source) {
        for(var key, keys = Object.keys(source), l = keys.length; l--; ) {
            key = keys[l];
            if(source[key] != null && source[key] != target[key] && typeof source[key] !== 'function') {
                if(source[key] && source[key].constructor === Object) {
                    if(!target[key]) {
                        target[key] = {};
                    }
                    Utils.Mixin(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
    }
    return target;
};

Utils.distanceTo = function(x, y, x2, y2) {
    var distX = Math.abs(x - x2);
    var distY = Math.abs(y - y2);

    return (distX > distY) ? distX : distY;
};

module.exports = Utils;