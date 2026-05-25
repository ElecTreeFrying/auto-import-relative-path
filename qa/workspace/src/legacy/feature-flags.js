const flags = {
  newCheckout: false,
  betaDashboard: false,
  experimentalSearch: true,
};

exports.isEnabled = function isEnabled(flag) {
  return Boolean(flags[flag]);
};

exports.enable = function enable(flag) {
  flags[flag] = true;
};
