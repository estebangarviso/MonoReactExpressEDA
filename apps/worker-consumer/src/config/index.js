import './console.js'

export const BASE_URL = process.env.BASE_URL?.replace(/\/$/, '')
export const NODE_ENV = process.env.NODE_ENV
export const ENV = process.env.ENV
export const PORT = process.env.PORT
export const JWT_SECRET = process.env.JWT_SECRET
export const SALT_ROUNDS = process.env.SALT_ROUNDS
  ? +process.env.SALT_ROUNDS
  : 10
export const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS?.split(',')
  : ['*']
export const REDIS_URI = process.env.REDIS_URI
export const RABBITMQ_URI = process.env.RABBITMQ_URI
export const REGION = process.env.REGION
export const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID
export const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY
export const S3_BUCKET = process.env.S3_BUCKET
