var HandlerAbstract = require('./abstract');
var util = require('util');
var GitHubApi = require('github');
var Promise = require('bluebird');

/**
 * @param {String} options
 * @param {GitHubApi} [api]
 * @constructor
 */
function Github(options, api) {
  if (!api) {
    api = new GitHubApi({
      version: '3.0.0',
      protocol: 'https',
      headers: {'user-agent': 'loggly-github'}
    });
  }
  api.authenticate({
    type: 'oauth',
    token: options['token']
  });
  this.api = api;
}
util.inherits(Github, HandlerAbstract);

/**
 * @param {Alert} alert
 * @param {Object} options
 * @returns {Promise}
 */
Github.prototype.handleAlert = function(alert, options) {
  var user = options['user'];
  var repo = options['repo'];
  var assignee = options['assignee'];
  var title = `Loggly Alert: ${alert.name}`;
  var body = this._getIssueBody(alert);

  return this._getAllOpenIssues(user, repo).then(function(issues) {
    var issue = issues.find(function(issue) {
      return issue['title'] == title || issue['body'].indexOf(title) > -1;
    });
    if (issue) {
      console.log(`Found an existing open issue (${user}/${repo}#${issue['number']}), skipping.`)
      return Promise.resolve();
    } else {
      console.log(`Creating new issue on ${user}/${repo}.`);
      return this._createIssue(user, repo, title, body, assignee);
    }
  }.bind(this));
};

/**
 * @param {String} user
 * @param {String} repo
 * @return {Promise}
 */
Github.prototype._getAllOpenIssues = function(user, repo) {
  var api = this.api;
  return new Promise(function(resolve, reject) {
    api.issues.repoIssues({
      user: user,
      repo: repo,
      state: 'open',
      per_page: 9999
    }, function(error, result) {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

/**
 * @param {String} user
 * @param {String} repo
 * @param {String} title
 * @param {String} body
 * @param {String} [assignee]
 * @return {Promise}
 */
Github.prototype._createIssue = function(user, repo, title, body, assignee) {
  var params = {
    user: user,
    repo: repo,
    title: title,
    body: body
  };
  if (assignee) {
    params['assignee'] = assignee;
  }
  var api = this.api;
  return new Promise(function(resolve, reject) {
    api.issues.create(params, function(error, result) {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

/**
 * @param {Alert} alert
 * @return {String}
 */
Github.prototype._getIssueBody = function(alert) {
  var recentHits = '';
  if (alert.recentHits.length > 0) {
    recentHits = ['```', alert.recentHits.join("\n"), '```'].join("\n");
  }
  return `${alert.searchLink}\n\n${recentHits}\n`;
};

module.exports = Github;
