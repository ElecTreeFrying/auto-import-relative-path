var pageviews = 0;

function recordPageview() {
  pageviews += 1;
  return pageviews;
}

function reset() {
  pageviews = 0;
}

module.exports.recordPageview = recordPageview;
module.exports.reset = reset;
