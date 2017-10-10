var logger = require('./logger.js'),
    Room = require('./../lib/room.js');

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
    
    if (!(data.name)) {
        res.ends(['Missing name field'], 400, 'badRequest');
        return;
    }

    var slug = getSlug(data.name, getMain().rooms);
    var id = getId(getMain().rooms);

    var room = new Room(getMain, slug);
            if (store.id==3) {
            res.ends(['Not in a room'], 400, 'requestError');
            return;
            }
			
			else if (store.communities.length==10)
			{
            res.ends(['Not in a room'], 400, 'requestError');
            return;
			}
		  
			if (store.level<"3")
			{
			res.ends(['Not in a room'], 400, 'requestError');
            return;
			}
		  
    room.slug = slug;
    room.name = data.name;
    room.creator = store.username;
    room.id = id;
    room.creatorId = store.id;
    room.knownUsers.push({
        id: store.id,
        role: 5
    });

    getMain().rooms.push(room);
    store.communities.push(slug);

    res.ends([
        {
            'id': room.id,
            'name': room.name,
            'slug': room.slug
        }   
    ]);
    
    
    logger.info('New room created (%s)!', room.name);
};

ModApi.prototype.get = function (data) {
    var con = this.con;
    var session = this.con.session || {};
    var res = this.res;
    var getMain = this.getMain;

    var searchFor = con.args.q.toLowerCase() || 'plugdjall';
    var limit = con.args.limit || 4;
    var page = (con.args.page || 1) - 1;

    var keyWords = decodeURIComponent(searchFor).split(' ');
    var rooms = getMain().rooms.filter((room) => {
            if (keyWords.length === 0)
                return true;
            for (word of keyWords)
                if (/*room.name.toLowerCase().contains(word) || */(room.playing.media.title || '').toLowerCase().contains(word) || word.contains('plugdjall'))
                    return true;
            return false;
        })
        .sort(function (a, b) {
            return a.usersId.length > b.usersId.length;
        })
        .slice(page * limit, page * limit + limit)
        .map((room) => {
            return room.getSPayload(session.store())
        }).reverse();
    res.ends(rooms);
};

module.exports = ModApi;

function getId(rooms) {
    var ids = rooms.map((room) => {
        return room.id;
    });
    var id = 0;

    while (ids.contains(id))
        id++;
    return id;
};

function getSlug(name, rooms) {
    var slugs = rooms.map((room) => {
        return room.slug;
    });

    var slug = encodeURIComponent(name);

    while (slugs.contains(slug)) {
        if (!(slug.contains('-')))
            slug += '-';
        slug += Math.getRandom(0, 9).toString();
    }
    return slug;
};
