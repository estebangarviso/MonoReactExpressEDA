import { IRole } from '../models/role'
import { RedisProvider } from '../provider'

const redis = new RedisProvider('role')
const INDEXES: (keyof Partial<IRole>)[] = ['name']

/**
 * It takes a role object, creates a new RoleModel instance, saves it, and returns
 * the saved role
 *
 * @returns The savedRole is being returned.
 */
export const saveRole: (role: IRole) => Promise<IRole> = async role => {
  const savedRole = await redis.set<IRole>(`${role.id}`, role, INDEXES)

  return savedRole
}

/**
 * Get a role by its ID.
 *
 * @returns The first role in the array of roles.
 */
export const getRoleByID: (id: number) => Promise<IRole | null> = async id => {
  const role = await redis.get<IRole>(`${id}`, true)

  return role
}

/**
 * Get the role by name.
 *
 * @returns The first role in the array of roles.
 */
export const getRoleByName: (
  name: string
) => Promise<IRole | null> = async name => {
  const role = await redis.getByIndex<IRole>(name)

  return role
}
