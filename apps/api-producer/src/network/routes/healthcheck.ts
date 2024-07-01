import { Router } from 'express'
import response from './response'

const HealthCheckRouter: Router = Router()

HealthCheckRouter.route('/v1/healthcheck').get((req, res, next) => {
  try {
    response({
      error: false,
      details: 'Server is OK',
      res,
      status: 200
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @openapi
 * /v1/healthcheck:
 *   get:
 *     tags:
 *       - Healthcheck
 *     summary: Healthcheck
 *     description: Healthcheck
 *     responses:
 *       200:
 *         description: Healthcheck
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/HealthcheckResponse"
 */
export default HealthCheckRouter
