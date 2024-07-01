import { LogLevelDesc } from 'loglevel'

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APP_NAME: string
      PORT: string
      BASE_URL: string
      NODE_ENV: 'development' | 'production' | 'test' | 'local'
      RABBITMQ_URI: string
      REDIS_URI: string
      SALT_ROUNDS: string
      ALLOWED_ORIGINS: string
      JWT_SECRET: string
      LOG_LEVEL: LogLevelDesc
      PRODUCER_APP_NAME: string
    }
  }
}

export {}
