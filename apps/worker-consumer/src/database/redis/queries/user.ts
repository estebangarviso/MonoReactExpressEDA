import { getUniqueID } from '../../../libs/crypto'
import { IUser, SignUpUser, UpdateUser, User } from '../models/user'
import { RedisProvider } from '../provider'

const redis = new RedisProvider('user')
const INDEXES: (keyof Partial<IUser>)[] = ['email']

/**
 * It saves a user to the database
 *
 * @returns A promise that resolves to the saved user
 */
export const createUser: (user: SignUpUser) => Promise<User> = async user => {
  const id = getUniqueID()
  const savedUser = await redis.set<User>(id, { id, ...user }, INDEXES)

  return savedUser
}

/**
 * It gets a user by its ID
 *
 * @returns found user or null
 */
export const getUserByID: (id: string) => Promise<IUser | null> = async id => {
  const user = await redis.get<IUser>(id, true)

  return user
}

/**
 * It gets all users
 *
 * @returns found users
 */
export const getAllUsers: () => Promise<IUser[]> = async () => {
  const users = await redis.getAllUnserilized<IUser>()

  return users
}

/**
 * It removes a user by its ID
 *
 * @returns found user
 */
export const removeUserByID: (
  id: string
) => Promise<IUser | null> = async id => {
  const user = await redis.get<IUser>(id, true)
  await redis.del(id, false)

  return user
}

// TODO: update role if necessary
/**
 * It updates a user by its ID
 *
 * @returns updated user
 */
export const updateOneUser: (
  updateUser: UpdateUser
) => Promise<IUser | null> = async updateUser => {
  const userId = updateUser.id
  const currentUser = await redis.get<IUser>(userId, true)

  if (!currentUser) return null

  const joinedUser: IUser = {
    ...currentUser,
    ...updateUser
  }

  const userUpdated = await redis.set<IUser>(userId, joinedUser)

  return userUpdated
}

/**
 * It returns the first user in the database that matches the email
 *
 * @param email The email of the user to find
 * @returns found user or null
 */
export const getOneUserByEmail: (
  email: string
) => Promise<IUser | null> = async email => {
  const user = await redis.getByIndex<IUser>(email)

  return user
}
