// utils/cache.js
// Simple in-memory cache (for production, use Redis)

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const getCache = (key) => {
  const item = cache.get(key);
  if (!item) return null;
  
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  
  return item.data;
};

export const setCache = (key, data, ttl = CACHE_TTL) => {
  cache.set(key, {
    data,
    expiry: Date.now() + ttl,
  });
};

export const clearCache = (pattern = null) => {
  if (!pattern) {
    cache.clear();
    return;
  }
  
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, item] of cache.entries()) {
    if (now > item.expiry) {
      cache.delete(key);
    }
  }
}, 60 * 1000); // Cleanup every minute

