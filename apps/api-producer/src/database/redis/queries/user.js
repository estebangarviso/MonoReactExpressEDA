import { getUniqueID } from '../../../libs/crypto.js'
import { RedisProvider } from '../provider.js'

const redis = new RedisProvider('user')
const INDEXES = ['email']

/**
 * It saves a user to the database
 *
 * @returns A promise that resolves to the saved user
 */
export const createUser = async user => {
  const id = getUniqueID()
  const savedUser = await redis.set(id, { id, ...user }, INDEXES)

  return savedUser
}

/**
 * It gets a user by its ID
 *
 * @returns found user or null
 */
export const getUserByID = async id => {
  const user = await redis.get(id, true)

  return user
}

/**
 * It gets all users
 *
 * @returns found users
 */
export const getAllUsers = async () => {
  const users = await redis.getAllUnserilized()

  return users
}

/**
 * It removes a user by its ID
 *
 * @returns found user
 */
export const removeUserByID = async id => {
  const user = await redis.get(id, true)
  await redis.del(id, false)

  return user
}

// TODO: update role if necessary
/**
 * It updates a user by its ID
 *
 * @returns updated user
 */
export const updateOneUser = async updateUser => {
  const userId = updateUser.id
  const currentUser = await redis.get(userId, true)

  if (!currentUser) return null

  const joinedUser = {
    ...currentUser,
    ...updateUser
  }

  const userUpdated = await redis.set(userId, joinedUser)

  return userUpdated
}

/**
 * It returns the first user in the database that matches the email
 *
 * @param email The email of the user to find
 * @returns found user or null
 */
export const getOneUserByEmail = async email => {
  const user = await redis.getByIndex(email)

  return user
}
