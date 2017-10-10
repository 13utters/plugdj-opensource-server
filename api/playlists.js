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

    res.send(session.store().playlists);
};

ModApi.prototype.post = function (data) {
    var con = this.con;
    var session = this.con.session || {};
    var res = this.res;
    var getMain = this.getMain;
    var store = session.store();

    if (!(data.name)) {
        res.ends(['Missing name'], 400, 'bad request');
        return;
    }

    data.media = data.media || [];
    data.capacity = 999;
    data.id = session.utilUser().getFreePlId();
    data.active = session.store().playlists.length === 0;
    data.count = data.media.length;

    for (var i = 0; i < data.media.length; i++)
        data.media[i].id = i + data.id;

    store.playlists.push(data);
    res.ends([data]);
};

module.exports = ModApi;
