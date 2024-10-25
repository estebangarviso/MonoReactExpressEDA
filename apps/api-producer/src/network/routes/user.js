// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Router } from 'express'
import httpErrors from 'http-errors'
import {
  queueUserPdfSchema,
  storeUserSchema,
  updateUserSchema,
  userIDSchema,
  userLoginSchema,
  userPdfDownloadSchema
} from '../../schemas/user.js'
import validatorCompiler from './utils/validatorCompiler.js'
import {
  generateTokens,
  refreshAccessToken,
  verifyIsCurrentUser,
  verifyUser
} from './utils/auth.js'
import response from './response.js'
import UserRepository from '../../database/redis/repositories/user.js'
// import UserTransactionRepository from '../../database/redis/repositories/userTransaction'
import RabbitMQProvider from '../../libs/amqp.js'
import { AwsS3 } from '../../libs/s3.js'
import SocketEventRepository from '../../database/redis/repositories/socket-event.js'
import { PDF_QUEUE, USER_CREATE_PDF } from '@demo/common/server'
import { PDFGenerationStatus, PDF_CHANNEL } from '@demo/common'
// import { createWriteStream } from 'fs'
import { Readable } from 'stream'

const UserRouter = Router()

UserRouter.route('/v1/user').get(verifyUser(), async (req, res, next) => {
  try {
    const userRepository = new UserRepository()

    response({
      error: false,
      details: await userRepository.getAll(),
      res,
      status: 200
    })
  } catch (error) {
    next(error)
  }
})

UserRouter.route('/v1/user/profile').get(
  verifyUser(),
  async (req, res, next) => {
    try {
      const { currentUser } = req
      if (!currentUser) throw new httpErrors.Unauthorized('Unauthorized')

      const userRepository = new UserRepository({ id: currentUser.id })
      const profile = await userRepository.getByID()

      response({
        error: false,
        details: profile,
        res,
        status: 200
      })
    } catch (error) {
      next(error)
    }
  }
)

// UserRouter.route('/v1/user/balance').get(verifyUser(), async (req, res, next) => {
//   try {
//     const { currentUser } = req
//     if (!currentUser) throw new httpErrors.Unauthorized('Unauthorized')

//     const userTransactionRepository = new UserTransactionRepository({
//       userId: currentUser.id
//     })

//     const balance = await userTransactionRepository.getUserTransactionsBalance()

//     response({
//       error: false,
//       details: balance.toString(),
//       res,
//       status: 200
//     })
//   } catch (error) {
//     next(error)
//   }
// })

UserRouter.route('/v1/user/signup').post(
  validatorCompiler(storeUserSchema, 'body'),
  async (req, res, next) => {
    try {
      const { body } = req

      const userRepository = new UserRepository(body)

      const savedUser = await userRepository.save()

      response({
        error: false,
        details: savedUser,
        res,
        status: 201
      })
    } catch (error) {
      console.log('Error:', error)
      next(error)
    }
  }
)

UserRouter.route('/v1/users').get(async (req, res, next) => {
  try {
    const userRepository = new UserRepository()

    const users = await userRepository.getAll()
    response({
      error: false,
      details: users,
      res,
      status: 200
    })
  } catch (error) {
    next(error)
  }
})

UserRouter.route('/v1/user/pdf').post(
  validatorCompiler(queueUserPdfSchema, 'body'),
  async (req, res, next) => {
    try {
      const { userId } = req.body

      const payload = {
        idTask: USER_CREATE_PDF,
        details: {
          userId
        }
      }
      const result = RabbitMQProvider.publishQueue(
        PDF_QUEUE,
        JSON.stringify(payload)
      )
      if (!result)
        throw new httpErrors.InternalServerError('Error publishing message')

      try {
        const pendingData = {
          userId,
          state: PDFGenerationStatus.PENDING
        }
        const socketEventRepository = new SocketEventRepository(PDF_CHANNEL, {
          eventName: USER_CREATE_PDF,
          data: pendingData
        })

        await socketEventRepository.pub()
      } catch (error) {
        console.error('Error saving event:', error)
        throw new httpErrors.UnprocessableEntity('Error saving event')
      }

      response({
        error: false,
        details: 'Pdf generation started',
        res,
        status: 200
      })
    } catch (error) {
      next(error)
    }
  }
)

