import { subscribeUserPdf } from './user.js'

export const subscribeMQ = async (rabbitmq) => {
  await subscribeUserPdf(rabbitmq)
}
