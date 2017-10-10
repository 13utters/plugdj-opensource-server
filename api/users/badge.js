var logger = require('./../logger.js');

var ModApi = function () {};

ModApi.prototype.new = true;
ModApi.prototype.init = function (con, res, getMain) {
    this.con = con;
    this.res = res;
    this.getMain = getMain;
};

ModApi.prototype.post = ModApi.prototype.put = function (data) {
    var con = this.con;
    var session = this.con.session || {};
    var res = this.res;
    var getMain = this.getMain;
    var store = session.store();
    
    
    var ownsBadge = store.badges.list.filter((obj) => {
        return obj.id === data.id;
    }).length > -1;
    
    if (!(ownsBadge)) {
         res.ends(['You know why... fuck off'], 402, 'alex_is_a_stupid_nigger');
         return;
    }
    
    store.badge = data.id;
    
    session.utilUser().updateUser(true, false, true);
    
    res.ends([store]);
};

module.exports = ModApi;

