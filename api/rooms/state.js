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
    
    session.room((room) => { 
        if (!(room)) {
            res.ends(['Not in a room'], 400, 'requestError');
            return;
        }
        
        res.send([room.getPayload(session.store())]);
    });
};

module.exports = ModApi;

