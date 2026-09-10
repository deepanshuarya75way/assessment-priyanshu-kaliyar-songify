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

const pubsub = new PubSub();

export default pubsub;
export { PubSub };


