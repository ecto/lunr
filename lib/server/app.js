var express = require('express');
var app = express.createServer();

app.use(express.logger());

app.get('/', function (req, res) {
  res.send('hello');
});

module.exports = app;
