import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import express from 'express'
import { BASE_URL, PORT } from '../index.js'
import schemas from './schemas.js'

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Demo API',
    version: '1.0.0',
    description: 'A simple demo API'
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas
  },
  servers: [
    {
      url: `http://localhost:${PORT}/${BASE_URL}`
    }
  ]
}

const options = {
  swaggerDefinition,
  apis: ['**/*.js']
}

const swaggerDoc = swaggerJsdoc(options)
const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Demo API',
  customfavIcon: '/api-docs/favicon.ico',
  explorer: true
}

export default app => {
  console.log('Swagger enabled')
  app.use('/api-docs/favicon.ico', express.static('public/favicon.ico'))
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDoc, swaggerUiOptions)
  )
  app.use('/api-docs/swagger.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(swaggerDoc)
  })
}
