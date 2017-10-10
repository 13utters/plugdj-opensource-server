var logger = require('./../logger.js');

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

    session.room((room) => {
        if (!(room)) {
            res.ends(['Not in a room'], 200, 'showdash');
            return;
        }
        if (!((room.getRole(store.id) > 1) || (store.gRole > 2))) {
            res.ends(['No perms'], 401, 'unauthorised');
            return;
        }
	    room.iterateDJs == data.shouldCycle;
  
        room.broadcast('djListCycle', {
            f: data.shouldCycle,
            m: store.username,
            mi: store.id
        });
        
        res.send([]);
    });
};

module.exports = ModApi;