import { z } from "zod";

export const roleSchema = z.object({
  code: z.enum([
    "ADMIN",
    "TEACHER",
    "STUDENT",
    "TEACHER_IELTS_6",
    "TEACHER_IELTS_7",
    "TEACHER_IELTS_8",
    "TEACHER_TOEIC_650",
    "TEACHER_TOEIC_750",
    "TEACHER_TOEIC_850",
  ]),
  description: z.string().max(500, "Description must be at most 500 characters").optional().or(z.literal("")),
  businessRoleId: z.string().optional().or(z.literal("")),
});

export type RoleForm = z.infer<typeof roleSchema>;

export const defaultRoleValues: RoleForm = {
  code: "ADMIN",
  description: "",
  businessRoleId: "",
};
