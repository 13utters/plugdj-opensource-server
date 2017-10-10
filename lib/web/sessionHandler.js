var util = require('util'),
    Session = require('./../session.js'),
    logger = require('./../../logger.js');

module.exports = function (con, res, next) {
    con.token = con.cookies.token;

    if (!(hasValidToken(con))) {
        con.token = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (var i = 0; i < 1500; i++)
            con.token += possible.charAt(Math.getRandom(0, possible.length));

        var session = new Session(con.getMain, con.token);
        
        con.getMain().sessions.push(session);

        res.setHeader('Set-Cookie', util.format('token=%s; path=/; expires=%s', con.token, new Date(Date.leg_now() + 863344400000).toGMTString()));
    }

    con.session = con.getMain().sessions.filter((obj) => {
        return obj.token === con.token;
    })[0];

    next();
};


function hasValidToken(con) {
    var token = con.cookies.token;
    if (!(token))
        return false;
    return con.getMain().sessions.filter((obj) => {
        return obj.token === token
    }).length > 0;
};