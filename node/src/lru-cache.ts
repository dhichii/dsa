/**
 * A Least Recently Used (LRU) cache with Time-to-Live (TTL) support. Items are kept in the cache until they either
 * reach their TTL or the cache reaches its size and/or item limit. When the limit is exceeded, the cache evicts the
 * item that was least recently accessed (based on the timestamp of access). Items are also automatically evicted if they
 * are expired, as determined by the TTL.
 * An item is considered accessed, and its last accessed timestamp is updated, whenever `has`, `get`, or `set` is called with its key.
 *
 * Implement the LRU cache provider here and use the lru-cache.test.ts to check your implementation.
 * You're encouraged to add additional functions that make working with the cache easier for consumers.
 */

type LRUCacheProviderOptions = {
  ttl: number // Time to live in milliseconds
  itemLimit: number
}
type LRUCacheProvider<T> = {
  has: (key: string) => boolean
  get: (key: string) => T | undefined
  set: (key: string, value: T) => void
}

// TODO: Implement LRU cache provider
export function createLRUCacheProvider<T>({
  ttl,
  itemLimit,
}: LRUCacheProviderOptions): LRUCacheProvider<T> {
  const cacheKey: string[] = []
  const cache = new Map()
  const updateAccessedCache = (key: string) => {
    const data = cache.get(key)
    if (data) {
      // delete old data
      cacheKey.splice(cacheKey.indexOf(key), 1)
      cache.delete(key)

      // add new data
      data.time = new Date().getTime() + ttl
      cache.set(key, data)
      cacheKey.unshift(key)
    }
  }
  const isExpired = (key: string) => {
    const data = cache.get(key)
    if (!data) {
      return
    }

    const currTimestamp = new Date()
    if (currTimestamp >= data.time) {
      cacheKey.splice(cacheKey.indexOf(key), 1)
      cache.delete(key)

      return true
    }
  }

  return {
    has: (key: string) => {
      if (cache.has(key)) {
        if (isExpired(key)) {
          return false
        }

        updateAccessedCache(key)

        return true
      }

      return false
    },
    get: (key: string) => {
      isExpired(key)
      updateAccessedCache(key)
      const res = cache.get(key)?.value

      return res
    },
    set: (key: string, value: T) => {
      const len = cacheKey.length
      if (len === itemLimit) {
        const last = cacheKey[len-1]
        cacheKey.pop()
        cache.delete(last)
      }

      cacheKey.unshift(key)

      const data = {
        value,
        time: new Date().getTime() + ttl,
      }
      cache.set(key, data)
    },
  }
}
