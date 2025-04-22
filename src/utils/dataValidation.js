export function safeAccess(data, path, fallback = null) {
  if (!data) return fallback;
  return path.split('.').reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : fallback), data);
}
