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
     
    var keyWords = decodeURIComponent(con.args.q.toLowerCase()).split(" ");
    var rooms = getMain().rooms.filter((room) => {
        if (keyWords.length === 0)
            return true;
        for (word of keyWords)
             if (room.name.toLowerCase().contains(word) 
                    || (room.playing.media.title || '').toLowerCase().contains(word) 
                    || word.contains("plugdjall")) 
                return true;
        return false;
    })
    .sort(function (a, b) {
        return a.usersId.length > b.usersId.length;
    })
    .slice(0, 50)
    .map((room) => {
        return room.getSPayload(con.session.store())
    });
    res.ends(rooms);
};

module.exports = ModApi;
