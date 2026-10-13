export type UserStatus = "ACTIVE" | "INACTIVE" | "LOCKED";

export type RoleCode =
  | "ADMIN"
  | "TEACHER"
  | "STUDENT"
  | "TEACHER_IELTS_6"
  | "TEACHER_IELTS_7"
  | "TEACHER_IELTS_8"
  | "TEACHER_TOEIC_650"
  | "TEACHER_TOEIC_750"
  | "TEACHER_TOEIC_850";

export type BusinessRoleCode =
  | "TOEIC_TEACHING_INTERMEDIATE"
  | "TOEIC_TEACHING_ADVANCED"
  | "IELTS_TEACHING_INTERMEDIATE"
  | "IELTS_TEACHING_ADVANCED"
  | "ENGLISH_COMMUNICATION_BASIC"
  | "ENGLISH_COMMUNICATION_ADVANCED";

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