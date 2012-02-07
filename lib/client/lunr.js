/*
 * lunr
 * <cam@onswipe.com>
 */

var config = require('./config')();
var db = require('mongojs').connect(
  'username:password@example.com/mydb',
  ['mycollection']
);
