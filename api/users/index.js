var logger = require('./../logger.js');

module.exports = function(getMain, data, con, res) {
    var id = con.url.substring(con.url.lastIndexOf('/') + 1);
    
    if (id === 3) {
        res.ends([{
            avatarID: 'base05',
            badge: '80sb01',
            gRole: 0,
            id: 3,
            slug: '/',
            joined: Date.now(),
            level: 1,
            sub: false,
            blurb: 'Guest',
            username: 'Guest',
            silver: false,
            donator: false
        }]);

        return;
    }

    
    var items = getMain().storeSync.filter((store) => {
        return parseInt(store.id) === parseInt(id);
    });
    
    if (items.length === 0) {
        res.ends(['User not found'], 404);
        return;
    }

    var item = items[0];
    
    res.ends([{
        avatarID: item.avatarID,
        badge: item.badge,
        gRole: item.gRole,
        id: item.id,
        slug: item.slug,
        joined: item.joined,
        level: item.level,
        sub: item.sub,
        blurb: item.blurb,
        username: item.username,
        silver: item.silver,
        donator: item.donator
    }]);
}