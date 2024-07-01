import { BadRequest, Conflict } from 'http-errors'
import { ROLES_LIST } from '../../../constants/role'
import { saveRole, getRoleByID, getRoleByName } from '../queries/role'
import { IRole } from '../models/role'

export default class RoleRepository {
  private _id?: number
  private _name?: string

  constructor({ id, name }: Partial<IRole>) {
    this._id = id
    this._name = name
  }

  async saveRole() {
    if (!this._id) throw new BadRequest('Missing required field: id')
    if (!this._name) throw new BadRequest('Missing required field: name')
    const roleNames = ROLES_LIST.map(r => r.name)
    if (!roleNames.includes(this._name))
      throw new BadRequest('Role name not allowed')

    const roleExists = await getRoleByName(this._name)

    if (roleExists) throw new Conflict('Role already exists')

    const role: IRole = {
      id: this._id,
      name: this._name
    }

    return await saveRole(role)
  }

  async getRoleByID() {
    if (!this._id) throw new BadRequest('Missing required field: id')

    return await getRoleByID(this._id)
  }

  static async getRoleByName(name: string) {
    if (!name) throw new BadRequest('Missing required field: name')

    return await getRoleByName(name)
  }
}
