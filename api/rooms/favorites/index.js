var logger = require('./../../logger.js');

module.exports = function (getMain, data, con, res) {
    var id;
    
    if (!(data)) {
        id = parseInt(con.url.substring(con.url.lastIndexOf('/') + 1));
    } else {
        id = data.id;
    }
    
    var favs = con.session.store().favs;
    
    if (favs.contains(id)) {
        favs.removeEntry(id);
    } else {
        favs.push(id);
    }
    
    res.ends([]);
};