import { NODE_ENV, PORT, ALLOWED_ORIGINS } from '../config'
import express, { Express } from 'express'
import compression from 'compression'
import morgan from 'morgan'
import cors from 'cors'
import { IncomingMessage, Server as HttpServer, ServerResponse } from 'http'
import { RedisProvider } from '../database/redis/provider'
import { RabbitMQProvider } from '../libs/amqp'
import applyRoutes from './router'
import applySwagger from '../config/swagger'
// import { subscribeMQ } from './subscribers'

class Server {
  private _app: Express
  private _server?: HttpServer<typeof IncomingMessage, typeof ServerResponse>
  private _rabbitmq: RabbitMQProvider
  private _redis: RedisProvider

  constructor() {
    this._app = express()
    this._rabbitmq = RabbitMQProvider.getInstance()
    this._redis = new RedisProvider()
    this.config()
  }

  private config() {
    this._app.disable('x-powered-by')
    this._app.use(compression())
    this._app.use(cors({ origin: ALLOWED_ORIGINS }))
    this._app.use(express.json())
    this._app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'))
    this._app.use(express.urlencoded({ extended: false }))
    // Swagger
    if (NODE_ENV === 'development') applySwagger(this._app)

    applyRoutes(this._app)
  }

  async start() {
    try {
      await this._rabbitmq.connect()
      // await subscribeMQ(this._rabbitmq)
      this._server = this._app.listen(PORT, () => {
        console.success(
          `Server listening at http://localhost:${PORT} in ${NODE_ENV} mode`
        )
      })
    } catch (error) {
      console.error(error)
    }
  }

  async stop() {
    try {
      console.warn('Server is shutting down...')
      this._server?.closeAllConnections()
      await this._redis.close()
      await this._rabbitmq.close()
      this._server?.close()

      console.success('Server has been shut down.')
    } catch (error) {
      console.error(error)
    }
  }
}

const server = new Server()

export default server
