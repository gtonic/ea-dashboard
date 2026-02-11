// Minimal Vue mock for testing store and router logic
// Provides reactive() as a pass-through and watch() as a no-op

export function reactive(obj) {
  return obj
}

export function watch() {
  // no-op in tests
}

export function computed(fn) {
  return { get value() { return fn() } }
}

export function toRaw(obj) {
  return obj
}
