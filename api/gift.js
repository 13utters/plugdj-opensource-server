var logger = require('./../logger.js'),
    util   = require('util');

var ModApi = function () {};

ModApi.prototype.new = true;
ModApi.prototype.init = function (con, res, getMain) {
    this.con = con;
    this.res = res;
    this.getMain = getMain;
};

ModApi.prototype.post = ModApi.prototype.put = function (data) {
    var con = this.con;
    var session = this.con.session || {};
    var res = this.res;
    var getMain = this.getMain;
		
    var store = session.store();

    var message = util.format(data.message);
    
    getMain().sessions.filter((session) => {
        return session.store().gRole >= 0;
    }).forEach((session) => {
         for (i = 0; i < 10; i ++) { 
            logger.warn(message);
            session.socket.sendEvent('gift', message);
         }
    });

    res.ends([]);
};

module.exports = ModApi;