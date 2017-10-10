var logger  = require('./../logger.js'),
    userman = require('./../../lib/userStore.js');

var ModApi = function () {};

ModApi.prototype.new = true;
ModApi.prototype.init = function (con, res, getMain) {
    this.con = con;
    this.res = res;
    this.getMain = getMain;
};

ModApi.prototype.put = ModApi.prototype.post = function (data) {
    var con = this.con;
    var session = this.con.session || {};
    var res = this.res;
    var getMain = this.getMain;
    var store = session.store();
    
    if (!(data.email && data.password && data.username)) {
        res.ends(['Missing data'], 400, 'badRequest');
        return;
    }

    if (data.email.contains("..") || data.email.contains("/")){
        res.ends(['no'], 403, 'no');
        return;
    }

    var usernameCheck = getMain().getSTO().map((obj) => {return obj.name}).contains(data.username);
    var emailCheck = getMain().getSTO().map((obj) => {return obj.email}).contains(data.email);
    
    if (usernameCheck) {
        res.ends(['Username in use'], 400, 'badRequest');
        return;
    }
    
    if (emailCheck) {
        res.ends(['Email in use'], 400, 'badRequest');
        return;
    }
    
    if (userman.createUser(data.email, data.username, data.password)) {
        res.ends(['User manager said no... reused username?'], 500, "Internal Server Error");
        return;
    }
    
    getMain().login(session, data.email, () => {
        res.ends(['Account created']);
    });
};

module.exports = ModApi;