import bcrypt from 'bcrypt'
import { SALT_ROUNDS } from '../config'
import { nanoid } from 'nanoid'

/**
 * It takes a string and returns a hashed string.
 *
 * @param str - The string to hash.
 * @returns A promise that resolves to a hashed string.
 */
export const hashPassword = (str: string): Promise<string> => {
  return bcrypt.hash(str, SALT_ROUNDS)
}

/**
 * Compares a string with a hashed string.
 * @param str - The string to compare.
 * @param hashedStr - The hashed string to compare.
 * @returns A promise that resolves with a boolean indicating if the strings match.
 */
export const comparePassword = (str: string, hashedStr: string) => {
  return bcrypt.compare(str, hashedStr)
}

/**
 * Retrieves a unique id
 */
export const getUniqueID = () => {
  return nanoid()
}
