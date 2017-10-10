 require('./logger.js');

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

     var ignores = store.ignores;

     res.send(ignores);
 };

 ModApi.prototype.post = ModApi.prototype.put = function (data) {
     var con = this.con;
     var session = this.con.session || {};
     var res = this.res;
     var getMain = this.getMain;
     var store = session.store();
     var ignores = store.ignores;

     var userToBeMuted = getMain().storeSync.filter((user) => {
         return data.id === user.id;
     }).map((obj) => {
         return {
             username: obj.username,
             id: obj.id
         };
     })[0];
     
     if (!(userToBeMuted)) {
         res.ends(['Userstore for mutee not found'], 404, 'notFound');
         return;
     }

     if (!(ignores.contains(userToBeMuted)))
         ignores.push(userToBeMuted);

     res.send(ignores);
 };

 module.exports = ModApi;