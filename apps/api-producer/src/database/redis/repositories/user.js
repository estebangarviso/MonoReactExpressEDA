import httpErrors from 'http-errors'
import { nanoid } from 'nanoid'

import RoleRepository from './role.js'
import { hashPassword, comparePassword } from '../../../libs/crypto.js'
import {
  getUserByID,
  createUser,
  getAllUsers,
  removeUserByID,
  updateOneUser,
  getOneUserByEmail
} from '../queries/user.js'
import { ROLES } from '../../../constants/role.js'

export default class UserRepository {
  // Make optional to add constructor params
  constructor(
    args = {}
  ) {
    const {
      id = '',
      firstName = '',
      lastName = '',
      birthDate = new Date(),
      email = '',
      password = '',
      roleId = ROLES.CUSTOMER
    } = args
    this._id = id
    this._firstName = firstName
    this._lastName = lastName
    this._birthDate = birthDate
    this._email = email
    this._password = password
    this._roleId = roleId
  }

  async verifyExistance() {
    if (!this._id)
      throw new httpErrors.BadRequest('Missing required field: userId')

    const user = await getUserByID(this._id)

    if (!user) throw new httpErrors.NotFound('User not found')

    return user
  }

  async save() {
    if (!this._firstName)
      throw new httpErrors.BadRequest('Missing required field: firstName')

    if (!this._lastName)
      throw new httpErrors.BadRequest('Missing required field: lastName')

    if (!this._email)
      throw new httpErrors.BadRequest('Missing required field: email')

    const emailExists = await getOneUserByEmail(this._email)
    if (emailExists) throw new httpErrors.BadRequest('Email already exists')

    if (!this._password)
      throw new httpErrors.BadRequest('Missing required field: password')

    if (!this._roleId)
      throw new httpErrors.BadRequest('Missing required field: roleId')

    const password = await hashPassword(this._password)
    const roleRepository = new RoleRepository({
      id: this._roleId
    })
    const role = await roleRepository.getRoleByID()
    if (!role)
      throw new httpErrors.BadRequest('The requested role does not exists')

    const user = {
      firstName: this._firstName,
      lastName: this._lastName,
      birthDate: this._birthDate,
      email: this._email,
      password,
      roleId: role.id,
      secureToken: nanoid(33)
    }

    console.log(
      'User to save:',
      user,
      'Role ID:',
      this._roleId,
      'Role:',
      role,
      'Role ID type:',
      typeof role.id,
      'Role type:',
      typeof role
    )

    const savedUser = await createUser(user)

    console.log('User saved:', savedUser)

    return savedUser
  }

  async getByID() {
    if (!this._id)
      throw new httpErrors.BadRequest('Missing required field: userId')

    const user = await getUserByID(this._id)

    if (!user)
      throw new httpErrors.NotFound('The requested user does not exists')

    return user
  }

  async getAll() {
    const unserilizedUsers = await getAllUsers()

    const safetyUsers = unserilizedUsers.map(user => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, secureToken, ...rest } = user

      return rest
    })

    return safetyUsers
  }

  async deleteByID() {
    if (!this._id)
      throw new httpErrors.BadRequest('Missing required field: userId')

    const user = await removeUserByID(this._id)

    if (!user)
      throw new httpErrors.NotFound('The requested user does not exists')

    return user
  }

  async updateOneUser() {
    if (!this._id)
      throw new httpErrors.BadRequest('Missing required field: userId')

    const user = {
      id: this._id,
      firstName: this._firstName,
      lastName: this._lastName,
      email: this._email
    }

    const updatePassword = !!this._password

    if (updatePassword) user.password = await hashPassword(this._password)

    return await updateOneUser(user);
  }

  async login() {
    if (!this._email)
      throw new httpErrors.BadRequest('Missing required field: email')

    if (!this._password)
      throw new httpErrors.BadRequest('Missing required field: password')

    const user = await getOneUserByEmail(this._email)

    if (!user) throw new httpErrors.BadRequest('Bad credentials')

    const { password: hash } = user
    const result = await comparePassword(this._password, hash)

    if (result) throw new httpErrors.BadRequest('Bad credentials')

    return user
  }
}
