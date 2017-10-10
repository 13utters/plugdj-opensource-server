var logger = require('./../logger.js');


var ModApi = function () {};

ModApi.prototype.new = true;
ModApi.prototype.init = function (con, res, getMain) {
    this.con = con;
    this.res = res;
    this.getMain = getMain;
};

ModApi.prototype.get = function (data) {
    var con = this.con;
    var session = this.con.session || {};
    var res = this.res;
    var getMain = this.getMain;
    var store = session.store();
    
    res.send([store.blurb]);;
};

ModApi.prototype.post = ModApi.prototype.put = function (data) {
    var con = this.con;
    var session = this.con.session || {};
    var res = this.res;
    var getMain = this.getMain;
    var store = session.store();
    
    if (!(data.blurb)) {
        res.ends(['Missing field'], 400, 'Bad Request');
        return;
    }
    
    store.blurb = data.blurb; 
    res.send([JSON.parse(JSON.stringify(store).replace(store.password, '[redacted]'))]);;
};

module.exports = ModApi;

