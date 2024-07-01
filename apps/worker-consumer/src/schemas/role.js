import { Type } from '@sinclair/typebox'

export const storeRoleSchema = Type.Object({
  name: Type.String({ minLength: 2 }),
  id: Type.Integer()
})
