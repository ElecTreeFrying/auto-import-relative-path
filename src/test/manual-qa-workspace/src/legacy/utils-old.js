var slice = Array.prototype.slice;

function toArray(arrayLike) {
  return slice.call(arrayLike);
}

function noop() {}

function identity(value) {
  return value;
}

module.exports = {
  toArray: toArray,
  noop: noop,
  identity: identity,
};
