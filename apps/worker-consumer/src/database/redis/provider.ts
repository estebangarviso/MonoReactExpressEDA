/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import Redis from 'ioredis'
import { REDIS_URI } from '../../config'
const DELETE_PREFIX = 'del:'
const INDEX_PREFIX = 'idx:'
import { PRODUCER_APP_NAME } from '@demo/common'

export class RedisProvider {
  constructor(prefix?: string) {
    this._prefix = `${PRODUCER_APP_NAME}${
      prefix ? `:${prefix}` : ''
    }`
    this._main = new Redis(REDIS_URI)

    this._main.on('connect', () => {
      console.success(
        `Redis connection established with prefix ${this._prefix}`
      )
    })
    this._main.on('error', error => {
      console.error(
        `Redis connection error with prefix ${this._prefix}:`,
        error
      )
    })

    this._sub = new Redis(REDIS_URI)
  }

  /**
   * Retrieve key
   */
  public async get<V = string>(
    key: string,
    isSerilize = false
  ): Promise<V | null> {
    const value = await this._main.get(`${this._prefix}:${key}`)

    if (!value) return null

    return isSerilize ? JSON.parse(value) : value
  }

  /**
   * Retrieve keys by ids
   */
  public async getByIDs<V = string>(
    ids: string[],
    isSerilize = false
  ): Promise<V[]> {
    const keys = ids.map(id => `${this._prefix}:${id}`)
    const values = await this._main.mget(keys)

    return values.map(value =>
      isSerilize && value ? JSON.parse(value) : value
    )
  }

  /**
   * Retrieve all keys of the same type
   */
  public async getAllUnserilized<V extends object>(
    includeDeleted: boolean = false
  ): Promise<V[]> {
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

    const unselizedValues = values.map<V>(value => value && JSON.parse(value))

    return unselizedValues
  }

  /**
   * Set key
   */
  public async set<V = string>(
    key: string,
    value: V,
    indexes?: string[],
    options?: {
      seconds?: number
    }
  ): Promise<V> {
    const isSerilize = typeof value !== 'string'
    const { seconds } = options || {}
    const serializedValue = isSerilize ? JSON.stringify(value) : value

    if (isSerilize && indexes)
      for (const index of indexes) {
        let field = (value as Record<string, unknown>)[index]
        if (typeof field !== 'string') field = String(field)
        await this._main.set(
          `${INDEX_PREFIX}${this._prefix}:${field as string}`,
          key
        )
      }

    if (seconds)
      await this._main.set(
        `${this._prefix}:${key}`,
        serializedValue,
        'EX',
        seconds
      )
    else await this._main.set(`${this._prefix}:${key}`, serializedValue)

    return value
  }

  /**
   * Get record by index and fields
   */
  public async getByIndex<V extends object>(index: string): Promise<V | null> {
    const key = await this._main.get(`${INDEX_PREFIX}${this._prefix}:${index}`)
    if (!key) return null
    const value = await this._main.get(`${this._prefix}:${key}`)

    return value ? JSON.parse(value) : null
  }

  /**
   * Delete key
   */
  public async del(key: string, soft: boolean = true): Promise<void> {
    if (soft)
      await this._main.rename(
        `${this._prefix}:${key}`,
        `${DELETE_PREFIX}${this._prefix}:${key}`
      )
    else await this._main.del(`${this._prefix}:${key}`)
  }

  /**
   * Publish message to a channel
   */
  public publish(channel: string, message: string | Buffer): Promise<number> {
    return this._main.publish(channel, message)
  }

  /**
   * Subscribe to a channel
   */
  public async subscribe(channel: string) {
    return this._sub.subscribe(channel)
  }

  /**
   * Unsubscribe from a channel
   */
  public async unsubscribe(channel: string) {
    return this._sub.unsubscribe(channel)
  }

  /**
   * On message
   */
  public onMessage(
    message: string,
    callback: (channel: string, message: string) => void
  ) {
    this._sub.on(message, callback)
  }

  /**
   * Ping connection
   */
  public async ping(): Promise<'PONG'> {
    return await this._main.ping()
  }

  /**
   * Close connection
   */
  public async close(): Promise<void> {
    await this._main.quit()
  }

  private readonly _main: Redis
  private readonly _prefix: string
  private readonly _sub: Redis
}
