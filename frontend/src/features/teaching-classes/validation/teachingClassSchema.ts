import { z } from "zod";

export const teachingClassSchema = z
  .object({
    code: z.string().min(1, "Code is required"),
    name: z.string().min(3, "Name must be at least 3 characters"),
    courseId: z.number().min(1),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    maxStudent: z.number().min(1),
    status: z.enum(["OPEN", "ACTIVE", "CLOSED"]),
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

export type TeachingClassForm = z.infer<typeof teachingClassSchema>;