var logger = require('./../logger.js');

var ModApi = function () {};

ModApi.prototype.new = true;
ModApi.prototype.init = function (con, res, getMain) {
    this.con = con;
    this.res = res;
    this.getMain = getMain;
};


ModApi.prototype.post = ModApi.prototype.put = ModApi.prototype.delete = function (data) {
    var con = this.con;
    var session = this.con.session || {};
    var res = this.res;
    var getMain = this.getMain;
    var store = session.store();

    session.room((room) => { 
        if (!(room)) {
            res.send(['Not in a room'], 200, 'showdash');
            return;
        }
        
        if (!((room.getRole(store.id) > 1) || (store.gRole > 2))) {
            res.send(['No perms'], 401, 'unauthorised');
            return;
        } 
        
        room.removeMessage(con.url.substring(con.url.lastIndexOf('/') + 1), store.id);   
    });
    
    res.send([]);
};

module.exports = ModApi;