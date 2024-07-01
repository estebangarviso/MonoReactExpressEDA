import { ORDER_STATUS } from '../../../constants/order'

export interface IOrder {
  trackingNumber: string
  userTransactionId: string
  userId: string
  currencyId: string
  receiverId: string
  currencyRate: number
  total: number
  details: {
    articleId: string
    unitPrice: number
    quantity: number
  }[]
  status: ORDER_STATUS
}
