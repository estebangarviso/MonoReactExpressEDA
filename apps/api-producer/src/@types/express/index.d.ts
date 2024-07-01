import express from 'express'
import { JwtPayload } from 'jsonwebtoken'
export default {}

declare global {
  namespace Express {
    interface Request {
      currentUser?: {
        id: string
      }
      accessToken?: string
      refreshToken?: string
    }
  }
}
