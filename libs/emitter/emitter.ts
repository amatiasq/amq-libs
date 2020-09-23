export function emitter<T = any>() {
  const listeners = new Set<(data: T) => void>();
  emit.subscribe = subscribe;
  return emit;

  function emit(data: T) {
    listeners.forEach(listener => listener(data));
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
