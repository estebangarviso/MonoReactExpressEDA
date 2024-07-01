import { Type } from '@sinclair/typebox'

export const storeCurrencySchema = Type.Object({
  name: Type.String({ minLength: 2 }),
  symbol: Type.String({ minLength: 2 }),
  rate: Type.Number(),
  decimals: Type.Optional(Type.Number()),
  sign: Type.Optional(Type.String({ minLength: 1 })),
  isDefault: Type.Optional(Type.Boolean())
})

export const currencyIDSchema = Type.Object({
  id: Type.String({ minLength: 21, maxLength: 21 })
})
