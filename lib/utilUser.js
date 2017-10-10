var logger = require('./../logger.js'),
    fs = require('fs'),
    md5 = require('md5'),
    path = require('path');

var utilUser = function (session) {
    this.session = session;
};

utilUser.prototype.getSPayload = function (room){
    var store = this.session.store();
    return {
        'avatarID': store.avatarID,
        'username': store.username,
        'language': store.language,
        'guest': store.guest,
        'level': store.level,
        'role': room.getRole(store.id),
        'gRole': store.gRole,
        'joined': store.joined,
        'id': store.id,
        'badge': store.badge,
        'slug': store.slug,
        'blurb': store.blurb,
        'sub': store.sub,
        'silver': store.silver,
        'donator': store.donator,
		'friends': store.friends,
		'friendsreq': store.friendsreq

    }
};

utilUser.prototype.getFreePlId =  function ()  {
    var _self = this.session;
    var ids = _self.store().playlists.map((playlist) => {
        return playlist.id;
    });
    var id = _self.store().id;
    while (ids.contains(id))
        id++;
    return id;
};

utilUser.prototype.getPlFromMediaId = function (medId) {
    var _self = this.session;
    return _self.store().playlists.filter((obj) => {
        var media = obj.media.filter((media) => {
            return media.id == medId;
        })[0];
        return media;
    })[0];
};

//hacky
utilUser.prototype.getMedia =function (id, playlist) {
    var _self = this.session;
    if (playlist) {
        return playlist.media.filter((media) => {
            return media.id === id;
        })[0];
    }
    var a = [];
    for (obj of _self.store().playlists) {
        var media = obj.media.filter((media) => {
            return media.id === id;
        })[0];
        if (media)
            a.push(media);
    }
    return a[0];
};

utilUser.prototype.getPlaylistById = function (id)  {
    var _self = this.session;
    return _self.store().playlists.filter((playlist) => {
        return playlist.id == id;
    })[0];
};

utilUser.prototype.upgrade = function () {
    var _self = this.session;
    var store = _self.store();
    var x = [0, 12, 45, 180, 1350, 3e3, 8400, 12500, 18900, 26150, 34875, 44e3, 55500, 69225, 85575, 110550, 139290, 173450, 212e3, 261575, 315e3],
        nextXp = x.length < store.level ? 20000000 : x[store.level];


    if (store.xp > nextXp) {
        store.level++;
        switch (store.level) {
        case 2:
            logger.log('Giving %s 450 pp for getting to level two', store.username);
            store.pp += 450;
        default:
            logger.log('No reward found for level %s', store.level);
        }

        _self.socket.sendEvent('notify', [{
            'action': 'levelUp',
            'id': store.id,
            'timestamp': Date.now(),
            'value': store.level
                }]);

        this.updateUser(true, false, false, true);
    }
};

utilUser.prototype.updateUser = function (leg, avatar, badge, level) {
    var _self = this.session;
    leg = !leg;
    var store = _self.store();
    var payload = badge ? {
        i: store.id,
        badge: store.badge
    } : avatar ? {
        i: store.id,
        avatarID: store.avatarID
    } : level ? {
        i: store.id,
        level: store.level
    } : {
        i: store.id,
        xp: store.xp,
        sub: store.sub,
        avatarID: store.avatarID,
        username: store.username,
        badge: store.badge,
        guest: false,
        level: store.level,
        donator: store.donator,
        silver: store.silver
    };
    _self.getRooms().forEach((room) => {
        room.broadcast('userUpdate', payload);
    });
    _self.socket.sendEvent('userUpdate', payload);
};

utilUser.prototype.earn = function (user, xp, pp) {
    var _self = this.session;
    pp = pp || 0;
    _self.store().xp += xp
    _self.store().pp += pp

    this.upgrade(user);

    if (!(user.socket))
        return;

    _self.socket.sendEvent('earn', {
        xp: user.store().xp,
        pp: user.store().pp,
        level: user.store().level
    })
};

module.exports = utilUser;