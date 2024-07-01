import { Application, Response, Request } from 'express'
import SSERouter from './routes/sse'
// import articleRouter from './routes/article'
import userRouter from './routes/user'
// import userTransactionRouter from './routes/userTransaction'
// import orderRouter from './routes/order'
import roleRouter from './routes/role'
// import currencyRouter from './routes/currency'

import healthCheckRouter from './routes/healthcheck'
import response from './routes/response'
import { BASE_URL } from 'config'

const routers = [SSERouter, userRouter, roleRouter, healthCheckRouter]

const applyRoutes = (app: Application) => {
  routers.forEach(router => app.use(`/${BASE_URL}`, router))

  // Middleware that handles errors
  app.use(
    (error: TypeError & { status: number }, req: Request, res: Response) => {
      console.error(error)
      response({
        details: error?.message || 'Forbidden',
        res,
        status: error?.status || 403,
        error: true
      })
    }
  )
}

export default applyRoutes
