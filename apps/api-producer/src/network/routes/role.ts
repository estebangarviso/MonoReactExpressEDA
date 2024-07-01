import { Request, Router } from 'express'

import { storeRoleSchema } from '../../schemas/role'
import validatorCompiler from './utils/validatorCompiler'
import response from './response'
import RoleRepository from '../../database/redis/repositories/role'
import { IRole } from '../../database/redis/models/role'

type RoleRequest = Request<{ id: string }, Record<string, never>, IRole>
const RoleRouter: Router = Router()

RoleRouter.route('/v1/role').post(
  validatorCompiler(storeRoleSchema, 'body'),
  async (req: RoleRequest, res, next) => {
    const { body } = req

    try {
      const roleRepository = new RoleRepository(body)

      response({
        error: false,
        details: await roleRepository.saveRole(),
        res,
        status: 201
      })
    } catch (error) {
      next(error)
    }
  }
)

RoleRouter.route('/v1/role/:id').get(async (req: RoleRequest, res, next) => {
  const {
    params: { id }
  } = req

  try {
    const roleRepository = new RoleRepository({ id: +id })
    const role = await roleRepository.getRoleByID()
    if (!role) {
      response({
        error: true,
        details: 'Role not found',
        res,
        status: 404
      })

      return
    }
    response({
      error: false,
      details: role,
      res,
      status: 200
    })
  } catch (error) {
    next(error)
  }
})

export default RoleRouter
