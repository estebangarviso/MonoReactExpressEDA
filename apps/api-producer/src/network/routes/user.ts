// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Router } from 'express'
import httpErrors from 'http-errors'
import {
  queueUserPdfSchema,
  storeUserSchema,
  updateUserSchema,
  userIDSchema,
  userLoginSchema,
  userPdfDownloadSchema
} from '../../schemas/user'
import validatorCompiler from './utils/validatorCompiler'
import {
  generateTokens,
  refreshAccessToken,
  verifyIsCurrentUser,
  verifyUser
} from './utils/auth'
import response from './response'
import UserRepository from '../../database/redis/repositories/user'
import { IUser } from '../../database/redis/models/user'
// import UserTransactionRepository from '../../database/redis/repositories/userTransaction'
import { RabbitMQProvider } from '../../libs/amqp'
import { USER_CREATE_PDF, PDF_QUEUE } from '../../constants/user'
import SocketEventRepository from '../../database/redis/repositories/socket-event'
import {
  PDFGenerationStatus,
  PDF_CHANNEL,
  UserPDFSocketEvent,
  TQueueUserPdf,
  IQueueUserPdfDetails
} from '@demo/common'
import path from 'path'
import fs from 'fs'
import { PDFS_DIR } from '../../constants/paths'

type SignUpRequest = Request<
  Record<string, never>,
  Record<string, never>,
  {
    firstName: string
    lastName: string
    birthDate: Date
    email: string
    password: string
    roleId?: number
  }
>
type UserPatchRequest = Request<
  { id: string },
  Record<string, never>,
  {
    firstName: string
    lastName: string
    email: string
    password: string
  }
>
type QueueUserPdfRequest = Request<
  Record<string, never>,
  Record<string, never>,
  IQueueUserPdfDetails
>

type UserPdfDownloadRequest = Request<
  Record<string, never>,
  Record<string, never>,
  { userId: string }
>

const UserRouter: Router = Router()

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
  async (req: SignUpRequest, res, next) => {
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
  async (req: QueueUserPdfRequest, res, next) => {
    try {
      const { userId } = req.body

      const payload: TQueueUserPdf = {
        idTask: USER_CREATE_PDF,
        details: {
          userId
        }
      }
      const result = RabbitMQProvider.getInstance().publishQueue(
        PDF_QUEUE,
        JSON.stringify(payload)
      )
      if (!result)
        throw new httpErrors.InternalServerError('Error publishing message')

      try {
        const pendingdata: UserPDFSocketEvent = {
          userId,
          state: PDFGenerationStatus.PENDING
        }
        const socketEventRepository = new SocketEventRepository(PDF_CHANNEL, {
          eventName: USER_CREATE_PDF,
          data: pendingdata
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
  (req: UserPdfDownloadRequest, res) => {
    // Stream the PDF file
    const userId = req.body.userId
    if (!userId)
      throw new httpErrors.BadRequest('Missing required field: userId')
    const pdfPath = path.join(PDFS_DIR, `${userId}.pdf`)

    if (!fs.existsSync(pdfPath))
      throw new httpErrors.NotFound('PDF file not found')

    res.download(pdfPath, `user-${userId}.pdf`, err => {
      if (err) throw new httpErrors.InternalServerError('Error downloading PDF')
    })

    // Delete the PDF file (optional)
    // fs.unlink(pdfPath, err => {
    //   if (err) console.error('Error deleting PDF file:', err)
    // })
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
    async (req: UserPatchRequest, res, next) => {
      const {
        body: { firstName, lastName, email, password },
        params: { id: userId }
      } = req

      try {
        response({
          error: false,
          details: (await new UserRepository({
            id: userId,
            firstName,
            lastName,
            email,
            password
          }).updateOneUser()) as IUser,
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
