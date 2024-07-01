/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { JWT_SECRET } from '../../../config/index.js'

import jwt from 'jsonwebtoken';
import httpErrors from 'http-errors'

import UserRepository from '../../../database/redis/repositories/user.js'
import RoleRepository from '../../../database/redis/repositories/role.js'

const NOT_ALLOWED_TO_BE_HERE = 'You are not allowed here!'

const getToken = authorization => {
  if (!authorization) throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)

  const [tokenType, token] = authorization.split(' ')

  if (tokenType !== 'Bearer')
    throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)

  return token
}

const validateUserPayload = payload => {
  const { email, password, ...rest } = payload

  if (!email) throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)

  if (!password) throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)

  if (Object.keys(rest).length !== 0)
    throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)

  return { email, password }
}

const handleError = (error, next) => {
  console.error('error', error)

  if (error instanceof jwt.TokenExpiredError)
    return next(new httpErrors.Unauthorized('Session expired!'));

  if (error instanceof httpErrors.Unauthorized) return next(error);

  return next(new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE));
}

export const generateTokens = () => {
  return (req, res, next) => {
    const {
      body: { email, password }
    } = req

    const payload = { email, password }
    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '10min'
    })
    const refreshToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '1h'
    })

    req.accessToken = accessToken
    req.refreshToken = refreshToken
    next()
  };
}

export const verifyUser = () => {
  return async (req, res, next) => {
    try {
      const {
        headers: { authorization }
      } = req
      if (!authorization)
        throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)
      const token = getToken(authorization)
      const payload = jwt.verify(token, JWT_SECRET)
      const { email, password } = validateUserPayload(payload)
      const user = await new UserRepository({ email, password }).login()
      const isLoginCorrect = Boolean(user)

      if (isLoginCorrect) {
        req.currentUser = {
          id: user.id
        }

        return next();
      }

      return next(new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE));
    } catch (error) {
      return handleError(error, next);
    }
  };
}

export const verifyByRole = roleName => {
  return async (req, res, next) => {
    try {
      const {
        headers: { authorization }
      } = req
      if (!authorization)
        throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)
      const token = getToken(authorization)
      const payload = jwt.verify(token, JWT_SECRET)
      const { email, password } = validateUserPayload(payload)
      const user = await new UserRepository({ email, password }).login()
      const isLoginCorrect = Boolean(user)

      if (isLoginCorrect) {
        const userRoleId = user?.roleId
        if (!userRoleId)
          throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)
        const role = await RoleRepository.getRoleByName(roleName)
        if (!role) throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)
        const isRoleAllowed = String(role.id) === String(userRoleId)

        if (isRoleAllowed) {
          req.currentUser = {
            id: user.id
          }

          return next();
        }
      }

      return next(new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE));
    } catch (error) {
      return handleError(error, next);
    }
  };
}

export const verifyIsCurrentUser = () => {
  return async (req, _res, next) => {
    try {
      const {
        params: { id: userId },
        headers: { authorization }
      } = req
      if (!authorization)
        throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)
      const token = getToken(authorization)
      const payload = jwt.verify(token, JWT_SECRET)
      const { email, password } = validateUserPayload(payload)
      const user = await new UserRepository({ email, password }).login()
      const isLoginCorrect = Boolean(user)

      if (isLoginCorrect && user.id === userId) {
        req.currentUser = {
          id: user.id
        }

        return next();
      }

      return next(new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE));
    } catch (error) {
      return handleError(error, next);
    }
  };
}

export const refreshAccessToken = () => {
  return async (req, res, next) => {
    try {
      const {
        params: { id: userId },
        headers: { authorization }
      } = req
      if (!authorization)
        throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)
      const token = getToken(authorization)
      const payload = jwt.verify(token, JWT_SECRET)
      const { email, password } = validateUserPayload(payload)
      const user = await new UserRepository({ email, password }).login()
      const isLoginCorrect = Boolean(user)

      if (!(isLoginCorrect && user.id === userId))
        throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)

      const accessToken = jwt.sign({ email, password }, JWT_SECRET, {
        expiresIn: '10min'
      })

      req.accessToken = accessToken
      req.refreshToken = token
      next()
    } catch (error) {
      return handleError(error, next);
    }
  };
}
