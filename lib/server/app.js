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
    // TODO sanitize content and title
    // construct document index
    var di = {
      _id: req.body._id,
      t: req.body.title,
      c: req.body.content,
      ts: natural.PorterStemmer.tokenizeAndStem(req.body.title),
      cs: natural.PorterStemmer.tokenizeAndStem(req.body.content)
    }
    db.documentIndex.save(di);

    // Aggregate stem counts
    // Concatenate all stems, loop and increment counts
    var c = {};
    di.cs.concat(di.ts).map(function (s, i, a) {
      if (c[s]) c[s]++;
      else c[s] = 1;
    });

    // Update stem indexes
    Object.keys(c).map(function (s) {
      // Construct stem index
      var si = {
        _id: di._id,
        count: c[s]
      }

      // Search for existing stem index
      db.stemIndex.find({ _id: s }, function (err, stem) {
        // Does the stem index exist?
        if (stem[0]) {
          // Is the document included in the stem index?
          var found = false;
          for (var i = 0; i < stem[0].e.length; i++) {
            if (stem[0].e[i]._id == di._id) {
              found = true;
              break;
            }
          }

          if (found) { // This will only happen on document update
            // Document found in stem index, update it
            db.stemIndex.update({ '_id': s, 'e._id': di._id }, { '$set': { 'e.$.count': c[s] } });
          } else {
            // Document not found in stem index, push it
            db.stemIndex.update({ '_id': s }, { '$push': { 'e': si } });
          }
        } else {
          // Stem index not found, create it
          db.stemIndex.save({ '_id': s, 'e': [ si ] });
        }
      });
    });
    
    // Respond with constructed document index
    res.send(di);
  }
});

/*
 * DELETE /:id
 * Unindex a document
 */
app.del('/:id', function (req, res) {
  var id = req.params.id;

  // Remove from document index
  db.documentIndex.remove({ _id: id }, console.log);

  // Remove from stem index
  db.stemIndex.find({ 'e._id': id }, function (err, stems) {
    stems.forEach(function (stem) {
      if (stem.e.length == 1) {
        db.stemIndex.remove({ '_id': stem._id });
      } else {
        db.stemIndex.update({ '_id': stem._id }, { '$pull': { 'e': { '_id': id } } });
      }
    });
    res.send(null, []);
  });
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
