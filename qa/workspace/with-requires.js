const analytics = require('./src/legacy/analytics');
const featureFlags = require('./src/legacy/feature-flags');
var legacyTracker = require('./src/legacy/tracker');

module.exports = { analytics, featureFlags, legacyTracker };
