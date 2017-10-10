var logger = require('./../logger.js');
var userstore = require('./../../lib/userStore.js');

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
    
    getMain().sessions.removeEntry(session);
    res.send(['ok']);
};

module.exports = ModApi;
