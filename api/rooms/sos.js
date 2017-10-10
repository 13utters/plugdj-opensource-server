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
    
    if (!(data.message)) {
        res.ends(['Missing message field'], 400, 'badRequest');
        return;
    }

    var message = util.format('>SOS<\r\nRoom: %s,\r\nUserslug: %s,\r\nMessage: %s', session.rooms[0], store.slug, data.message);
    
    getMain().sessions.filter((session) => {
        return session.store().gRole > 0;
    }).forEach((session) => {
        for (i = 0; i < 10; i ++) {    
            logger.warn(message);
            session.socket.sendEvent('chat', {
                cid: util.format('%s-%s',
                    Math.getRandom(1000000, 9999999),
                    Math.getRandom(1000000, 9999999)),
                message: message,
                sub: true,
                uid: -3,
                un: 'CONSOLE'
            })
        }
    });
    
    res.ends([]);
};

module.exports = ModApi;