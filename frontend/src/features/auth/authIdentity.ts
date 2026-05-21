import { AUTH_CHANGED_EVENT } from "./authSession.ts";

const AUTH_USERNAME_KEY = "ec:currentUsername";
const AUTH_DISPLAY_NAME_KEY = "ec:currentDisplayName";

export function getCurrentUsername(): string {
  return sessionStorage.getItem(AUTH_USERNAME_KEY) ?? "";
}

export function getCurrentDisplayName(): string {
  return sessionStorage.getItem(AUTH_DISPLAY_NAME_KEY) ?? getCurrentUsername();
}

export function setCurrentUsername(value: string) {
  sessionStorage.setItem(AUTH_USERNAME_KEY, value);
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function setCurrentDisplayName(value: string) {
  sessionStorage.setItem(AUTH_DISPLAY_NAME_KEY, value);
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function clearCurrentUsername() {
  sessionStorage.removeItem(AUTH_USERNAME_KEY);
  sessionStorage.removeItem(AUTH_DISPLAY_NAME_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}