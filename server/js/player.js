var cls = require("./lib/class"),
    _ = require("underscore"),
    Messages = require("./message"),
    Utils = require("./utils"),
    Properties = require("./properties"),
    Formulas = require("./formulas"),
    check = require("./format").check,
    Types = require("../../shared/js/gametypes");

module.exports = Player = Character.extend({
    init: function(connection, worldServer) {
        var self = this;

        this.server = worldServer;
        this.connection = connection;

        this._super(this.connection.id, "player", Types.Entities.WARRIOR, 0, 0, "");

        this.hasEnteredGame = false;
        this.isDead = false;
        this.haters = {};
        this.lastCheckpoint = null;
        this.formatChecker = new FormatChecker();
        this.disconnectTimeout = null;

        this.connection.listen(function(message) {
            var action = parseInt(message[0]);

            console.log("Received: "+message);
            if(!check(message)) {
                self.connection.close("Invalid "+Types.getMessageTypeAsString(action)+" message format: "+message);
                return;
            }

            if(!self.hasEnteredGame && action !== Types.Messages.HELLO) { // HELLO must be the first message
                self.connection.close("Invalid handshake message: "+message);
                return;
            }
            if(self.hasEnteredGame && !self.isDead && action === Types.Messages.HELLO) { // HELLO can be sent only once
                self.connection.close("Cannot initiate handshake twice: "+message);
                return;
            }

            self.resetTimeout();

            if(action === Types.Messages.HELLO) {
                var name = Utils.sanitize(message[1]);

                // If name was cleared by the sanitizer, give a default name.
                // Always ensure that the name is not longer than a maximum length.
                // (also enforced by the maxlength attribute of the name input element).
                self.name = (name === "") ? "lorem ipsum" : name.substr(0, 15);

                self.kind = Types.Entities.WARRIOR;
                self.equipArmor(message[2]);
                self.equipWeapon(message[3]);
                self.orientation = Utils.randomOrientation();
                self.updateHitPoints();
                self.updatePosition();

                self.server.addPlayer(self);
                self.server.enter_callback(self);

                self.send([Types.Messages.WELCOME, self.id, self.name, self.x, self.y, self.hitPoints]);
                self.hasEnteredGame = true;
                self.isDead = false;
            }
            else if(action === Types.Messages.WHO) {
                message.shift();
                self.server.pushSpawnsToPlayer(self, message);
            }
            else if(action === Types.Messages.ZONE) {
                self.zone_callback();
            }
            else if(action === Types.Messages.CHAT) {
                var msg = Utils.sanitize(message[1]);

                // Sanitized messages may become empty. No need to broadcast empty chat messages.
                if(msg && msg !== "") {
                    msg = msg.substr(0, 60); // Enforce maxlength of chat input
                    self.broadcastToZone(new Messages.Chat(self, msg), false);
                }
            }
            else if(action === Types.Messages.MOVE) {
                if(self.move_callback) {
                    var x = message[1],
                        y = message[2];

                    if(self.server.isValidPosition(x, y)) {
                        self.setPosition(x, y);
                        self.clearTarget();

                        self.broadcast(new Messages.Move(self));
                        self.move_callback(self.x, self.y);
                    }
                }
            }
            // Additional message handlers would continue here...
            else {
                if(self.message_callback) {
                    self.message_callback(message);
                }
            }
        });

        this.connection.onClose(function() {
            if(self.firepotionTimeout) {
                clearTimeout(self.firepotionTimeout);
            }
            clearTimeout(self.disconnectTimeout);
            if(self.exit_callback) {
                self.exit_callback();
            }
        });

        this.connection.sendUTF8("go"); // Notify client that the HELLO/WELCOME handshake can start
    },

    destroy: function() {
        var self = this;

        this.forEachAttacker(function(mob) {
            mob.clearTarget();
        });
        this.attackers = {};

        this.forEachHater(function(mob) {
            mob.forgetPlayer(self.id);
        });
        this.haters = {};
    },

    getState: function() {
        var basestate = this._getBaseState(),
            state = [this.name, this.orientation, this.armor, this.weapon];

        if(this.target) {
            state.push(this.target);
        }

        return basestate.concat(state);
    },

    send: function(message) {
        this.connection.send(message);
    },

    broadcast: function(message, ignoreSelf) {
        if(this.broadcast_callback) {
            this.broadcast_callback(message, ignoreSelf === undefined ? true : ignoreSelf);
        }
    },

    broadcastToZone: function(message, ignoreSelf) {
        if(this.broadcastzone_callback) {
            this.broadcastzone_callback(message, ignoreSelf === undefined ? true : ignoreSelf);
        }
    },

    onExit: function(callback) {
        this.exit_callback = callback;
    },

    onMove: function(callback) {
        this.move_callback = callback;
    },

    onLootMove: function(callback) {
        this.lootmove_callback = callback;
    },

    onZone: function(callback) {
        this.zone_callback = callback;
    },

    onOrient: function(callback) {
        this.orient_callback = callback;
    },

    onMessage: function(callback) {
        this.message_callback = callback;
    },

    onBroadcast: function(callback) {
        this.broadcast_callback = callback;
    },

    onBroadcastToZone: function(callback) {
        this.broadcastzone_callback = callback;
    },

    equip: function(item) {
        return new Messages.EquipItem(this, item);
    },

    addHater: function(mob) {
        if(mob) {
            if(!(mob.id in this.haters)) {
                this.haters[mob.id] = mob;
            }
        }
    },

    removeHater: function(mob) {
        if(mob && mob.id in this.haters) {
            delete this.haters[mob.id];
        }
    },

    forEachHater: function(callback) {
        _.each(this.haters, function(mob) {
            callback(mob);
        });
    },

    equipArmor: function(kind) {
        this.armor = kind;
        this.armorLevel = Properties.getArmorLevel(kind);
    },

    equipWeapon: function(kind) {
        this.weapon = kind;
        this.weaponLevel = Properties.getWeaponLevel(kind);
    },

    equipItem: function(item) {
        if(item) {
            console.log(this.name + " equips " + Types.getKindAsString(item.kind));

            if(Types.isArmor(item.kind)) {
                this.equipArmor(item.kind);
                this.updateHitPoints();
                this.send(new Messages.HitPoints(this.maxHitPoints).serialize());
            } else if(Types.isWeapon(item.kind)) {
                this.equipWeapon(item.kind);
            }
        }
    },

    updateHitPoints: function() {
        this.resetHitPoints(Formulas.hp(this.armorLevel));
    },

    updatePosition: function() {
        if(this.requestpos_callback) {
            var pos = this.requestpos_callback();
            this.setPosition(pos.x, pos.y);
        }
    },

    onRequestPosition: function(callback) {
        this.requestpos_callback = callback;
    },

    resetTimeout: function() {
        clearTimeout(this.disconnectTimeout);
        this.disconnectTimeout = setTimeout(this.timeout.bind(this), 1000 * 60 * 15); // 15 min.
    },

    timeout: function() {
        this.connection.sendUTF8("timeout");
        this.connection.close("Player was idle for too long");
    }
});