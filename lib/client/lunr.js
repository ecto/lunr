/*
 * lunr
 * <cam@onswipe.com>
 */

var config = require('./config')();
var request = require('request');

var LunrClient = function (options) {
  options = options || {};
  this.host = options.host || 'localhost';
  this.port = options.port || 6969;
}

LunrClient.prototype.url() = function () {
  return 'http://' + this.host + ':' + this.port + '/';
}

LunrClient.prototype.get = function (id, cb) {
  request(this.url() + id, cb);
}

LunrClient.prototype.put = function (doc, cb) {
  request(this.url(), cb);
}

LunrClient.prototype.del = function (id, cb) {
  request(this.url(), cb);
}

LunrClient.prototype.search = function (query, cb) {
  request(this.url() + 'search/' + query, cb);
}

LunrClient.prototype.similar = function (id, cb) {
  request(this.url() + 'similar/' + id, cb);
}

module.exports = LunrClient;
