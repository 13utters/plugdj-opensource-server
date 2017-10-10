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
            res.send(['Not in a room'], 200, 'showdash');
            return;
        }
        
        if (!((room.getRole(store.id) > 1)
                || (store.gRole > 0))) {
            res.send(['No perms'], 401, 'unauthorised');
            return;
        }
        
        const id = data.userID,
            pos = data.position;
        var oldPos = undefined,
            media = undefined;
        
        if (!((typeof id) === 'string')) {
            res.send(['Missing id'], 400, 'badRequest');
            return;
        }
        
        if (!((typeof pos) === 'number')) {
            res.send(['Missing pos'], 400, 'badRequest');
            return;
        }

        for (a in room.backlist) {
            var backlog = room.backlist[a];
            if (backlog.dj.store().id == id) {
                media = backlog;
                oldPos = a;
                room.backlist.splice(a, 1);
                break;
            }
        }
        
        if (media) 
            room.backlist.splice(pos, 0, media);
        
        res.send(room.backlist);
    });
};

module.exports = ModApi;