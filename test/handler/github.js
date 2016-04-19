require('./../test_helper');
var assert = require('chai').assert;
var sinon = require('sinon');
var GitHubApi = require('github');
var Alert = require('../../src/alert');
var Github = require('../../src/handler/github');

describe('github', function() {
  var api = {
    authenticate: new Function()
  };
  var alert = new Alert('my-alert', 'my-link', []);
  var options = {
    user: 'my-user',
    repo: 'my-repo',
    assignee: 'my-assignee'
  };

  it('authenticates against the API', function() {
    var apiMock = sinon.mock(api);
    apiMock.expects('authenticate').once().withArgs({type: 'oauth', token: 'foo'});

    new Github({token: 'foo'}, api);
    apiMock.verify();
  });

  it('creates a new issue', function() {
    var github = new Github({token: 'foo'}, api);
    var success = Symbol('success');

    sinon.mock(github).expects('_getAllOpenIssues').once().returns(Promise.resolve([]));
    sinon.mock(github).expects('_createIssue').once()
      .withArgs('my-user', 'my-repo', 'Loggly Alert: my-alert').returns(Promise.resolve(success));

    return github.handleAlert(alert, options).then(function(result) {
      assert.equal(success, result);
    });
  });

  it('skips issue creation if an existing open issue is found', function() {
    var github = new Github({token: 'foo'}, api);
    var success = Symbol('success');

    sinon.mock(github).expects('_getAllOpenIssues').once().returns(Promise.resolve([
      {title: 'Loggly Alert: my-alert', body: 'my-body', number: 123}
    ]));
    sinon.mock(github).expects('_createIssue').never();

    return github.handleAlert(alert, options);
  });
});
