var express = require('express');
var bodyParser = require('body-parser');
var util = require('util');
var Promise = require('bluebird');
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
  app.use(bodyParser.text({limit: '10mb'}));

  app.post('/' + secret + '/github/:user/:repo', function(req, res) {
    Promise.resolve()
      .then(function() {
        var data = JSON.parse(req.body);
        return validateAlertData(data);
      })
      .then(function(alert) {
        console.log('Received alert: ' + alert.name);
        var options = util._extend(req.params, req.query);
        return handler.handleAlert(alert, options);
      })
      .then(function() {
        res.send('')
      })
      .catch(function(error) {
        console.error('Error: ' + error.message);
        res.status(500);
        res.send('Internal Server Error\n');
      });
  });

  return app.listen(port, function() {
    console.log('Listening on port %s', port);
  });
};


/**
 * @param {Object} data
 * @returns {Alert}
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
  return new Alert(data['alert_name'], data['search_link'], data['recent_hits']);
};

module.exports = startServer;
