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

        if (!((typeof data.removeAllDJs) === 'boolean')) {
            res.ends(['Missing removeAllDJs'], 400, 'badRequest');
            return;
        }
        
        if (!((typeof data.isLocked) === 'boolean')) {
            res.ends(['Missing isLocked'], 400, 'badRequest');
            return;
        }
        
        if (data.isLocked) {
            room.disableWaitlist(data.removeAllDJs, store.id, store.username);
        } else { 
            room.enableWaitlist(store.id, store.username);;
        }
        
        res.send([]);
    });
};

module.exports = ModApi;