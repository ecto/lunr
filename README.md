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

####PUT /:id

####DELETE /:id

####GET /search/:query

####GET /similar/:id

##License

MIT Onswipe
