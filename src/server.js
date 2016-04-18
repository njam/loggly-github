var express = require('express');
var bodyParser = require('body-parser');
var util = require('util');
var Alert = require('./alert');

/**
 * @param {Number} port
 * @param {HandlerAbstract} handler
 * @return {http.Server}
 */
var startServer = function(port, handler) {
  var app = express();
  app.use(bodyParser.text());

  app.post('/github/:user/:repo', function(req, res) {
    try {
      var data = JSON.parse(req.body);
      var alert = new Alert(data['alert_name'], data['search_link'], data['recent_hits']);
      var options = util._extend(req.params, req.query);
      handler.handleAlert(alert, options);
      res.send('')
    } catch (e) {
      console.error('Error: ' + e.message);
      res.status(500);
      res.send('Internal Server Error');
    }
  });

  return app.listen(port, function() {
    console.log('Listening on port %s', port);
  });
};

module.exports = startServer;
