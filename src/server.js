var express = require('express');
var bodyParser = require('body-parser');
var util = require('util');
var JsonValidator = require('jsonschema').Validator;
var Alert = require('./alert');

/**
 * @param {Number} port
 * @param {String} secret
 * @param {HandlerAbstract} handler
 * @return {http.Server}
 */
var startServer = function(port, secret, handler) {
  var app = express();
  app.use(bodyParser.text());

  app.post('/' + secret + '/github/:user/:repo', function(req, res) {
    try {
      var data = JSON.parse(req.body);
      validateAlertData(data);
      var alert = new Alert(data['alert_name'], data['search_link'], data['recent_hits']);
      var options = util._extend(req.params, req.query);
      console.log('Received alert: ' + alert.name);
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


/**
 * @param {Object} data
 * @throws Error
 */
var validateAlertData = function(data) {
  var validator = new JsonValidator();
  var schema = {
    "type": "object",
    "properties": {
      "alert_name": {"type": "string"},
      "search_link": {"type": "string"},
      "recent_hits": {"type": "array", "items": {"type": "string"}}
    },
    "required": ["alert_name", "search_link", "recent_hits"]
  };
  validator.validate(data, schema, {throwError: true});
};

module.exports = startServer;
