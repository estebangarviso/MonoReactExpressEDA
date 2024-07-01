import SSERouter from './routes/sse.js'
// import articleRouter from './routes/article'
import userRouter from './routes/user.js'
// import userTransactionRouter from './routes/userTransaction'
// import orderRouter from './routes/order'
import roleRouter from './routes/role.js'
// import currencyRouter from './routes/currency'

import healthCheckRouter from './routes/healthcheck.js'
import response from './routes/response.js'
import { BASE_URL } from '../config/index.js'

const routers = [SSERouter, userRouter, roleRouter, healthCheckRouter]

const applyRoutes = (app) => {
  routers.forEach(router => app.use(`/${BASE_URL}`, router))

  // Middleware that handles errors
  app.use((error, req, res) => {
    console.error(error)
    response({
      details: error?.message || 'Forbidden',
      res,
      status: error?.status || 403,
      error: true
    })
  })
}

export default applyRoutes
