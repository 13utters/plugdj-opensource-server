var util = require('util'),
    pathUtil = require('path'),
    fs = require('fs'),
    logger = require('./../../logger.js'),
    serve = require('./fileHandler.js');

var folderHandler = function (getMain) {
    this.getMain = getMain;
    serve = new serve(getMain);
};


folderHandler.prototype.handle = function (con, res, path, getAssetTypeFromURL) {
    var patha = util.format('./%s/%s', path, con.url.replace('/_/static/', ''));
    var pathb = util.format('./%s/%s', path, con.url.after('/'));  
        
    fs.access(pathb, fs.F_OK, (error) => {
        serve.handle(con, res, error ? patha : pathb , getAssetTypeFromURL);
    });
};


module.exports = folderHandler;