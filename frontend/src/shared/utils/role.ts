export function buildRolesQuery(roles?: string[]) {
  return roles && roles.length > 0 ? `?availableRoles=${encodeURIComponent(roles.join(","))}` : "";
}

/** Landing page of each role after login. */
export function homePathForRoles(roles: string[] | undefined | null): string {
  const r = roles ?? [];
  if (r.includes("ADMIN")) return "/admin/dashboard";
  if (r.some((x) => x.startsWith("TEACHER"))) return "/teacher/classes";
  if (r.includes("STUDENT")) return "/student";
  return "/";
}
