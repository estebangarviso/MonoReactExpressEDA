import { NODE_ENV, ALLOWED_ORIGINS } from '../config/index.js'
import express from 'express';
import compression from 'compression'
import morgan from 'morgan'
import cors from 'cors'
import { RedisProvider } from '../database/redis/provider.js'
import { RabbitMQProvider } from '../libs/amqp.js'
import { subscribeMQ } from './subscribers/index.js'

class Server {
  constructor() {
    this._app = express()
    this._rabbitmq = RabbitMQProvider.getInstance()
    this._redis = new RedisProvider()
    this.config()
  }

  config() {
    this._app.disable('x-powered-by')
    this._app.use(compression())
    this._app.use(cors({ origin: ALLOWED_ORIGINS }))
    this._app.use(express.json())
    this._app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'))
    this._app.use(express.urlencoded({ extended: false }))
    // Swagger
    // if (NODE_ENV === 'development') applySwagger(this._app) // Consumer doesn't have Swagger

    // applyRoutes(this._app) // Consumer doesn't have routes
  }

  async start() {
    try {
      await this._rabbitmq.connect()
      await subscribeMQ(this._rabbitmq)
      // this._server = this._app.listen(PORT, () => {
      //   console.success(
      //     `Server listening at http://localhost:${PORT} in ${NODE_ENV} mode`
      //   )
      // }) // Consumer doesn't need to listen
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