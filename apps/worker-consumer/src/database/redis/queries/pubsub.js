import { RedisProvider } from '../provider.js'

const redisProvider = new RedisProvider()

/**
 * It publish an event to the Redis database
 */
export const pubEvent = (channelName, message) => {
  console.log('pubEvent: ', channelName, message)

  return redisProvider.publish(channelName, message);
}

/**
 * It subscribes to a channel
 */
export const subChannel = (channelName) => {
  console.success('Redis Subscribe to channel: ', channelName)

  return redisProvider.subscribe(channelName);
}

/**
 * Handle message from a channel
 */
export const onMessage = (
  message,
  callback
) => {
  return redisProvider.onMessage(message, callback);
}

/**
 * It unsubscribes from a channel
 */
export const unsubChannel = (channelName) => {
  console.warn('Redis Unsubscribe from channel: ', channelName)

  return redisProvider.unsubscribe(channelName);
}
