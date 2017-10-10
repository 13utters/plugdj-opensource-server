var logger = require('./../../logger.js');
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
    
    var user = con.url.substring(con.url.lastIndexOf('/') + 1);
    var exists = getMain().getSTO().map((obj) => {return obj.name}).contains(user);
    
    if (exists) {
        res.send(['In use'], 600, 'accountInUse');
    } else {
        res.send(['Not in use']);
    }
};

module.exports = ModApi;
