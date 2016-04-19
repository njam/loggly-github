var HandlerAbstract = require('./abstract');
var util = require('util');
var GitHubApi = require('github');

/**
 * @param {String} options
 * @constructor
 */
function Github(options) {
  this.api = new GitHubApi({
    version: '3.0.0',
    protocol: 'https',
    headers: {'user-agent': 'loggly-github'}
  });
  this.api.authenticate({
    type: 'oauth',
    token: options['token']
  });
}
util.inherits(Github, HandlerAbstract);

/**
 * @param {Alert} alert
 * @param {Object} options
 */
Github.prototype.handleAlert = function(alert, options) {
  var issueParams = {
    user: options['user'],
    repo: options['repo'],
    title: 'Loggly Alert: ' + alert.name,
    body: alert.searchLink + "\n\n" + alert.recentHits.join("\n")
  };
  if (options['assignee']) {
    issueParams['assignee'] = options['assignee'];
  }
  console.log('Creating GitHub issue on ' + issueParams['user'] + '/' + issueParams['repo']);
  this.api.issues.create(issueParams, function(err, result) {
    if (err) {
      console.error('Error creating GitHub issue: ' + err.message);
    }
  });
};

module.exports = Github;
