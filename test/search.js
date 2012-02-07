var lunr = require('../');
var client = new lunr();
client.search('blah title', console.log);
