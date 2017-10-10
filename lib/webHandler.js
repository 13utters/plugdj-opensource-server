var express = require('express'),
    logger  = require('./../logger.js'),
    fs      = require('fs'),
    Session = require('./session.js'),
    util    = require('util');
var https = require('https'); 


var apiHandler = require('./web/apiHandler.js'),
    fileHandler = require('./web/fileHandler.js'),
    folderHandler = require('./web/folderHandler.js'),
    sessionHandler = require('./web/sessionHandler.js');

module.exports = function (getMain) {
    apiHandler = new apiHandler(getMain);
    fileHandler = new fileHandler(getMain);
    folderHandler = new folderHandler(getMain);
	var configip = getMain().config;
	
	ipfilter = require('express-ipfilter').IpFilter;
	var ips = [configip.banip];
	
    var app = express();
    var router = express.Router();

    app.use('*', setupConnection);
    app.use('*', parseParms);
    app.use('*', sessionHandler);
    app.use('*', setupResponse);
	app.use(ipfilter(ips));
	
    app.get('/_/static/js/*', (con, res) => {
        folderHandler.handle(con, res, 'scripts', getAssetTypeFromURL);
    });

    app.get('/_/static/lib/*', (con, res) => {
        folderHandler.handle(con, res, 'scripts', getAssetTypeFromURL);
    });

    app.get('/_/static/css/*', (con, res) => {
        folderHandler.handle(con, res, 'css', getAssetTypeFromURL);
    });
	
	app.get('/_/static/fonts/*', (con, res) => {
        folderHandler.handle(con, res, 'fonts', getAssetTypeFromURL);
    });

    app.get('/_/static/*', (con, res) => {
        folderHandler.handle(con, res, 'assets', getAssetTypeFromURL);
    });
	
	app.get('/_/static/images/*', (con, res) => {
        folderHandler.handle(con, res, 'images', getAssetTypeFromURL);
    });
	
    app.get('/out/*', (con, res) => {
        folderHandler.handle(con, res, 'avatars', getAssetTypeFromURL);
    });

    app.post('/_/*', processPost);

    app.put('/_/*', processPost);

    app.delete('/_/*', processPost);

    app.use('*', (con, res) => {
        process(con, res);
    })
	
	
	
    app.listen(getMain().config.port, function () {
        logger.log('Server started!');
    });



    function process(con, res) {
        var url = con.url = con.realUrl;
        
        //Check redirects
        if (whitelistRedirect(con, res))
            return;

        if (maint(con, res))
            return;

        if (redirDash(con, res))
            return;

        if (url.contains('..'))
            return;
		


        //router
        getAssetTypeFromURL(url, function (type) {
            switch (type) {
            case 'IDK':
                fileHandler.handle(con, res, './pages/404.html', getAssetTypeFromURL);
                break;
            case 'JAVASCRIPT':
                fileHandler.handle(con, res, './scripts' + url, getAssetTypeFromURL);
                break;
            case 'STYLE':
                fileHandler.handle(con, res, './css' + url, getAssetTypeFromURL);
                break;
            case 'PROFILE':
                fileHandler.handle(con, res, './pages/profile.html', getAssetTypeFromURL);
                break;
            case 'TEAM':
                fileHandler.handle(con, res, './pages/team.html', getAssetTypeFromURL);
                break;    
            case 'JOBS':
                fileHandler.handle(con, res, './pages/jobs.html', getAssetTypeFromURL);
                break;
            case 'BA':
                fileHandler.handle(con, res, './pages/ba.html', getAssetTypeFromURL);
                break;
            case 'ABOUT':
                fileHandler.handle(con, res, './pages/about.html', getAssetTypeFromURL);
                break;    
            case 'ROOM':
                fileHandler.handle(con, res, './pages/room.html', getAssetTypeFromURL);
                break;
            case 'ROOTASSET':
                fileHandler.handle(con, res, './assets/' + url.after('/'), getAssetTypeFromURL);
                break;
            case 'MOBILE':
                fileHandler.handle(con, res, './pages/roomm.html', getAssetTypeFromURL);
                break;    
            case 'SIGNUP':
                fileHandler.handle(con, res, './pages/signup.html', getAssetTypeFromURL);
                break;
            case 'UPCOMING-EVENTS/':
                fileHandler.handle(con, res, './pages/upcoming-events.html', getAssetTypeFromURL);
                break;    
            case 'API':
                apiHandler.handle(con, res, con.json);
                break;
            case 'ASSET':
                fileHandler.handle(con, res, '.' + url.replace('_/static', 'assets'), getAssetTypeFromURL);
                break;
            case 'PAGE':
                fileHandler.handle(con, res, util.format('./pages%s.html', url), getAssetTypeFromURL);
                break;
            default:
                logger.debug(util.format('%s issued an unknown type %s', con.realUrl, type));
                break;
            }
        });


    }

    function whitelistRedirect(con, res) {
        var config = getMain().config;
		var getIps = config.ips;
		
        if (config.whitelist==true) {
            var whiteListed = con.getIps().filter((ip) => {
                return config.ips.contains(con.getBestIP());
            }).length;

            if (!whiteListed) {
                fileHandler.handle(con, res, './pages/maintenance.html', getAssetTypeFromURL);
                return true;
            }
        }
        return false;
    };

    function maint(con, res) {
        var config = getMain().config;
		
		if(config.maintenance==true)
		{
                fileHandler.handle(con, res, './pages/maintenance.html', getAssetTypeFromURL);
                return true;
		}

    };
	

    function redirDash(con, res) {
        var url = con.realUrl;
        var isHomepage = url === '/';
        var isDashboard = url === '/dashboard';
        var loggedIn = isLoggedIn(con);

        if (isHomepage) {
            if (loggedIn) {
                res.statusCode = 302;
                res.setHeader('Location', '/dashboard');
                res.end('');
            } else {
                fileHandler.handle(con, res, './pages/home.html', getAssetTypeFromURL);
            }
            return true;
        }

        if (isDashboard) {
            if (!loggedIn) {
                res.statusCode = 302;
                res.setHeader('Location', '/');
                res.end('');
            } else {
                fileHandler.handle(con, res, './pages/room.html', getAssetTypeFromURL);
            }
            return true;
        }

        return false;
    };

    //Get payload
    function processPost(con, res, next) {
        var body = undefined;
        con.on('data', function (data) {
            body = body || '' + data;
        });

        con.on('end', function () {
            try {
                con.json = JSON.parse(body || '{}');
            } catch (e) {
                res.end(JSON.stringify({
                    code: 400,
                    meta: {},
                    data: ['Bad payload (couldn\'t parse)'],
                    time: 0,
                    status: 'bad'
                }));
                return;
            }

            next();
        });
    };

    function parseParms(con, res, next) {
        con.headers.cookie.split(';').forEach((item) => {
            con.cookies[item.before('=').replace(' ', '')] = decodeURIComponent(item.after('='));
        });

        if (con.realUrl.contains('?')) {
            con.args = {};

            con.realUrl.after('?').split('&').forEach((item) => {
                con.args[item.before('=')] = decodeURIComponent(item.after('='));
            });
            
            con.realUrl = con.realUrl.before('?');
        }
        
        next();
    };

    
    function setupConnection(con, res, next) {
        con.start = Date.leg_now();
        con.headers.cookie = con.headers.cookie || '';
        con.cookies = {};
        con.realUrl = con.originalUrl ;
        res.cookies = [];
        con.getMain = getMain;

        con.getBestIP = () => {
            var ip = undefined;
            var ipHeader = con.headers['X-Forwarded-For'] ||
                con.headers['X-Real-IP'] ||
                con.headers['X-Real-Ip'];
            if (!(ipHeader)) {
                ip = con.connection.remoteAddress.after(':');
            } else if (ipHeader.contains(', ')) {
                ip = ipHeader.split(', ')[0];
            } else if (ipHeader) {
                ip = ipHeader;
            }
            return ip;
        };
        
        next();
    };
    
    function setupResponse(con, res, next) {
        res.setCookie = (key, value, length) => {
            res.cookies.push(util.format('%s=%s; path=/; expires=%s', key, value, length || new Date(Date.now() + 863344400000).toGMTString()))
        };

        res.send = (data, code, status) => {
            if (res.cookies.length)
                res.setHeader('Set-Cookie', res.cookies);

            res.setHeader('Server', 'PartyDJ!');
            res.setHeader('Content-Type', 'application/json');

            code = code || 200;
            status = status || 'ok';
            
            res.statusCode = code;
            
            res.end(JSON.stringify({
                data: data,
                status: status,
                time: Date.leg_now() - con.start
            }, 0, 4));
        };

        res.ends = res.send;
        
        next();
    };

    //util
    function isLoggedIn(con) {
        var token = con.cookies.token;
        if (!(token))
            return false;
        return getMain().sessions.filter((obj) => {
            return obj.token === token && obj.loggedIn
        }).length > 0;
    };

    function getAssetTypeFromURL(url, cb) {
        if (url.endsWith('/'))
            url = url.substring(0, url.length - 1);

        if (url.indexOf('js') > -1) {
            cb('JAVASCRIPT');
            return
        }

        if (url.contains('css')) {
            cb('STYLE');
            return;
        }
		
		if (url.contains('jpg') || url.contains('png')) {
            cb('IMAGE');
            return;
        }

        if (url.contains('_/') && !url.contains('_/static')) {
            cb('API');
            return
        }

        if (url.contains('@/')) {
            cb('PROFILE');
            return;
        }

        if (getMain().rooms.filter((obj) => {
                return url.contains(obj.slug)
            }).length) {
            cb('ROOM');
            return;
        }


        exists('.' + url.replace('_/static', 'assets'), function (found) {
            if (found) {
                cb('ASSET');
                return;
            }

            exists('./assets' + url.substring(url.lastIndexOf('/')), function (found) {
                if (found) {
                    cb('ROOTASSET');
                    return;
                }

                exists('./pages' + url + '.html', function (found) {
                    if (found) {
                        cb('PAGE');
                        return;
                    }

                    cb('IDK');
                });
            });
        });
    };

    //util
    function exists(path, callback) {
        if (!(path.startsWith('.')))
            path = '.' + path;

        fs.access(path, fs.F_OK, function (error) {
            callback(!error);
        });
    };
}