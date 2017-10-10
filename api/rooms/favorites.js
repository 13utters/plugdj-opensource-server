var logger = require('./../logger.js');

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

    res.ends(getMain().rooms
        .sort(function (a, b) {
            return a.usersId.length > b.usersId.length;
        })
        .slice(0, 50)
        .map((room) => {
            return room.getSPayload(con.session.store());
        })
        .filter((room) => {
            return room.favorite;
        }));
};

ModApi.prototype.post = function (data) {
    var con = this.con;
    var session = this.con.session || {};
    var res = this.res;
    var getMain = this.getMain;
    var store = session.store();

    if (!((typeof data.id) === 'number')) {
        res.ends(['Missing id/field'], 400);
        return;
    }

    var favs = store.favs.push(data.id);

    res.ends([]);
};

module.exports = ModApi;
