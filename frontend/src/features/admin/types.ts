export type UserStatus = "ACTIVE" | "INACTIVE" | "LOCKED";

/** Backend role code. Only ADMIN / TEACHER / STUDENT are used by the app; teacher specialties are categories. */
export type RoleCode = string;

export type RoleResponse = {
  id: string;
  code: RoleCode;
  description: string | null;
  active: boolean;
};

export type UserSummaryResponse = {
  id: string;
  username: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  status: UserStatus | null;
  /** The user's role codes (currently always exactly one). */
  roles?: string[];
  createdAt: string | null;
  updatedAt: string | null;
};
