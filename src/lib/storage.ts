// Safe JSON loader from localStorage with a typed fallback
export function load<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// Serialize and store typed value in localStorage
export function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}
