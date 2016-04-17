/**
 * @param {String} name
 * @param {String} searchLink
 * @param {String[]} recentHits
 * @constructor
 */
function Alert(name, searchLink, recentHits) {
  this.name = name;
  this.searchLink = searchLink;
  this.recentHits = recentHits;
}

module.exports = Alert;
