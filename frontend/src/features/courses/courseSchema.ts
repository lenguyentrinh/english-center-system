import { z } from "zod";

export const courseSchema = z
  .object({
    code: z.string().min(1, "Code is required"),
    name: z.string().min(3, "Name must be at least 3 characters"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    maxStudent: z.number().min(1),
    status: z.enum(["OPEN", "ACTIVE", "CLOSED"]),
    minimumAge: z.number().min(0, "Minimum age must be 0 or greater"),
    requiredEntryLevel: z.string().min(1, "Required entry level is required"),
    prerequisitesRequired: z.boolean(),
    teacherId: z.number().optional(),
    availableRoleTeacher: z.enum([
      "TEACHER",
      "TEACHER_IELTS_6",
      "TEACHER_IELTS_7",
      "TEACHER_IELTS_8",
      "TEACHER_TOEIC_650",
      "TEACHER_TOEIC_750",
      "TEACHER_TOEIC_850",
    ]),
  })
  .refine((data) => {
    const start = new Date(data.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !Number.isNaN(start.getTime()) && start >= today;
  }, {
    message: "Start date must be today or a future date",
    path: ["startDate"],
  })
  .refine((data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return (
      !Number.isNaN(start.getTime()) &&
      !Number.isNaN(end.getTime()) &&
      end > start
    );
  }, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export type CourseForm = z.infer<typeof courseSchema>;