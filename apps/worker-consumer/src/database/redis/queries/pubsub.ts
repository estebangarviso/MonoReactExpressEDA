import { RedisProvider } from '../provider'

const redisProvider = new RedisProvider()

/**
 * It publish an event to the Redis database
 */
export const pubEvent = (channelName: string, message: string | Buffer) => {
  console.log('pubEvent: ', channelName, message)

  return redisProvider.publish(channelName, message)
}

/**
 * It subscribes to a channel
 */
export const subChannel = (channelName: string) => {
  console.success('Redis Subscribe to channel: ', channelName)

  return redisProvider.subscribe(channelName)
}

/**
 * Handle message from a channel
 */
export const onMessage = (
  message: string,
  callback: (channel: string, message: string) => void
) => {
  return redisProvider.onMessage(message, callback)
}

/**
 * It unsubscribes from a channel
 */
export const unsubChannel = (channelName: string) => {
  console.warn('Redis Unsubscribe from channel: ', channelName)

  return redisProvider.unsubscribe(channelName)
}
