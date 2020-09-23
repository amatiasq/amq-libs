export function emitterWithChannels<U = string, T = any>() {
  const channels = new Map<U, Set<(data: T) => void>>();
  emit.subscribe = subscribe;
  return emit;

  function emit(channel: U, data: T) {
    const listeners = channels.get(channel);

    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  function subscribe(channel: U, listener: (data: T) => void) {
    const listeners = channels.get(channel) || new Set<(data: T) => void>();

    if (!listener.length) {
      channels.set(channel, listeners);
    }

    listeners.add(listener);
    return () => listeners.delete(listener);
  }
}

export type EmitterWithChannels<U = string, T = any> = {
  (channel: U, data: T): void;
  subscribe: (channel: U, listener: (data: T) => void) => () => boolean;
};
