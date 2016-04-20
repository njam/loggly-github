var assert = require('chai').assert;
var sinon = require('sinon');
var Promise = require('bluebird');
var Alert = require('../../src/alert');
var Github = require('../../src/handler/github');

describe('github', function() {
  var api = {
    authenticate: new Function()
  };
  var alert = new Alert('my-alert', 'my-link', ['line1', 'line2']);
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
    var title = 'Loggly Alert: my-alert';
    var body = "my-link\n\n```\nline1\nline2\n```\n";

    var getAllOpenIssuesMock = sinon.mock(github).expects('_getAllOpenIssues').once().returns(Promise.resolve([]));
    var createIssueMock = sinon.mock(github).expects('_createIssue').once()
      .withArgs('my-user', 'my-repo', title, body).returns(Promise.resolve());

    var handleAlertPromise = github.handleAlert(alert, options).then(function() {
      getAllOpenIssuesMock.verify();
      createIssueMock.verify();
    });
    return handleAlertPromise.should.be.fulfilled
  });

  it('skips issue creation if an existing open issue is found', function() {
    var github = new Github({token: 'foo'}, api);
    var success = Symbol('success');

    var getAllOpenIssuesMock = sinon.mock(github).expects('_getAllOpenIssues').once().returns(Promise.resolve([
      {title: 'Loggly Alert: my-alert', body: 'my-body', number: 123}
    ]));
    var createIssueMock = sinon.mock(github).expects('_createIssue').never();

    var handleAlertPromise = github.handleAlert(alert, options).then(function() {
      getAllOpenIssuesMock.verify();
      createIssueMock.verify();
    });
    return handleAlertPromise.should.be.fulfilled
  });
});
