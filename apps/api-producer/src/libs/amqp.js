import amqp from 'amqplib'
import { RABBITMQ_URI } from '../config/index.js'

/**
 * Object to interact with RabbitMQ server.
 * Useful for publish and subscribe messages.
 */
class RabbitMQProvider {
  /**
   * Connect to RabbitMQ
   */
  async connect() {
    try {
      this._connection = await amqp.connect(RABBITMQ_URI)
      console.success('RabbitMQ connected.')
      this._channel = await this._connection.createChannel()
      console.success('RabbitMQ channel created.')
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error)
      process.exit(1)
    }
  }

  /**
   * Create queue
   *
   * @example
   * ```ts
   * rabbitmq.createQueue('queue-name')
   * ```
   */
  async createQueue(queue, options) {
    await this._channel.assertQueue(queue, options)
    console.log(`Queue ${queue} created.`)
  }

  /**
   * Publish message to queue
   *
   * @example
   * ```ts
   * rabbitmq.publishQueue('my-queue-name', '{"key": "value"}')
   * ```
   */
  publishQueue(queueName, message) {
    const result = this._channel.sendToQueue(queueName, Buffer.from(message))

    if (!result) console.error(`Failed to send message to queue ${queueName}`)
    console.log(`Message sent to queue ${queueName}`)

    return result
  }

  /**
   * Subscribe to queue
   */
  async subscribeQueue(queue, callback, options) {
    await this._channel.consume(queue, (message) => {
      if (!message) return
      const content = message.content.toString()
      callback(content)
      this._channel.ack(message)
    }, options)
  }

  /**
   * Close connection
   */
  async close() {
    await this._channel.close()
    console.warn('RabbitMQ channel closed.')
  }

  /**
   * Get instance of RabbitMQProvider
   */
  static get instance() {
    if (!this._instance) this._instance = new RabbitMQProvider()

    return this._instance
  }

  /**
   * Constructor of RabbitMQProvider
   * @private
   */
  constructor() {
    this._connection = {}
    this._channel = {}
  }
}

export default RabbitMQProvider.instance
