import { Type } from '@sinclair/typebox'
import { ARTICLE_UNITIES_ENUM } from '../constants/article'

export const storeArticleSchema = Type.Object({
  title: Type.String(),
  shortDescription: Type.String(),
  unity: Type.Optional(Type.Enum(ARTICLE_UNITIES_ENUM)),
  qtyStock: Type.Optional(Type.Number({ minimum: 0 })),
  unitPrice: Type.Optional(Type.Number({ minimum: 0 })),
  isVirtual: Type.Optional(Type.Boolean()),
  isAvailable: Type.Optional(Type.Boolean())
})

export const articleIDSchema = Type.Object({
  id: Type.String({ minLength: 21, maxLength: 21 })
})

export const updateArticleSchema = Type.Partial(storeArticleSchema)
