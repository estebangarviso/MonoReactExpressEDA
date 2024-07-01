// import { Request, Router } from 'express'
// import httpErrors from 'http-errors'
// import UserTransactionRepository from '../../database/redis/repositories/userTransaction'
// import { verifyByRole, verifyIsCurrentUser, verifyUser } from './utils/auth'
// import {
//   storeUserTransactionSchema,
//   userTransactionIDSchema,
//   userTransactionSecureTokenSchema,
//   realUserTransactionIDSchema
// } from '../../schemas/userTransaction'
// import validatorCompiler from './utils/validatorCompiler'
// import response from './response'
// import { userIDSchema } from '../../schemas/user'

// type TransationRequest = Request<
//   { id: string },
//   Record<string, never>,
//   { receiverId: string; amount: number }
// >
// type TransationVerifyRequest = Request<
//   { secureToken: string },
//   Record<string, never>,
//   { _id: string }
// >
// const TransactionRouter: Router = Router()

// const NOT_ALLOWED_TO_BE_HERE = 'You are not allowed here!'

// TransactionRouter.route('/transfer/user/:id')
//   .get(
//     validatorCompiler(userIDSchema, 'params'),
//     verifyIsCurrentUser(),
//     async (req, res, next) => {
//       try {
//         const {
//           currentUser,
//           params: { id: userId }
//         } = req
//         if (!currentUser)
//           throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)
//         if (currentUser.id !== userId)
//           throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)

//         const userTransactionRepository = new UserTransactionRepository({
//           userId
//         })

//         response({
//           error: false,
//           details: await userTransactionRepository.getAllUserTransactions(),
//           res,
//           status: 200
//         })
//       } catch (error) {
//         next(error)
//       }
//     }
//   )
//   .post(
//     validatorCompiler(storeUserTransactionSchema, 'body'),
//     validatorCompiler(userIDSchema, 'params'),
//     verifyIsCurrentUser(),
//     async (req: TransationRequest, res, next) => {
//       try {
//         const {
//           currentUser,
//           body: { receiverId, amount },
//           params: { id: userId }
//         } = req
//         if (!currentUser)
//           throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)
//         if (currentUser.id !== userId)
//           throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)

//         const userTransactionRepository = new UserTransactionRepository({
//           userId,
//           receiverId,
//           amount
//         })

//         response({
//           error: false,
//           details: await userTransactionRepository.saveUserTransaction(),
//           res,
//           status: 201
//         })
//       } catch (error) {
//         next(error)
//       }
//     }
//   )

// TransactionRouter.route('/transfer/:transferId/user/:id').get(
//   validatorCompiler(userTransactionIDSchema, 'params'),
//   verifyUser(),
//   async (req, res, next) => {
//     try {
//       const {
//         currentUser,
//         params: { id: userId, transferId }
//       } = req

//       if (!currentUser)
//         throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)
//       const userTransactionRepository = new UserTransactionRepository({
//         transferId
//       })
//       const userTransaction =
//         await userTransactionRepository.getUserTransactionByID()

//       await userTransaction.populate('userId')
//       await userTransaction.populate('receiverId')
//       if (
//         currentUser.id !== userId ||
//         currentUser.id !== String(userTransaction.userId.id) ||
//         currentUser.id !== String(userTransaction.receiverId.id)
//       )
//         throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)

//       userTransaction.depopulate('userId')
//       userTransaction.depopulate('receiverId')

//       response({
//         error: false,
//         details: userTransaction,
//         res,
//         status: 200
//       })
//     } catch (error) {
//       next(error)
//     }
//   }
// )

// TransactionRouter.route('/transfer/owner/:id').get(
//   validatorCompiler(userIDSchema, 'params'),
//   verifyUser(),
//   async (req, res, next) => {
//     try {
//       const {
//         currentUser,
//         params: { id: receiverId }
//       } = req
//       if (!currentUser)
//         throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)
//       if (currentUser.id !== receiverId)
//         throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)

//       const userTransactionRepository = new UserTransactionRepository({
//         receiverId
//       })
//       const userTransactions =
//         await userTransactionRepository.getAllUserTransactionsByReceiverId()

//       response({
//         error: false,
//         details: userTransactions,
//         res,
//         status: 200
//       })
//     } catch (error) {
//       next(error)
//     }
//   }
// )

// TransactionRouter.route('/transfer/verify/:secureToken').patch(
//   validatorCompiler(userTransactionSecureTokenSchema, 'params'),
//   validatorCompiler(realUserTransactionIDSchema, 'body'),
//   verifyByRole('admin'),
//   async (req: TransationVerifyRequest, res, next) => {
//     try {
//       const {
//         currentUser,
//         body: { _id },
//         params: { secureToken }
//       } = req
//       if (!currentUser)
//         throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)

//       const userTransactionRepository = new UserTransactionRepository({
//         secureToken,
//         id: _id,
//         receiverId: currentUser.id
//       })
//       const verifiedTransaction =
//         await userTransactionRepository.verifyUserTransaction()

//       response({
//         error: false,
//         details: verifiedTransaction,
//         res,
//         status: 200
//       })
//     } catch (error) {
//       next(error)
//     }
//   }
// )

// export default TransactionRouter
