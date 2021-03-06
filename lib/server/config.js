/*
 * lunr
 * config loader
 * <cam@onswipe.com>
 */

var fs = require('fs');

module.exports = function () {
  var config;
  try {
    config = JSON.parse(
      fs.readFileSync(__dirname + '/../../config.json')
    );
  } catch (e) {
    config = JSON.parse(
      fs.readFileSync(__dirname + '/../../config-default.json')
    );
  }
  return config;
}
