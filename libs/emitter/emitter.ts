export function emitter<T = any>() {
  const listeners = new Set<(data: T) => void>();
  subscribe.emit = emit;
  return subscribe;

  function emit(data: T) {
    listeners.forEach(listener => listener(data));
  }

  function subscribe(listener: (data: T) => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
}
