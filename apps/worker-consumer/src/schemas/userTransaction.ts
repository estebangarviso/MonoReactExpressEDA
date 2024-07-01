import { Type } from '@sinclair/typebox'

export const storeUserTransactionSchema = Type.Object({
  receiverId: Type.String(),
  amount: Type.Number()
})

export const userTransactionIDSchema = Type.Object({
  transferId: Type.String({ minLength: 21, maxLength: 21 })
})

export const realUserTransactionIDSchema = Type.Object({
  _id: Type.String({ minLength: 24, maxLength: 24 })
})

export const userTransactionSecureTokenSchema = Type.Object({
  secureToken: Type.String({ minLength: 33, maxLength: 33 })
})
