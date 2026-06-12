import { z } from "zod";

export const businessRoleSchema = z.object({
  code: z.enum([
    "TOEIC_TEACHING_INTERMEDIATE",
    "TOEIC_TEACHING_ADVANCED",
    "IELTS_TEACHING_INTERMEDIATE",
    "IELTS_TEACHING_ADVANCED",
    "ENGLISH_COMMUNICATION_BASIC",
    "ENGLISH_COMMUNICATION_ADVANCED",
  ]),
  description: z.string().max(500, "Description must be at most 500 characters").optional().or(z.literal("")),
  active: z.boolean(),
});

export type BusinessRoleForm = z.infer<typeof businessRoleSchema>;

export const defaultBusinessRoleValues: BusinessRoleForm = {
  code: "TOEIC_TEACHING_INTERMEDIATE",
  description: "",
  active: true,
};
