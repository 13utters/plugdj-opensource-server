var util = require('util'),
    fs = require('fs'),
    pathUtil = require('path'),
    logger = require('./../../logger.js');

var apiHandler = function (getMain) {
    this.getMain = getMain;
};

//ew
apiHandler.prototype.handle = function (con, res, json) {
    var file = util.format('./api/%s.js', con.realUrl.replace('/_/', ''));

    if (!(existsSync(file))) {
        file = removeTop(file + '/');
        while (!existsSync(file)) {   
            file = removeTop(file);
            if (checkIfRoot(file, res))
                return;
        }
    }
    
    if (checkIfRoot(file, res))
        return;
    
    runModule(file, con.json, con, res, this.getMain);
};

function removeTop(file) {
    file = file.replaceLast('/', '');
    file = file.substr(0, file.lastIndexOf('/')) + '/index.js';
    return file;
};

function checkIfRoot(file, res) {
    if (file.split('/').length === 2) {
        res.ends('no module', 404, 'no module');
        return true;
    }
};

function existsSync(path) {
    try {
        fs.accessSync(path, fs.F_OK);
        return true;
    } catch (e) {;
        return false;
    }
};

function runModule(file, data, con, res, main) {
    var Module = require(pathUtil.resolve(file));
    var module = new Module(main, data, con, res);
    if (module.new) {
        processNewModule(module, con, res);
    }
    delete module;
    delete Module;
};

function processNewModule(module, con, res) {
    var funct = module[con.method.toLowerCase()] || function () { logger.warn('%s is missing method %s', con.realUrl, con.method); res.send([], 405, 'methodNotSupported');};
    var init = module['init'] || function () { logger.warn('%s is missing the ini method', con.realUrl); };
    init(con, res, con.getMain);
    funct(con.json);
};


module.exports = apiHandler;