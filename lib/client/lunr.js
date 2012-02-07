/*
 * lunr
 * <cam@onswipe.com>
 */

var request = require('request');

var LunrClient = function (options) {
  options = options || {};
  this.host = options.host || 'localhost';
  this.port = options.port || 6969;
}

/*
 * Construct the URL to the server
 */
LunrClient.prototype.url = function () {
  return 'http://' + this.host + ':' + this.port + '/';
}

/*
 * GET /:id
 */
LunrClient.prototype.get = function (id, cb) {
  request(this.url() + id, cb);
}

/*
 * PUT /
 */
LunrClient.prototype.put = function (doc, cb) {
  request({
    method: 'put',
    uri: this.url(),
    json: doc
  }, cb);
}

/*
 * DELETE /:id
 */
LunrClient.prototype.del = function (id, cb) {
  request({
    method: 'delete',
    uri: this.url() + id
  }, cb);
}

/*
 * GET /search/:query
 */
LunrClient.prototype.search = function (query, cb) {
  request(this.url() + 'search/' + encodeURIComponent(query), cb);
}

/*
 * GET /similar/:id
 */
LunrClient.prototype.similar = function (id, cb) {
  request(this.url() + 'similar/' + id, cb);
}

module.exports = LunrClient;
