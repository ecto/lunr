#Lunr

A RESTful full-text indexer, searcher, and recommendation engine.

![lunr](http://www.panoramas.dk/moon/hasselblad.jpg)

##Install

    git clone this

##Start

    cp config-default.json config.json
    bin/start.sh

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

##License

MIT Onswipe
