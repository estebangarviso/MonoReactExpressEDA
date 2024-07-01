import { IRole } from '../database/redis/models/role'
import RolesArray from '../database/redis/seed/roles.json'
export enum ROLES {
  ADMIN = 1,
  CUSTOMER = 2
}
export const ROLES_LIST: IRole[] = RolesArray
