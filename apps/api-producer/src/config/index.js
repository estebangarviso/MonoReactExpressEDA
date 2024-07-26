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
export const RABBITMQ_URI = process.env.RABBITMQ_URI
