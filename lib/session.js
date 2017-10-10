var express = require('express'),
    logger = require('./../logger.js'),
    utilUser = require('./utilUser.js'),
    util = require('util');


var session = function (getMain, token) {
    this.getMain = getMain;
    this.token = token;
    this.rooms = [];
    this.loggedIn = false;
    this.accountId = undefined;
    this.socket = undefined;
    this.sendingPings = true;
    this.share = undefined;
    this.utils = new utilUser(this);
    //deprecated
    this.utilUser = () => {return this.utils};
    
};

session.prototype.stop = function () {
    this.sendingPings = false;
    this.socket.sendEvent('killSession', {});
    this.socket.close();
};

session.prototype.startPing = function () {
    this.sendPings = true;
    setTimeout(this.ping, 3000);
};

session.prototype.ping = function () {
    if (!(this.sendingPings))
        return;
    this.startPing();
    this.socket.send('h');
};

session.prototype.room = function (callback) {
    var room = this.rooms[this.rooms.length - 1];

    if (!(room)) {
        callback(undefined);
        return;
    }

    room = this.getMain().rooms.filter((obj) => {
        return obj.slug === room;
    })[0];

    callback(room);
};

session.prototype.getRooms = function () {
    var _self = this;
    return this.getMain().rooms.filter((obj) => {
        return _self.rooms.contains(obj.slug);
    });
};

session.prototype.store = function () {
    var _self = this;

    if (!(this.loggedIn))
        return JSON.parse('{"avatarID":"base05","badge":"80sb01","gRole":0,"guest":true,"id":3, "language":"en","level":1,"blurb":"Guest","slug":"Party DJ","sub":0,"username":"Guest","password":"","email":"","name":"Guest","silver":false,"donator":0,"xp":0,"pp":0,"pw":false,"place":0,"settings":{"chatImages":false,"chatTimestamps":12,"emoji":true,"friendAvatarsOnly":false,"notifyDJ":true,"notifyFriendJoin":true,"notifyScore":true,"tooltips":true,"videoOnly":false},"ignores":[],"communities":[],"notifications":[],"favs":[],"playlists":[],"avatars":{"unlockall":false,"list":[]},"badges":{"unlockall":false,"list":[]},"history":[],"length":0,"dprg":100}');

    if (_self.share)
        return _self.share;

    var stores = this.getMain().storeSync.filter((obj) => {
        return obj.id === _self.accountId
    });
    var bestStore = stores[0];

    if (!(bestStore)) {
        logger.warn('No store for %s', this.accountId);
        return undefined;
    }

    return _self.share = bestStore;
};


module.exports = session;