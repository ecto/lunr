var express = require('express');
var app = express.createServer();
var config = require('./config')();
var collection = config.mongo.collection;
var optimist = require('optimist');
var argv = optimist.argv;

if (argv.v) app.use(express.logger());

function buildMongoHost () {
  var mh = '';
  var mc = config.mongo;
  if (mc.user && mc.pass) {
    mh += mc.user + ':' + mc.pass + '@';
  }
  mh += mc.host;
  mh += ':' + (mc.port || 6969);
  mh += '/' + mc.database
  return mh;  
}

var db = require('mongojs').connect(buildMongoHost(), [collection])[collection];

/*
 * GET /:id
 * Grab the full document from the index
 * or return an error
 */
app.get('/:id', function (req, res) {
  db.find({}, function () {
    console.log(arguments);
    res.send('hi');
  });
});

/*
 * PUT /:id
 * Insert a document into the index
 * What happens if it's already there?
 */
app.put('/:id', function (req, res) {

});

/*
 * DELETE /:id
 * Unindex a document
 */
app.del('/:id', function (req, res) {

});

/*
 * GET /search/:query
 * Run a lexical similarity query against the index
 */
app.get('/search/:query', function (req, res) {

});

/*
 * GET /similar/:id
 * Run a similarity query against the index by ID
 */
app.get('/similar/:id', function (req, res) {

});

module.exports = app;
