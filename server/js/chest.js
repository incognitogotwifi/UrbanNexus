var cls = require('./lib/class'),
    _ = require('underscore'),
    Types = require("../../shared/js/gametypes");

module.exports = Chest = Entity.extend({
    init: function(id, x, y) {
        this._super(id, "chest", Types.Entities.CHEST, x, y);
        this.items = [];
    },

    setItems: function(items) {
        this.items = items;
    },

    getRandomItem: function() {
        var nbItems = _.size(this.items),
            item = null;

        if(nbItems > 0) {
            item = this.items[Utils.random(nbItems)];
        }
        return item;
    }
});