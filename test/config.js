var assert = require('chai').assert;
var fs = require('fs');
var tmp = require('tmp');
var Config = require('../src/config');

describe('config', function() {
  var path;
  beforeEach(function() {
    path = tmp.fileSync().name;
  });

  it('reads, parses and returns a valid config', function() {
    var data = {
      port: 1234,
      secret: 'my-secret',
      github: {
        token: 'foo'
      }
    };
    fs.writeFileSync(path, JSON.stringify(data));

    var config = new Config(path);
    assert.deepEqual(config, data);
  });

  it('fails on invalid data', function() {
    var data = {
      foo: 12
    };
    fs.writeFileSync(path, JSON.stringify(data));

    assert.throws(function() {
      new Config(path);
    });
  });

});
