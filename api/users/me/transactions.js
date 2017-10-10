var logger = require('./../../logger.js');
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
    
    // /pdj/api/users/me/transactions.js 
    res.send([{          
        'id': 'Under development Party DJ',      
        'item': 'admin01',     
        'pp': 555555555,         
        'cash': 55555555,         
        'timestamp': Date.now(), 
        'type': 'avatar'     
    }]);
};

module.exports = ModApi;