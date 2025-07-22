if (typeof define === 'function' && define.amd) {
    // AMD environment
    define(['./gametypes'], function(Types) {
        return Types.Messages;
    });
} else {
    // Node.js environment
    var Types = require('./gametypes');
    module.exports = Types.Messages;
}