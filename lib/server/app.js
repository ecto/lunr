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
  db.documentIndex.remove({ _id: id });

  // Remove from stem index
  // TODO optimize this
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
  var q = natural.PorterStemmer.tokenizeAndStem(req.params.query);
  db.stemIndex.find({ '_id': { '$in': q } }, function (err, rawMatches) {
    var rawResults = {};
    var results = [];

    // Create an object of type stem => [ docs ]
    rawMatches.forEach(function (rawMatch) {
      if (!rawResults[rawMatch._id]) {
        rawResults[rawMatch._id] = rawMatch.e;
      }
    });

    // Aggregate all doc stem counts
    Object.keys(rawResults).forEach(function (stem) {
      rawResults[stem].forEach(function (doc) {
        var found = false;
        for (var i = 0; i < results.length; i++) {
          if (results[i]._id == doc._id) {
            found = i;
            break;
          }
        }
        if (typeof found != 'boolean') {
          results[found].count += doc.count;
        } else {
          results.push(doc);
        }
      });
    });

    // Sort docs by count
    results.sort(function (a, b) {
      if (a.count < b.count) return 1;
      else if (a.count > b.count) return -1;
      return 0;
    });

    res.send(results);
  });
});

/*
 * GET /similar/:id
 * Run a similarity query against the index by ID
 */
app.get('/similar/:id', function (req, res) {
  var id = req.params.id;
  // Get document stems
  db.documentIndex.find({ '_id': id }, function (err, origin) {
    origin = origin[0];
    var stems = origin.ts.concat(origin.cs);

    // Retrieve list of documents with intersecting stems
    db.stemIndex.find({ '_id': { '$in': stems } }, function (err, stemResults) {
      // stemResults is an array of stem indices,
      // each containing an array of documents
      // and their count of said stem.
      // We must reduce all documents to a single
      // sorted array of type _id => count
      var results = [];
      stemResults.forEach(function (stem) {
        stem.e.forEach(function (doc) {
          // Check for document existence within results
          var found = false;
          for (var i = 0; i < results.length; i++) {
            if (results[i]._id == doc._id) {
              found = i;
              break;
            }
          }
          if (typeof found != 'boolean') {
            results[found].count += doc.count;
          } else {
            results.push(doc);
          }
        });
      });
      res.send(results);
    });
  });
});

module.exports = app;
