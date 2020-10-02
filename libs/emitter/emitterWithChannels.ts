export function emitterWithChannels<U = string, T = any>() {
  const channels = new Map<U, Set<(data: T) => void>>();
  emit.subscribe = subscribe;
  return emit;

  function emit(channel: U, data: T) {
    const listeners = channels.get(channel);

    if (!listeners) {
      return false;
    }

    listeners.forEach(listener => listener(data));
    return Boolean(listeners.size);
  }

  function subscribe(channel: U, listener: (data: T) => void) {
    const listeners = channels.get(channel) || new Set<(data: T) => void>();

    if (!listeners.size) {
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
