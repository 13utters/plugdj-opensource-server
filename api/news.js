var logger = require('./logger.js');

var ModApi = function () {};

ModApi.prototype.new = true;
ModApi.prototype.init = function (con, res, getMain) {
    this.con = con;
    this.res = res;
    this.getMain = getMain;
};

ModApi.prototype.get = function (data) {
    var getMain = this.getMain;
    
    res.send(getMain().config.news);
};

module.exports = ModApi;

