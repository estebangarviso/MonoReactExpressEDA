import amqp from 'amqplib'
import { RABBITMQ_URI } from '../config'

/**
 * Object to interact with RabbitMQ server.
 * Useful for publish and subscribe messages.
 */
export class RabbitMQProvider {
  /**
   * Connect to RabbitMQ
   */
  public async connect(): Promise<void> {
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
  public async createQueue(
    queue: string,
    options?: amqp.Options.AssertQueue | undefined
  ): Promise<void> {
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
  public publishQueue(queueName: string, message: string): boolean {
    const result = this._channel.sendToQueue(queueName, Buffer.from(message))

    if (!result) console.error(`Failed to send message to queue ${queueName}`)
    console.log(`Message sent to queue ${queueName}`)

    return result
  }

  /**
   * Subscribe to queue
   */
  public async subscribeQueue(
    queue: string,
    callback: (msg: string) => void,
    options?: amqp.Options.Consume
  ): Promise<void> {
    await this._channel.consume(
      queue,
      (message: amqp.ConsumeMessage | null) => {
        if (!message) return
        const content = message.content.toString()
        callback(content)
        this._channel.ack(message)
      },
      options
    )
  }

  /**
   * Close connection
   */
  public async close(): Promise<void> {
    await this._channel.close()
    console.warn('RabbitMQ channel closed.')
  }

  /**
   * Get instance of RabbitMQProvider
   */
  public static getInstance(): RabbitMQProvider {
    if (!this._instance) this._instance = new RabbitMQProvider()

    return this._instance
  }

  private _connection: amqp.Connection
  private _channel: amqp.Channel
  private static _instance: RabbitMQProvider

  /**
   * Constructor of RabbitMQProvider
   * @private
   */
  private constructor() {
    this._connection = {} as amqp.Connection
    this._channel = {} as amqp.Channel
  }
}
