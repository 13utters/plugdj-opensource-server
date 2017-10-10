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
    var id = data.id || -1;


    var handled = getMain().badges.some((badge) => {
        if (badge.id === id) {
            if (badge.pp < store.pp) {
                store.pp -= badge.pp;
                store.badges.list.push(badge);
                res.ends([{
                    pp: store.pp
                }]);
                return true;
            } else {
                res.ends(['Not enough pp'], 402, 'noFunds');
                return true;
            }
        }
    });
    if (handled)
        return;

    var found = false;
    var keys = Object.keys(getMain().avatars);
    var handled = keys.some((key) => {
        var handled = getMain().avatars[key].some((avatar) => {
            if (found)
                return;
            if (avatar.product_id === id) {
                found = true;
                if (avatar.pp < store.pp) {
                    store.pp -= avatar.pp;
                    store.avatars.list.push(avatar);
                    res.ends([{
                        pp: store.pp
                    }]);
                    return true;
                } else {
                    res.ends(['Not enough pp'], 402, 'no funds');
                    return true;
                }
            }
        });
        return handled;
    });
    
    if (handled) return;
    
    res.ends(['Not found 404'], 404, 'Not found');
};

module.exports = ModApi;
