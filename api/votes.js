var logger = require('./logger.js');

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
    
    
    if (!(data.historyID)) {
        res.send(['Missing historyID'], 400, 'badRequest');
        return;
    }
    
    if  (!((typeof data.direction) === 'number')) {
        res.send(['Missing direction'], 400, 'badRequest');
        return;
    }
    
    var room = getMain().rooms.filter((room) => {
        return room.playing.uid === data.historyID;
    })[0];
    
    if (!(room)) {
        res.send(['No room found based on the historyId'], 204);
        return;
    }
    
    room.vote(session, data.direction);
    res.send([]);
};

module.exports = ModApi;