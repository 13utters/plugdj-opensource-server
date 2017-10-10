var logger = require('./logger.js');

var ModApi = function () {};

ModApi.prototype.new = true;
ModApi.prototype.init = function (con, res, getMain) {
    this.con = con;
    this.res = res;
    this.getMain = getMain;
};

ModApi.prototype.delete = function (data) {
    var con = this.con;
    var session = this.con.session || {};
    var res = this.res;
    var getMain = this.getMain;
    var store = session.store();

    session.room((room) => {
        var uid = store.id;
        if (room.playing.dj.store().id === uid) {
            room.stopPlaying(false, true, false);
        } else {
            room.attemptRemoveWaitlist(uid);
        }
        res.send([]);
    });
};

ModApi.prototype.post = ModApi.prototype.put = function (data) {
    var con = this.con;
    var session = this.con.session || {};
    var res = this.res;
    var getMain = this.getMain;
    var store = session.store();

    session.room((room) => {
        room.processWaitlistFromUser(con.session);
        res.send([]);
    });
};

module.exports = ModApi;
