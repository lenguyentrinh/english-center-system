/** Landing page of each role after login. */
export function homePathForRoles(roles: string[] | undefined | null): string {
  const r = roles ?? [];
  if (r.includes("ADMIN")) return "/admin";
  if (r.some((x) => x.startsWith("TEACHER"))) return "/teacher/classes";
  if (r.includes("STUDENT")) return "/student/flashcards";
  return "/";
}

/** Short Vietnamese label for a backend role code. */
export function roleLabel(code: string): string {
  if (code === "ADMIN") return "Admin";
  if (code === "TEACHER") return "Giáo viên";
  if (code === "STUDENT") return "Học viên";
  return code;
}

/** Tag colors for a role: admin dark, teacher blue, student green. */
export function roleColors(code: string): { bg: string; fg: string } {
  if (code === "ADMIN") return { bg: "#020617", fg: "#ffffff" };
  if (code.startsWith("TEACHER")) return { bg: "#dbeafe", fg: "#1e40af" };
  return { bg: "#ecfdf5", fg: "#065f46" };
}
