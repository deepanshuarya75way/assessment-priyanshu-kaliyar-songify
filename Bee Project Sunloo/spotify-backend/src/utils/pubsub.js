class PubSub {
  constructor() {
    this._subscribers = {};
  }

  subscribe(event, callback) {
    if (!event || typeof callback !== 'function') return () => {};
    if (!this._subscribers[event]) {
      this._subscribers[event] = new Set();
    }
    this._subscribers[event].add(callback);
    return () => {
      this._subscribers[event]?.delete?.(callback);
    };
  }

  publish(event, data) {
    const listeners = this._subscribers[event];
    if (!listeners || listeners.size === 0) return;
    listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (err) {
        console.error(`PubSub listener error for ${event}:`, err);
      }
    });
  }
}

// Demo usage for documentation/testing purposes
const demoPubSub = new PubSub();

demoPubSub.subscribe('now-playing', (payload) => {
  console.log('[PubSub Demo] Now Playing:', payload);
});

demoPubSub.publish('now-playing', { song: 'Lost Stars', artist: 'Adam Levine' });

export default PubSub;


