var logger = require('./../logger.js');

var ModApi = function () {};

ModApi.prototype.new = true;
ModApi.prototype.init = function (con, res, getMain) {
    this.con = con;
    this.res = res;
    this.getMain = getMain;
};

ModApi.prototype.post = function (data) {
    var con = this.con;
    var session = this.con.session || {};
    var res = this.res;
    var getMain = this.getMain;
    var store = session.store() || {};
    
    var slug = data.slug || 'alex_is_a_stupid_nigger';
    var room = getMain().rooms.filter((obj) => {
        return obj.slug === slug;
    })[0];


    if ((slug === 'dashboard') || (!(room))) {
        res.ends(['Room not found'], 405, 'showdash');
        return;
    } else if (!(room)) {
        res.ends(['Room not found'], 404, 'notFound');
        return;
    }
 
    session.getRooms().forEach((room) => {
        if (con.session.loggedIn) {
            room.leave(con.session.accountId);
        } else {
            room.updateGuestCount(false, con.session);
        }
    });
    
    session.rooms = [slug];

    if (con.session.loggedIn) {
        var ban = room.isBanned(con.session.store().id);
        if (ban) {
            res.ends([{
                r: ban.reason,
                e: (ban.date - Date.leg_now()) / 1000,
                d: ban.duration
            }], 410, 'ban');
            return;
        }
        room.addUser(con.session);
    } else {
        room.updateGuestCount(true, con.session);
    }
    
    res.send({});
};


module.exports = ModApi;

