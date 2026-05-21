export const AUTH_SESSION_KEY = "ec:isAuthenticated";
export const AUTH_ADMIN_KEY = "ec:isAdmin";
export const AUTH_CHANGED_EVENT = "ec:authChanged";

export function isAuthenticated(): boolean {
  return sessionStorage.getItem(AUTH_SESSION_KEY) === "1";
}

export function getAdminAccessState(): boolean | null {
  const value = sessionStorage.getItem(AUTH_ADMIN_KEY);
  if (value === null) return null;
  return value === "1";
}

export function isAdminUser(): boolean {
  return getAdminAccessState() === true;
}

export function setAdminAccessState(value: boolean) {
  sessionStorage.setItem(AUTH_ADMIN_KEY, value ? "1" : "0");
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function clearAdminAccessState() {
  sessionStorage.removeItem(AUTH_ADMIN_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function setAuthenticated(value: boolean) {
  if (value) sessionStorage.setItem(AUTH_SESSION_KEY, "1");
  else {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    sessionStorage.removeItem(AUTH_ADMIN_KEY);
  }

  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