UserRouter.route('/v1/user/pdf/download').post(
  validatorCompiler(userPdfDownloadSchema, 'body'),
  async (req, res, next) => {
    try {
      // Stream the PDF file
      const userId = req.body.userId
      if (!userId)
        throw new httpErrors.BadRequest('Missing required field: userId')

      // Check if the file exists in S3
      const pdfPath = `${userId}.pdf`

      // Check Redis cache first
      const userRepository = new UserRepository({ id: userId })
      const cachedPdfBuffer = await userRepository.getPDF()
      if (cachedPdfBuffer) {
        console.log('PDF found in cache');

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${pdfPath}`);
        return res.send(cachedPdfBuffer);
      } else {
        console.log('PDF not found in cache - fetching from S3');
        const s3 = new AwsS3()
        const exists = await s3.fileExists(pdfPath)
        if (!exists) throw new httpErrors.NotFound('PDF file not found')

        // Retrieve the file from S3 as a buffer
        const s3File = await s3.getFile({ filename: pdfPath })
        const readableStream = s3File.Body?.transformToWebStream()

        if (!readableStream) throw new httpErrors.NotFound('PDF file not found')
        // Set the headers for the response
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename=${pdfPath}`)
        // Buffer the PDF content to store it in Redis
        const pdfChunks = [];
        try {
          for await (const chunk of readableStream.values()) {
            res.write(chunk);
            pdfChunks.push(chunk);
          }
          const pdfBuffer = Buffer.concat(pdfChunks);
          await userRepository.savePDF(pdfBuffer);
          res.end();
        } catch (error) {
          console.error('Error reading stream:', error);
          throw new httpErrors.InternalServerError('Error reading stream');
        }
      }
    } catch (error) {
      next(error)
    }
  }
)

UserRouter.route('/v1/user/login').post(
  validatorCompiler(userLoginSchema, 'body'),
  generateTokens(),
  async (req, res, next) => {
    try {
      const {
        accessToken,
        refreshToken,
        body: { email, password }
      } = req
      const isLoginCorrect = await new UserRepository({
        email,
        password
      }).login()

      if (isLoginCorrect)
        return response({
          error: false,
          details: {
            accessToken,
            refreshToken
          },
          res,
          status: 200
        })

      throw new httpErrors.Unauthorized('You are not registered')
    } catch (error) {
      next(error)
    }
  }
)

UserRouter.route('/v1/user/:id')
  .get(
    validatorCompiler(userIDSchema, 'params'),
    verifyIsCurrentUser(),
    async (req, res, next) => {
      try {
        const {
          params: { id: userId }
        } = req
        const userRepository = new UserRepository({ id: userId })

        response({
          error: false,
          details: await userRepository.getByID(),
          res,
          status: 200
        })
      } catch (error) {
        next(error)
      }
    }
  )
  .delete(
    validatorCompiler(userIDSchema, 'params'),
    verifyIsCurrentUser(),
    async (req, res, next) => {
      try {
        const {
          params: { id }
        } = req
        const userRepository = new UserRepository({ id })

        response({
          error: false,
          details: await userRepository.deleteByID(),
          res,
          status: 200
        })
      } catch (error) {
        next(error)
      }
    }
  )
  .patch(
    validatorCompiler(userIDSchema, 'params'),
    validatorCompiler(updateUserSchema, 'body'),
    verifyIsCurrentUser(),
    async (req, res, next) => {
      const {
        body: { firstName, lastName, email, password },
        params: { id: userId }
      } = req

      // Delete the PDF file to avoid inconsistencies
      const userRepository = new UserRepository({ id: userId })
      await userRepository.deletePDF()

      try {
        response({
          error: false,
          details: await new UserRepository({
            id: userId,
            firstName,
            lastName,
            email,
            password
          }).updateOneUser(),
          res,
          status: 200
        })
      } catch (error) {
        next(error)
      }
    }
  )

UserRouter.route('/v1/user/refreshAccessToken/:id').get(
  validatorCompiler(userIDSchema, 'params'),
  verifyIsCurrentUser(),
  refreshAccessToken(),
  (req, res, next) => {
    try {
      const { accessToken, refreshToken } = req

      response({
        error: false,
        details: {
          accessToken,
          refreshToken
        },
        res,
        status: 200
      })
    } catch (error) {
      next(error)
    }
  }
)

export default UserRouter
