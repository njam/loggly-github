/**
 * @constructor
 */
function HandlerAbstract() {
}

/**
 * @param {Alert} alert
 * @param {Object} options
 */
HandlerAbstract.prototype.handleAlert = function(alert, options) {
  throw new Error('Not implemented');
};

module.exports = HandlerAbstract;
