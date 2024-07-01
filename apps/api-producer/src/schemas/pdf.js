import { Type } from '@sinclair/typebox'

export const storePdfSchema = Type.Object({
  filename: Type.String(),
  content: Type.String()
})
