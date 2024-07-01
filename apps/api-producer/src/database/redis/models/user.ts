import { IBase } from './base'

export interface IUser extends IBase {
  firstName: string
  lastName: string
  birthDate: Date
  email: string
  password: string
  roleId: number
  secureToken: string
}
export type User = Pick<
  IUser,
  'id' | 'firstName' | 'birthDate' | 'lastName' | 'email' | 'roleId'
>

export type SignUpUser = Omit<IUser, 'id'>

export type UpdateUser = Pick<
  IUser,
  'id' | 'firstName' | 'birthDate' | 'lastName' | 'email' | 'password'
>
