import { RedisProvider } from '../provider.js'

const redis = new RedisProvider('role')
const INDEXES = ['name']

/**
 * It takes a role object, creates a new RoleModel instance, saves it, and returns
 * the saved role
 *
 * @returns The savedRole is being returned.
 */
export const saveRole = async role => {
  const savedRole = await redis.set(`${role.id}`, role, INDEXES)

  return savedRole
}

/**
 * Get a role by its ID.
 *
 * @returns The first role in the array of roles.
 */
export const getRoleByID = async id => {
  const role = await redis.get(`${id}`, true)

  return role
}

/**
 * Get the role by name.
 *
 * @returns The first role in the array of roles.
 */
export const getRoleByName = async name => {
  const role = await redis.getByIndex(name)

  return role
}
