import './console.js'

/**
 * Convert ALLOWED_ORIGINS to RegExp or string if it's a valid URL
 * @param {string} value
 * @returns {string | RegExp}
 */
const handleAllowedOrigins = value => {
  try {
    if (value === '*') return value
    if (value?.startsWith('http')) return value
    const regExp = new RegExp(value)

    return regExp
  } catch (error) {
    return value
  }
}

export const BASE_URL = process.env.BASE_URL?.replace(/\/$/, '')
export const NODE_ENV = process.env.NODE_ENV
export const ENV = process.env.ENV
export const PORT = process.env.PORT
export const JWT_SECRET = process.env.JWT_SECRET
export const SALT_ROUNDS = process.env.SALT_ROUNDS
  ? +process.env.SALT_ROUNDS
  : 10
export const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS?.split(',').map(origin =>
      handleAllowedOrigins(origin)
    )
  : ['*']
export const REDIS_URI = process.env.REDIS_URI
export const REDIS_CLUSTER_NAME = process.env.REDIS_CLUSTER_NAME
export const REDIS_CLUSTER_PORT = process.env.REDIS_CLUSTER_PORT
  ? +process.env.REDIS_CLUSTER_PORT
  : 6379
export const REDIS_CLUSTER_USERNAME = process.env.REDIS_CLUSTER_USERNAME
export const REDIS_CLUSTER_PASSWORD = process.env.REDIS_CLUSTER_PASSWORD
export const REDIS_CLUSTER_ENDPOINT = process.env.REDIS_CLUSTER_ENPOINT
export const RABBITMQ_URI = process.env.RABBITMQ_URI
export const AWS_REGION = process.env.AWS_REGION
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
export const S3_BUCKET = process.env.S3_BUCKET
