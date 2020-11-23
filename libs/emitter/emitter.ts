export function emitter<T = any>() {
  const listeners = new Set<(data: T) => void>();
  emit.subscribe = subscribe;
  return emit;

  function emit(data: T) {
    // Copied to prevent modifications while it runs
    const copy = Array.from(listeners);
    copy.forEach(listener => listener(data));
    return Boolean(listeners.size);
  }

  function subscribe(listener: (data: T) => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
}

export type Emitter<T = any> = {
  (data: T): void;
  subscribe: (listener: (data: T) => void) => () => boolean;
};
