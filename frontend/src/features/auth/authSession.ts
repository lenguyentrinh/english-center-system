export const AUTH_SESSION_KEY = "ec:isAuthenticated";
export const AUTH_CHANGED_EVENT = "ec:authChanged";

export function isAuthenticated(): boolean {
  return sessionStorage.getItem(AUTH_SESSION_KEY) === "1";
}

export function setAuthenticated(value: boolean) {
  if (value) sessionStorage.setItem(AUTH_SESSION_KEY, "1");
  else sessionStorage.removeItem(AUTH_SESSION_KEY);

  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

