var express = require('express');
var app = express.createServer();
var config = require('./config')();
var collection = config.mongo.collection;
var natural = require('natural');
var optimist = require('optimist');
var argv = optimist.argv;

if (argv.v) app.use(express.logger());
app.use(express.bodyParser());

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

var db = require('mongojs').connect(buildMongoHost(), ['stemIndex', 'documentIndex']);

/*
 * GET /
 * Handle root calls
 */
app.get('/', function (req, res) {
  res.send('');
});

/*
 * GET /:id
 * Grab the full document from the index
 * or return an error
 */
app.get('/:id', function (req, res) {
  db.documentIndex.find({ _id: req.params.id }, function (err, results) {
    res.send(arguments);
  });
});

/*
 * PUT /
 * Insert a document into the index
 * What happens if it's already there?
 */
app.put('/', function (req, res) {
  if (!req.body || !req.body._id || !req.body.title || !req.body.content) {
    res.send('You must supply all required document variables', []);
  } else {
    // construct document index
    var di = {
      _id: req.body.id,
      t: req.body.title,
      c: req.body.content,
      ts: natural.PorterStemmer.tokenizeAndStem(req.body.title),
      cs: natural.PorterStemmer.tokenizeAndStem(req.body.content)
    }

    // Aggregate stem counts
    // Concatenate all stems, loop and increment counts
    var c = {};
    di.cs.concat(di.ts).map(function (s, i, a) {
      if (c[s]) c[s]++;
      else c[s] = 1;
    });

    Object.keys(c).map(function (s) {
      console.log(s + ': ' + c[s]);
      // see if stem index exists,
      // if so, inc di._id count
      // if not, create it,
      db.stemIndex.find({ _id: s }, function (err, stem) {
        console.log(arguments);
        if (stem[0] && stem[0]._id == s) {
          console.log('index found, incrementing');
          db.stemIndex.update({ '_id': s, 'e._id': di._id }, { '$inc': { 'e.$.count': 1 } }, console.log);
        } else {
          var si = {
            _id: di._id,
            count: c[s]
          }
          console.log('index not found, pushing');
          db.stemIndex.update({ '_id': s }, { '$push': { 'e': si } }, console.log);
        }
      });
    });
    
    // construct stem indexes
    res.send(d);
  }
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
