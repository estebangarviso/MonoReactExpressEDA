import RolesArray from '../database/redis/seed/roles.json' assert { type: "json" };
export let ROLES = ((function(ROLES) {
  ROLES[ROLES["ADMIN"] = 1] = "ADMIN";
  ROLES[ROLES["CUSTOMER"] = 2] = "CUSTOMER";
  return ROLES;
})({}));
export const ROLES_LIST = RolesArray
