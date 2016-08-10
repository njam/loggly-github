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
    server = startServer(1234, 'my-secret', handler);
  });
  afterEach(function(done) {
    server.close(done);
  });

  it('responds to POST', function(done) {
    var alert = new Alert('my-name', 'my-link', ['hit1', 'hit2']);
    var payload = {'alert_name': alert.name, 'search_link': alert.searchLink, 'recent_hits': alert.recentHits};

    request(server)
      .post('/my-secret/github/my-user/my-repo?assignee=my-assignee')
      .send(JSON.stringify(payload))
      .set('Content-Type', 'text/plain; charset=ISO-8859-1')
      .set('User-Agent', 'Apache-HttpClient/4.3.2 (java 1.5)')
      .expect(200)
      .expect('', function() {
        assert(handler.handleAlert.withArgs(alert, {
          user: 'my-user',
          repo: 'my-repo',
          assignee: 'my-assignee'
        }).calledOnce, 'handleAlert() should be called');
        done();
      });
  });

  it('can process big payloads', function(done) {
    var bigData = 'x'.repeat(200 * 1000);
    var payload = {'alert_name': 'my-name', 'search_link': 'my-link', 'recent_hits': [], 'big_data': bigData};

    request(server)
      .post('/my-secret/github/my-user/my-repo')
      .send(JSON.stringify(payload))
      .set('Content-Type', 'text/plain; charset=ISO-8859-1')
      .set('User-Agent', 'Apache-HttpClient/4.3.2 (java 1.5)')
      .expect(200, done);
  });

  it('errors on invalid payload', function(done) {
    request(server)
      .post('/my-secret/github/foo/bar')
      .send('something invalid')
      .set('Content-Type', 'text/plain; charset=ISO-8859-1')
      .expect(500)
      .expect('Internal Server Error\n', done);
  });

  it('errors on GET', function(done) {
    request(server)
      .get('/my-secret/github/foo/bar')
      .expect(404, done);
  });

  it('404 everything else', function(done) {
    request(server)
      .get('/foo/bar')
      .expect(404, done);
  });
});
