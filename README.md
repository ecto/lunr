#Lunr

A RESTful full-text indexer, searcher, and recommendation engine.

![lunr](http://www.panoramas.dk/moon/hasselblad.jpg)

##Install

    npm install lunr -g

##Start

    npm explore lunr
    cp config-default.json config.json
    lunrd start

##Configuration

All configuration is stored in `config.json`. This is the default configuration:

````json
{
  "port": 6969,
  "cache": false,
  "ttl": null,
  "mongo": {
    "host": "localhost",
    "port": 27017,
    "db": "test",
    "collection": "test"
  },
  "redis": {
    "host": "localhost",
    "post": 6379
  }
}
````

##How it works

When a PUT command is issued against `lunrd`, it is put into a FIFO queue (stored in Redis).
This allows Lunr nodes to be load balanced. Each will process keys as it is able too,
responding to other commands first (GETs and DELETEs take precedence over PUTs).

Every piece of content PUT into Lunr will be stemmed and subsequestly indexed.
Lunr will store all documents in Mongo with the following schema:

````json
{
  "_id": "myID",
  "t": "My Title",
  "c": "blah blah blah",
  "ts": [ "title" ],
  "cs": [ "blah", "blah", "blah" ]
}
````

It will then index the terms in a separate collection:

````json
{
  "_id": "blah",
  "e": [
    {
      "_id": "myID",
      "count": 3
    }
  ]
}
````

If the `cache` config variable is set to `true`, GET requests will be cached to Redis -
either for `ttl` milliseconds or 5 minutes.

##API

####GET /:id

Grab the full document from the index.

    curl http://localhost:6969/myID

####PUT /:id

Insert a document into the index.

    curl -i -X PUT \
    -d '{title: "my title", content: "blah blah blah"}' \
    http://localhost/myID


####DELETE /:id

Unindex a document.

    curl -i -X DELETE http://localhost:6969/myID


####GET /search/:query

Run a lexical similarity query against the index.

    curl http://localhost:6969/search/hello+world

####GET /similar/:id

Run a similarity query against the index by ID.

    curl http://localhost:6969/similary/myID

##Node convenience wrapper client

    npm install lunr


````javascript
var lunr = require('lunr');

var client = new lunr({
  host: 'localhost',
  port: 6969
});

client.get('myID', console.log);
client.put(doc, console.log);
client.del('myID', console.log);
client.search('blah blah', console.log);
client.similar('myID', console.log);
````

##License

MIT Onswipe
