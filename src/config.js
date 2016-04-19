var fs = require('fs');
var JsonValidator = require('jsonschema').Validator;

/**
 * @param {String} filePath
 * @returns {Object}
 * @constructor
 */
function Config(filePath) {
  var data = this.read(filePath);
  this.validate(data);
  return Object.freeze(data);
}

/**
 * @param {String} filePath
 */
Config.prototype.read = function(filePath) {
  var content = fs.readFileSync(filePath, {encoding: 'utf8'});
  return JSON.parse(content);
};

/**
 * @param {Object} data
 * @throws Error
 */
Config.prototype.validate = function(data) {
  var validator = new JsonValidator();
  var schema = {
    "type": "object",
    "properties": {
      "port": {"type": "integer", "minimum": 1},
      "secret": {"type": "string", "pattern": "^[A-Za-z0-9\-]+$"},
      "github": {
        "type": "object",
        "properties": {
          "token": {"type": "string"}
        },
        "required": ["token"]
      }
    },
    "required": ["port", "secret", "github"]
  };
  validator.validate(data, schema, {throwError: true});
};

module.exports = Config;
