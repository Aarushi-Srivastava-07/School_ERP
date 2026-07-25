'use strict';

/**
 * Lightweight in-memory TTL cache for the reports module.
 * Zero external dependencies — uses a plain Map with timestamps.
 * Security note: cache keys must be strictly namespaced by their effective
 * authorization scope (e.g., specific class set, or global) so users only
 * access data they are permitted to view.
 */

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Hard cap on cache entries to prevent unbounded memory growth.
// If hit, the oldest entry is evicted first.
const MAX_ENTRIES = 500;

const store = new Map();

/**
 * Get a value from the cache.
 * Returns `undefined` if the key doesn't exist or has expired.
 * @param {string} key
 * @returns {any|undefined}
 */
function get(key) {
    if (typeof key !== 'string' || !key) return undefined;

    const entry = store.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return undefined;
    }

    // Deep-clone to prevent callers from mutating cached data (cache poisoning)
    try {
        return JSON.parse(JSON.stringify(entry.value));
    } catch (err) {
        // If it can't be cloned (e.g. BigInt or circular ref), treat as cache miss
        store.delete(key);
        return undefined;
    }
}

/**
 * Set a value in the cache.
 * @param {string} key
 * @param {any} value
 * @param {number} [ttlMs] - TTL in milliseconds, defaults to 5 minutes
 */
function set(key, value, ttlMs = DEFAULT_TTL_MS) {
    if (typeof key !== 'string' || !key) return;

    let clonedValue;
    try {
        clonedValue = JSON.parse(JSON.stringify(value));
    } catch (err) {
        // Skip caching if value is not serializable
        return;
    }

    // Evict entries if we hit the size cap
    if (store.size >= MAX_ENTRIES && !store.has(key)) {
        // Opportunistic cleanup: remove expired entries first
        const now = Date.now();
        for (const [k, v] of store.entries()) {
            if (now > v.expiresAt) {
                store.delete(k);
            }
        }
        
        // If still at cap after cleanup, evict the oldest key
        if (store.size >= MAX_ENTRIES) {
            const oldestKey = store.keys().next().value;
            store.delete(oldestKey);
        }
    }

    // Deep-clone to isolate cached data from the original object reference
    store.set(key, {
        value: clonedValue,
        expiresAt: Date.now() + ttlMs,
    });
}

/**
 * Manually invalidate a cache entry.
 * @param {string} key
 */
function invalidate(key) {
    store.delete(key);
}

/**
 * Clear all cache entries. Useful for testing.
 */
function clear() {
    store.clear();
}

module.exports = { get, set, invalidate, clear };
