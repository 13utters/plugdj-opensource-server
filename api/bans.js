var logger = require('./logger.js');

var ModApi = function () {};

ModApi.prototype.new = true;
ModApi.prototype.init = function (con, res, getMain) {
    this.con = con;
    this.res = res;
    this.getMain = getMain;
};

ModApi.prototype.get = function (data) {
    var con = this.con;
    var session = this.con.session || {};
    var res = this.res;
    var getMain = this.getMain;
    var store = session.store();
    
    session.room((room) => {
        if (!(room)) {
            res.ends(['Not in a room'], 406, 'not in a room');
            return;
        }
        
        var array = [];
        room.bans.forEach((ban) => {
            var p = {
                expires: Math.round(((ban.date - Date.leg_now()) / 1000)),
                moderator: ban.moderator,
                id: ban.id,
                username: ban.username,
                reason: ban.reason,
                timestamp: Date.leg_now()
            };

            if (p.expires > 0) {
                array.push(p);
            } else {
                room.bans.removeEntry(ban);
            }
        });
        res.ends(array);
    });
};

module.exports = ModApi;
