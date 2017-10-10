var logger = require('./../logger.js');

var ModApi = function () {};

ModApi.prototype.new = true;
ModApi.prototype.init = function (con, res, getMain) {
    this.con = con;
    this.res = res;
    this.getMain = getMain;
};

ModApi.prototype.post = function (data) {
    var con = this.con;
    var session = this.con.session || {};
    var res = this.res;
    var getMain = this.getMain;
    var store = session.store();


    session.room((room) => {
        var store = session.store();

        if (!(room.getRole(store.id) > 1 || store.gRole > 2)) {
            res.ends(['No permission'], 401, 'Unauthorised');
            return;
        }

        var duration = data.duration;
        var time = Date.leg_now() + (duration === 'm' ? 1000 * 60 * 60 : duration === 'd' ? 1000 * 60 * 60 * 24 : 333333333333);
        var sessiona = getMain().sessions.filter((user) => {
            return user.accountId === data.userID;
        })[0];

        if (!(sessiona))
            return;

        var user = sessiona.store();

        if (!(user))
            return;
            
        if((room.getRole(user.id) >= room.getRole(store.id) ||  user.gRole >= store.gRole)) {
            res.ends(['No permission'], 401, 'Unauthorised');
            return;
        }

        if (room.bans.filter((ban) => {
                return ban.id === user.id
            }).length > 0) {
            res.send([]);
            return;
        }

        var payload = {
            date: time,
            reason: data.reason,
            id: user.id,
            duration: duration,
            username: user.slug,
            moderator: store.username
        };

        room.bans.push(payload);

        room.broadcast('modBan', {
            m: payload.moderator,
            i: payload.id,
            t: payload.username,
            r: payload.reason,
            d: duration,
        });

        sessiona.socket.sendEvent('ban', {
            d: payload.duration,
            r: payload.reason,
            t: 'ban',
        });

        res.send([]);
    });
};

ModApi.prototype.delete = function (data) {
    var con = this.con;
    var session = this.con.session || {};
    var res = this.res;
    var getMain = this.getMain;
    var store = session.store();
    var url = con.realUrl;

    session.room((room) => {
        var store = session.store();
        var id = url.substring(url.lastIndexOf('/') + 1);

        if (!(room.getRole(store.id) > 1 || store.gRole > 2)) {
            res.ends(['No permission'], 401, 'unauthorised');
            return;
        }

        var ban = room.bans.filter((ban) => {
            return ban.id == id;
        })[0];

        if (!(ban)) {
            res.ends(['No ban on file'], 404, 'notFound');
            return;
        }

        room.bans.removeEntry(ban);
        res.send([]);
    });
};

ModApi.prototype.get = function (data) {
    var con = this.con;
    var session = this.con.session || {};
    var res = this.res;
    var getMain = this.getMain;
    var store = session.store();

    session.room((room) => {
        var array = room.bans.map((ban) => {
            var p = {
                expires: Math.round((ban.date - Date.leg_now()) / 1000),
                moderator: ban.moderator,
                id: ban.id,
                username: ban.username,
                reason: ban.reason,
            };
            
            if (p.expires > 0) 
                return p;
                
            room.bans.removeEntry(ban);
        }).filter((ban) => { return ban});
        res.ends(array);
    });
};

module.exports = ModApi;