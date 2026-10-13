export type LoginPayload = {
  username: string;
  password: string;
};

export type SignupPayload = {
  username: string;
  password: string;
  email: string;
  fullName: string;
  phone?: string;
};

/** Current session as returned by GET /auth/me. Role codes are the backend enum names, e.g. "ADMIN". */
export type AuthUser = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone?: string | null;
  roles: string[];
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type VerifyOtpPayload = {
  email: string;
  otp: string;
};

export type ResetPasswordPayload = VerifyOtpPayload & {
  newPassword: string;
};
