var logger = require('./../../logger.js');

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
    
    var slugs = getMain().rooms.map((room) => {return room.slug});
    var slug = con.url.substring(con.url.lastIndexOf('/') + 1);
    
    while (slugs.contains(slug)) {
        if (!(slug.contains('-')))
            slug += '-';
        slug += Math.getRandom(0, 9).toString();
    }

    res.ends([{slug: slug}]);
    session.room((room) => { 
        if (!(room)) {
            res.ends(['Not in a room'], 400, 'requestError');
            return;
        }
        
}


module.exports = ModApi;