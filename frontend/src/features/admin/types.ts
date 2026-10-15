export type UserStatus = "ACTIVE" | "INACTIVE" | "LOCKED";

/** Backend role code. Only ADMIN / TEACHER / STUDENT are used by the app; teacher specialties are categories. */
export type RoleCode = string;

export type BusinessRoleCode = string;

export type RoleResponse = {
  id: string;
  code: RoleCode;
  description: string | null;
  active: boolean;
  businessRoleId: string | null;
  businessRoleCode: BusinessRoleCode | null;
};

export type BusinessRoleResponse = {
  id: string;
  code: BusinessRoleCode;
  description: string | null;
  active: boolean;
  roles?: RoleResponse[];
  createdAt?: string;
  updateAt?: string;
};

export type UserSummaryResponse = {
  id: string;
  username: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  status: UserStatus | null;
  /** Effective role codes (all roles incl. those from business roles). */
  roles?: string[];
  createdAt: string | null;
  updatedAt: string | null;
};

export type UserEffectiveRolesResponse = {
  userId: string;
  username: string;
  directRoles: RoleResponse[];
  businessRoles: BusinessRoleResponse[];
  effectiveRoles: RoleResponse[];
};

export type RoleUpsertPayload = {
  code: RoleCode;
  description?: string;
  businessRoleId?: string | null;
};

export type BusinessRoleUpsertPayload = {
  code: BusinessRoleCode;
  description?: string;
  active?: boolean;
};