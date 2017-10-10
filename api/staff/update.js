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
        var role = data.roleID;
        var uid = data.userID;

        if (!(role < room.getRole(store.id))) {
            res.ends(['Your role < Said role'], 400, 'unautherised');
            return;
        }

        var item = room.knownUsers.filter((u) => {
            return u.id === uid;
        })[0];

        if (item) {
            item.role = role;
        } else {
            room.knownUsers.push({
                role: role,
                id: uid
            });
        }

        room.broadcast('modStaff', {
            m: store.username,
            mi: store.id,
            u: [
                {
                    n: 'user',
                    i: uid,
                    p: role
                }
            ]
        });

        res.ends([]);
    });
};

module.exports = ModApi;