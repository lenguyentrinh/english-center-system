export function buildRolesQuery(roles?: string[]) {
  return roles && roles.length > 0 ? `?availableRoles=${encodeURIComponent(roles.join(","))}` : "";
}
