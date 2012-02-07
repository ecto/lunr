var lunr = require('../');
var client = new lunr();
client.put({
  _id: 'test',
  title: 'my title',
  content: 'blah blah blah'
}, console.log);
