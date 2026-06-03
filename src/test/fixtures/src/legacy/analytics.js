function track(eventName, payload) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('analytics', { detail: { eventName, payload } }));
}

module.exports = { track };
