import httpErrors from 'http-errors'
import { ROLES_LIST } from '../../../constants/role.js'
import { saveRole, getRoleByID, getRoleByName } from '../queries/role.js'

export default class RoleRepository {
  constructor({
    id,
    name
  }) {
    this._id = id
    this._name = name
  }

  async saveRole() {
    if (!this._id) throw new  httpErrors.BadRequest('Missing required field: id')
    if (!this._name) throw new  httpErrors.BadRequest('Missing required field: name')
    const roleNames = ROLES_LIST.map(r => r.name)
    if (!roleNames.includes(this._name))
      throw new  httpErrors.BadRequest('Role name not allowed')

    const roleExists = await getRoleByName(this._name)

    if (roleExists) throw new  httpErrors.Conflict('Role already exists')

    const role = {
      id: this._id,
      name: this._name
    }

    return await saveRole(role);
  }

  async getRoleByID() {
    if (!this._id) throw new  httpErrors.BadRequest('Missing required field: id')

    return await getRoleByID(this._id);
  }

  static async getRoleByName(name) {
    if (!name) throw new  httpErrors.BadRequest('Missing required field: name')

    return await getRoleByName(name);
  }
}
