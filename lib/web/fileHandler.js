var util = require('util'),
     fs = require('fs'),
    pathUtil = require('path'),
    logger = require('./../../logger.js');

var fileHandler = function (getMain) {
    this.getMain = getMain;
};

var back = './../.';

fileHandler.prototype.handle = function (con, res, path, getAssetTypeFromURL)  {
    var _this = this;
    var config = _this.getMain().config;

    processCType(res, path);
    
    getAssetTypeFromURL(path, function (type) {
        var utf = type === 'JAVASCRIPT' || type === 'STYLE' || type === 'PAGE' || path.contains('html');
        if (utf) {
            serveUTFAsset(res, path, config);
        } else {
            serveAsset(res, path, config);
        }
    }); 
};


function serveUTFAsset(res, path, config) {
    exists(path, function (found) {
        if (found) {
            fs.readFile(path, function (err, data) {
                res.end(replacePlaceHolders(data.toString('utf8'), config));
            });
        } else {
            res.statusCode = 404;
            serveUTFAsset(res, './pages/404.html', config);
        }
    });
};

function serveAsset(res, path, config) {
    exists(path, function (found) {
        if (found) {
            fs.readFile(path, function (err, data) {
                res.end(data);
            });
        } else {
            serveUTFAsset(res, './pages/404.html', config);
        }
    });
};

function replacePlaceHolders(payload, conf) {
    return payload.replaceAll('[DATE/TIME]', Date.now())
        .replaceAll('[MOTD]', conf.motd)
        .replaceAll('[VERSION]', conf.version)
        .replaceAll('[CARD:FBTWREPLACEMENT]', conf.tw)
        .replaceAll('[THEME:FRAMEW]', conf.theme.framew)
        .replaceAll('[THEME:FRAMEH]', conf.theme.frameh)
        .replaceAll('[THEME:PLAYER]', conf.theme.player)
        .replaceAll('[THEME:BACKGROUND]', conf.theme.background)
        .replaceAll('[APIYT]', conf.APIYT)
        .replaceAll('[HOST]', conf.host)
        .replaceAll('[CDN]', conf.cdn)
        .replaceAll('[SERVER]', conf.server)
        .replaceAll('[SOCKETPORT]', conf.sport)
		.replaceAll('[OGDESC]', conf.ogdesc)
		.replaceAll('[OGIMAGE]', conf.ogimage)
		.replaceAll('[FB]', conf.fb)
		.replaceAll('[TWITTER]', conf.twitter)
		.replaceAll('[KEYWORDS]', conf.keywords)
		.replaceAll('[LOCALE]', conf.locale)
		.replaceAll('[ICON]', conf.icon)	
		.replaceAll('[TWUSERNAME]', conf.twusername)
		.replaceAll('[BACKGROUND]', conf.background)
		.replaceAll('[FRAME]', conf.frame)
		.replaceAll('[APIRECAPTCHA]', conf.APIRECAPTCHA)
		.replaceAll('[ROOM]', name);
};

function exists(path, callback) {
    fs.access(path, fs.F_OK, function (error) {
        callback(!error);
    });
};

//Add the content type header
function processCType(response, url) {
    switch (url.contains('.') ? url.substring(url.lastIndexOf('.') + 1) : '') {
    case 'js':
        response.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
        break;
    case 'css':
        response.setHeader('Content-Type', 'text/css; charset=UTF-8');
        break;
    case 'html':
        response.setHeader('Content-Type', 'text/html; charset=UTF-8');
        break;
    case 'jpeg':
        response.setHeader('Content-Type', 'image/jpeg');
        break;
    case 'jpg':
        response.setHeader('Content-Type', 'image/jpg');
        break;
    case 'png':
        response.setHeader('Content-Type', 'image/png');
        break;
    default:

        break;
    }
};


module.exports = fileHandler;