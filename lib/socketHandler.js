var express         = require('express'),
    logger          = require('./../logger.js'),
    util            = require('util'),
    sanitizeHtml    = require('sanitize-html'),
    http            = require('http');

var WebSocketServer = require('websocket').server;

var disinfectConfig = {
    allowedTags: ['blockquote', 'b', 'i', 'strong', 'em', 'strike', 'code'],
    selfClosing: ['img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta'],
    allowedSchemes: ['http', 'https'],
    allowedSchemesByTag: {}
};

module.exports = function (getMain) {
    var server = http.createServer(function (request, response) {
        response.writeHead(404);
        response.end();
    });
	
    var ports = process.env.PORT || 8080;
    server.listen(ports, function () {
        logger.log('WebSocket server started');
    });

    wsServer = new WebSocketServer({
        httpServer: server,
        autoAcceptsocketections: false
    });
    
    wsServer.on('request', function (req) {
        var socket = req.accept('echo-protocol', req.origin);
        socket.session = undefined;
                
        socket.sendEvent = (type, payload, room) => {
            var p = {a: type, p: payload, s: room || 'dashboard'};
            if ((!(room)) && (socket.session.rooms.length > 0))
                p.s = socket.session.rooms[0];
            socket.send(JSON.stringify([p]));
        };
        
        socket.on('gpayload', (data) => {
            try {
                var json = JSON.parse(data);
                var payload = {
                    type: json.a,
                    payload: json.p
                };
                
                switch (payload.type) {
                    case 'auth': 
                        var session = getMain().sessions.filter((obj) => {
                            return obj.token === payload.payload
                        })[0];
                        
                        if (!(session))
                            return;
                        
                        socket.session = session;
                        
                        if (session.socket) 
                            session.stop();
                        
                        session.startPing();
                        session.socket = socket;
                        
                        socket.sendEvent('ack', 1, 'dashboard');
                        
                        break;
                    case "chat":
                        if (!(socket.session)) 
                            return;
                        if (!(socket.session.loggedIn))
                            return;
                        if (payload.payload.replaceAll(' ', '') === '')
                            return;
                        socket.session.getRooms().forEach((room) => {
                            var message = sanitizeHtml(payload.payload,
                                                 disinfectConfig);
                            room.sendMessage(message, socket.session.store());
                        })
                        break;
                    default:
                        logger.debug('Didn\'t process %s', payload.type);
                        break;
                }
                var msg;
			        try {
				        msg = JSON.parse(data);
			    } catch(e) {}
			
			    var store = socket.session.store();    
			
			    if( msg.m == 'sys') {
		            if (store.gRole >= 5){
		                socket.session.getRooms().forEach((room) => {
                            room.sys(msg.d);
                        })
			        }
			    }
            } catch (e) {
                logger.warn(e.stack);
            }
        });
        
        socket.on('message', (message) => {
            if (message.type === 'utf8')
                socket.emit('gpayload', message.utf8Data);
        });

        socket.on('error',(reasonCode) => {
            if (reasonCode.toString().contains('write after end')) return;
            logger.warn(reasonCode);
        });

        socket.on('close', (reasonCode, description) => {
            logger.log(util.format('Peer %s dissocketected for %s with code %s', socket.remoteAddress, description, reasonCode));

            if (!(socket.session))
                return;
            
            socket.session.getRooms().forEach((room) => {
                if (socket.session.loggedIn) {
                    room.leave(socket.session.accountId);
                } else {
                    room.updateGuestCount(false, socket.session);
                }
            });
        });
    });
}
