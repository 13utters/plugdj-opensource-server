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
    var store = session.store();
    
    if (!(data.historyID)) {
        res.send(['Missing historyID'], 400, 'badRequest');
        return;
    }
    
    if  (!((typeof data.playlistID) === 'number')) {
        res.send(['Missing playlistID'], 400, 'badRequest');
        return;
    }
    
    var room = getMain().rooms.filter((room) => {
        return room.playing.uid === data.historyID;
    })[0];
    
    var playlist = session.store().playlists.filter((pl) => {
        return pl.id === data.playlistID;
    })[0];
    
    if (!(room)) {
        res.send(['No room found based on the historyId'], 204);
        return;
    }
    
    if (!(playlist)) {
        res.send(['No playlist found based on the playlistID'], 204);
        return;
    }
    
    const ourInst = JSON.parse(JSON.stringify(room.playing.media));
    const mediaIds = playlist.media.map((media) => {return media.id;});
    while (mediaIds.contains(ourInst.id))
        ourInst.id++;
    
    room.broadcast('grab', session.accountId);
    room.vote(session, 1);
    playlist.media.push(ourInst);
    playlist.media.count = playlist.media.length;
    res.send(playlist.media);
};

module.exports = ModApi;
