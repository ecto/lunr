#!/usr/bin/env node
/*
 * lunr
 * spawn a cluster
 * <cam@onswipe.com>
 */

var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var optimist = require('optimist');
var argv = optimist.argv;

if (cluster.isMaster) {
  for (var i = 0; i < numCPUs; i++) {
    console.log('forking...');
    cluster.fork();
  }
  cluster.on('death', function(worker) {
    console.log('worker ' + worker.pid + ' died');
  });
} else {
  var app = require(__dirname + '/../lib/server/app.js');
  if (argv.v) {
    app.use(express.logger());
  }
  app.listen(6969);
}
