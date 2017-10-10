var logger = require('./../logger.js');
var userstore = require('./../../lib/userStore.js');

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
    
    if (userstore.isValid(data.email, data.password)) {
        con.session.getRooms().forEach((room) => {
            room.updateGuestCount(false, con.session);
        });
        
        getMain().login(con.session, data.email, () => {
            res.send(['Logged in!']);
        });
    } else {
        res.ends(['Bad username/password combination'], 403, ['unauthorised']);
    }
};

module.exports = ModApi;