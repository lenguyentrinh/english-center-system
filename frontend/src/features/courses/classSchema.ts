import { z } from "zod";

/** Mirrors backend EntryLevel (CEFR). requiredEntryLevel is a free string server-side. */
export const ENTRY_LEVELS = ["PRE_A1", "A1", "A2", "B1", "B2", "C1", "C2"] as const;

export type ClassFormInput = {
  code: string;
  name: string;
  /** Admin-managed category id, "" = none. */
  categoryId: string;
  teacherId: string;
  room: string;
  /** 1 = Monday .. 7 = Sunday */
  days: number[];
  /** minutes from midnight */
  start: number;
  end: number;
  startDate: string;
  endDate: string;
  maxStudent: number;
  status: "OPEN" | "ACTIVE" | "CLOSE";
  minimumAge: number;
  requiredEntryLevel: string;
  prerequisitesRequired: boolean;
};

/**
 * Create/edit form for a class (backend Course). `existingCodes` are the codes of OTHER courses so the
 * unique check can run client-side. `checkStartInFuture` only applies on create (the backend allows a
 * past start date when editing a running course).
 */
export function buildClassSchema(existingCodes: string[], checkStartInFuture: boolean) {
  const taken = new Set(existingCodes.map((c) => c.toLowerCase()));
  return z
    .object({
      code: z
        .string()
        .min(1, "Nhập mã lớp.")
        .regex(/^\S+$/, "Mã lớp không chứa khoảng trắng.")
        .refine((v) => !taken.has(v.toLowerCase()), "Mã lớp đã tồn tại."),
      name: z.string().trim().min(3, "Tên khoá cần ít nhất 3 ký tự."),
      categoryId: z.string(),
      teacherId: z.string(),
      room: z.string().trim().min(1, "Nhập phòng học.").max(50, "Phòng tối đa 50 ký tự."),
      days: z.array(z.number().int().min(1).max(7)).min(1, "Chọn ít nhất một ngày học."),
      start: z.number(),
      end: z.number(),
      startDate: z.string().min(1, "Chọn ngày bắt đầu."),
      endDate: z.string().min(1, "Chọn ngày kết thúc."),
      maxStudent: z.number({ error: "Nhập sĩ số tối đa." }).int().min(1, "Sĩ số tối đa phải lớn hơn 0."),
      status: z.enum(["OPEN", "ACTIVE", "CLOSE"]),
      minimumAge: z.number({ error: "Nhập độ tuổi tối thiểu." }).int().min(0, "Độ tuổi không âm."),
      requiredEntryLevel: z.string().min(1, "Chọn trình độ đầu vào."),
      prerequisitesRequired: z.boolean(),
    })
    .refine((d) => d.end > d.start, { message: "Giờ kết thúc phải sau giờ bắt đầu.", path: ["end"] })
    .refine((d) => !d.startDate || !d.endDate || d.endDate >= d.startDate, { message: "Ngày kết thúc không được trước ngày bắt đầu.", path: ["endDate"] })
    .refine(
      (d) => {
        if (!checkStartInFuture || !d.startDate) return true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(d.startDate) >= today;
      },
      { message: "Ngày bắt đầu phải từ hôm nay trở đi.", path: ["startDate"] },
    );
}
