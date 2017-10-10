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
    
    session.room((room) => {
        if (!(room)) {
            res.send(['Not in a room'], 406, 'not in a room');
            return;
        } 
        
        res.send(room.getSafeUsers().filter((user) => { return user.role > 0 || user.gRole > 1;}));
    });
};

module.exports = ModApi;

