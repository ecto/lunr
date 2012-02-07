var lunr = require('../');
var client = new lunr();
client.similar('test', console.log);
