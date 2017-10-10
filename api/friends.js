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

    res.send(store.friends.list);
};
ModApi.prototype.post = ModApi.prototype.put = function (data) {
    var con = this.con;
    var session = this.con.session || {};
    var res = this.res;
    var getMain = this.getMain;
    var store = session.store();
    
    if (data.id==store.id) {
        res.ends(['cannot Friend Self'], 403, 'cannotFriendSelf');
        return;
    }
    
    store.id = data.id; 
    res.send([JSON.parse(JSON.stringify(store).replace(store.password, '[redacted]'))]);;
};

module.exports = ModApi;