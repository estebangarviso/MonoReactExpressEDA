// import { Request, Router } from 'express'
// import httpErrors from 'http-errors'
// import OrderRepository from '../../database/redis/repositories/order'
// import { verifyUser, verifyIsCurrentUser } from './utils/auth'
// import {
//   storeOrderSchema,
//   orderTrackingNumberSchema,
//   updateOrderSchema
// } from '../../schemas/order'
// import validatorCompiler from './utils/validatorCompiler'
// import response from './response'
// import { TBeforeSaveOrder } from 'database/redis/models/order'

// type OrderRequest = Request<
//   { id: string },
//   Record<string, never>,
//   { details: TBeforeSaveOrder['details']; receiverId: string }
// >
// type OrderPatchRequest = Request<
//   { trackingNumber: string },
//   Record<string, never>,
//   { details?: TBeforeSaveOrder['details']; total?: number; status?: string }
// >
// const OrderRouter: Router = Router()

// const NOT_ALLOWED_TO_BE_HERE = 'You are not allowed here!'

// OrderRouter.route('/v1/order').post(
//   validatorCompiler(storeOrderSchema, 'body'),
//   verifyUser(),
//   async (req: OrderRequest, res, next) => {
//     const {
//       currentUser,
//       body: { details, receiverId }
//     } = req
//     if (!currentUser) throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)
//     const { id: userId } = currentUser

//     try {
//       const orderRepository = new OrderRepository({
//         userId,
//         receiverId,
//         details
//       })

//       response({
//         error: false,
//         details: await orderRepository.saveOrder(),
//         res,
//         status: 201
//       })
//     } catch (error) {
//       next(error)
//     }
//   }
// )

// OrderRouter.route('/v1/order/:trackingNumber')
//   .get(
//     validatorCompiler(orderTrackingNumberSchema, 'params'),
//     verifyIsCurrentUser,
//     async (req, res, next) => {
//       const {
//         params: { trackingNumber }
//       } = req

//       try {
//         const orderRepository = new OrderRepository({
//           trackingNumber
//         })

//         response({
//           error: false,
//           details: await orderRepository.getOneOrder(),
//           res,
//           status: 200
//         })
//       } catch (error) {
//         next(error)
//       }
//     }
//   )
//   .patch(
//     validatorCompiler(orderTrackingNumberSchema, 'params'),
//     validatorCompiler(updateOrderSchema, 'body'),
//     verifyIsCurrentUser,
//     async (req: OrderPatchRequest, res, next) => {
//       const {
//         params: { trackingNumber },
//         body: { details, total, status }
//       } = req

//       try {
//         const orderRepository = new OrderRepository({
//           trackingNumber,
//           details,
//           total,
//           status
//         })

//         response({
//           error: false,
//           details: await orderRepository.updateOneOrder(),
//           res,
//           status: 200
//         })
//       } catch (error) {
//         next(error)
//       }
//     }
//   )

// export default OrderRouter
