require('./test_helper');
var request = require('supertest');
var assert = require('chai').assert;
var sinon = require('sinon');
var Alert = require('../src/alert');
var startServer = require('../src/server');
var HandlerAbstract = require('../src/handler/abstract');

describe('server', function() {
  var server, handler;
  beforeEach(function() {
    handler = sinon.createStubInstance(HandlerAbstract);
    server = startServer(1234, handler);
  });
  afterEach(function(done) {
    server.close(done);
  });

  it('responds to POST', function(done) {
    var alert = new Alert('my-name', 'my-link', ['foo', 'bar']);
    var payload = {'alert_name': alert.name, 'search_link': alert.searchLink, 'recent_hits': alert.recentHits};

    request(server)
      .post('/?foo=12')
      .send(JSON.stringify(payload))
      .set('Content-Type', 'text/plain; charset=ISO-8859-1')
      .set('User-Agent', 'Apache-HttpClient/4.3.2 (java 1.5)')
      .expect(200)
      .expect('', function() {
        assert(handler.handleAlert.withArgs(alert, {foo: '12'}).calledOnce);
        done();
      });
  });

  it('errors on invalid payload', function(done) {
    var payload = {'alert_name': 'my-name', 'alert_description': 'my-desc'};

    request(server)
      .post('/')
      .send('something invalid')
      .set('Content-Type', 'text/plain; charset=ISO-8859-1')
      .expect(500)
      .expect('Internal Server Error', done);
  });

  it('errors on GET', function(done) {
    request(server)
      .get('/')
      .expect(404, done);
  });

  it('404 everything else', function(done) {
    request(server)
      .get('/foo/bar')
      .expect(404, done);
  });
});
