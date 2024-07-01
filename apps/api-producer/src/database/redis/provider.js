/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import Redis from 'ioredis'
import { REDIS_URI } from '../../config/index.js'
const DELETE_PREFIX = 'del:'
const INDEX_PREFIX = 'idx:'

export class RedisProvider {
  constructor(prefix) {
    this._prefix = `${process.env.APP_NAME}${prefix ? `:${prefix}` : ''}`
    this._main = new Redis(REDIS_URI)

    this._main.on('connect', () => {
      console.success(`Redis connection established with prefix ${this._prefix}`)
    })
    this._main.on('error', error => {
      console.error(`Redis connection error with prefix ${this._prefix}:`, error)
    })

    this._sub = new Redis(REDIS_URI)
  }

  /**
   * Retrieve key
   */
  async get(key, isSerilize = false) {
    const value = await this._main.get(`${this._prefix}:${key}`)

    if (!value) return null

    return isSerilize ? JSON.parse(value) : value;
  }

  /**
   * Retrieve keys by ids
   */
  async getByIDs(ids, isSerilize = false) {
    const keys = ids.map(id => `${this._prefix}:${id}`)
    const values = await this._main.mget(keys)

    return values.map(value =>
      isSerilize && value ? JSON.parse(value) : value);
  }

  /**
   * Retrieve all keys of the same type
   */
  async getAllUnserilized(includeDeleted = false) {
    // const keys: string[] = await this._redis.keys(`${this._prefix}:*`)
    // if (includeDeleted)
    //   keys.push(
    //     ...(await this._redis.keys(`${DELETE_PREFIX}${this._prefix}:*`))
    //   )

    const promises = [this._main.keys(`${this._prefix}:*`)]
    if (includeDeleted)
      promises.push(this._main.keys(`${DELETE_PREFIX}${this._prefix}:*`))
    const resolvers = await Promise.all(promises)
    const keys = resolvers.flat()
    if (keys.length === 0) return []
    const values = await this._main.mget(keys)

    const unselizedValues = values.map(value => value && JSON.parse(value))

    return unselizedValues
  }

  /**
   * Set key
   */
  async set(key, value, indexes, options) {
    const isSerilize = typeof value !== 'string'
    const { seconds } = options || {}
    const serializedValue = isSerilize ? JSON.stringify(value) : value

    if (isSerilize && indexes)
      for (const index of indexes) {
        let field = (value)[index]
        if (typeof field !== 'string') field = String(field)
        await this._main.set(`${INDEX_PREFIX}${this._prefix}:${field}`, key)
      }

    if (seconds)
      await this._main.set(`${this._prefix}:${key}`, serializedValue, 'EX', seconds)
    else await this._main.set(`${this._prefix}:${key}`, serializedValue)

    return value
  }

  /**
   * Get record by index and fields
   */
  async getByIndex(index) {
    const key = await this._main.get(`${INDEX_PREFIX}${this._prefix}:${index}`)
    if (!key) return null
    const value = await this._main.get(`${this._prefix}:${key}`)

    return value ? JSON.parse(value) : null;
  }

  /**
   * Delete key
   */
  async del(key, soft = true) {
    if (soft)
      await this._main.rename(`${this._prefix}:${key}`, `${DELETE_PREFIX}${this._prefix}:${key}`)
    else await this._main.del(`${this._prefix}:${key}`)
  }

  /**
   * Publish message to a channel
   */
  publish(channel, message) {
    return this._main.publish(channel, message);
  }

  /**
   * Subscribe to a channel
   */
  async subscribe(channel) {
    return this._sub.subscribe(channel);
  }

  /**
   * Unsubscribe from a channel
   */
  async unsubscribe(channel) {
    return this._sub.unsubscribe(channel);
  }

  /**
   * On message
   */
  onMessage(message, callback) {
    this._sub.on(message, callback)
  }

  /**
   * Ping connection
   */
  async ping() {
    return await this._main.ping();
  }

  /**
   * Close connection
   */
  async close() {
    await this._main.quit()
  }
}
