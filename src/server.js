var express = require('express');
var bodyParser = require('body-parser');
var Alert = require('./alert');

/**
 * @param {Number} port
 * @param {HandlerAbstract} handler
 * @return {http.Server}
 */
var startServer = function(port, handler) {
  var app = express();
  app.use(bodyParser.text());

  app.post('/', function(req, res) {
    try {
      var data = JSON.parse(req.body);
      var alert = new Alert(data['alert_name'], data['search_link'], data['recent_hits']);
      handler.handleAlert(alert, req.query);
      res.send('')
    } catch (e) {
      console.error('Error: ' + e.message);
      res.status(500);
      res.send('Internal Server Error');
    }
  });

  var server = app.listen(port, function() {
    console.log('Listening on port %s', server.address().port);
  });

  return server;
};

module.exports = startServer;
