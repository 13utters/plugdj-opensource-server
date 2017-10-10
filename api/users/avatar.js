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
    
    
    var ownsAvatar = store.avatars.list.filter((obj) => {
        return obj.product_id === data.id
    }).length > -1;
    
    if (!(ownsAvatar)) {
         res.ends(['You know why... fuck off'], 402, 'alex_is_a_stupid_nigger');
         return;
    }
    
    store.avatarID = data.id;
    
    session.utilUser().updateUser(true, true);
      
    res.send([store]);
};

module.exports = ModApi;

