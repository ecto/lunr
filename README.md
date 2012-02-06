#Lunr

A RESTful full-text indexer, searcher, and recommendation engine.

![lunr](http://www.panoramas.dk/moon/hasselblad.jpg)

##Install

    git clone this

##Start

    ./bin/start.sh

##Configuration

All configuration is stored in `config.json`. 

````json
{
  port: 6969,
  chache: false,
  mongo: {
    host: 'localhost',
    port: 27017
  },
  redis: {
    host: 'localhost',
    post: 6379
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
