var GlobalNamespace = (function () {
  var privateCounter = 0;

  function increment() {
    privateCounter += 1;
    return privateCounter;
  }

  function reset() {
    privateCounter = 0;
  }

  return {
    increment: increment,
    reset: reset,
  };
})();

module.exports = GlobalNamespace;
