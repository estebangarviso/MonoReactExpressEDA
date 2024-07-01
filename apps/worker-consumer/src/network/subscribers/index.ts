import { RabbitMQProvider } from '../../libs/amqp'
import { subscribeUserPdf } from './user'

export const subscribeMQ = async (rabbitmq: RabbitMQProvider) => {
  await subscribeUserPdf(rabbitmq)
}
