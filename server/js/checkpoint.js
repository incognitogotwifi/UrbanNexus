var cls = require('./lib/class'),
    Utils = require('./utils');

module.exports = Checkpoint = cls.Class.extend({
    init: function(id, x, y, width, height) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    },

    getRandomPosition: function() {
        var pos,
            valid = false,
            tries = 0;

        while(!valid && tries < 25) {
            pos = {
                x: this.x + Utils.randomInt(0, this.width-1),
                y: this.y + Utils.randomInt(0, this.height-1)
            };
            valid = true;
            tries += 1;
        }
        return pos;
    }
});