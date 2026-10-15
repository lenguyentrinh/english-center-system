import { z } from "zod";
import type { RoleCode, UserStatus } from "./types.ts";

export type RoleGroup = "ALL" | "ADMIN" | "TEACHER" | "STUDENT";

export const groupOf = (code: RoleCode | string): Exclude<RoleGroup, "ALL"> =>
  code === "ADMIN" ? "ADMIN" : code === "STUDENT" ? "STUDENT" : "TEACHER";

/** Group used for the avatar colour: admin wins over teacher wins over student. */
export const primaryGroup = (codes: string[]): Exclude<RoleGroup, "ALL"> =>
  codes.includes("ADMIN") ? "ADMIN" : codes.some((c) => groupOf(c) === "TEACHER") ? "TEACHER" : "STUDENT";

export const AVATAR: Record<Exclude<RoleGroup, "ALL">, { bg: string; fg: string }> = {
  ADMIN: { bg: "#020617", fg: "#fff" },
  TEACHER: { bg: "#dbeafe", fg: "#1e40af" },
  STUDENT: { bg: "#ecfeff", fg: "#155e75" },
};

export const roleTagStyle = (code: string): { bg: string; fg: string } =>
  code === "ADMIN" ? { bg: "#020617", fg: "#fff" } : code === "STUDENT" ? { bg: "#ecfdf5", fg: "#065f46" } : { bg: "#dbeafe", fg: "#1e40af" };

export const roleLabel = (code: string): string =>
  code === "ADMIN" ? "Admin" : code === "TEACHER" ? "Giáo viên" : code === "STUDENT" ? "Học viên" : code.replace(/^TEACHER_/, "").replace(/_/g, " ");

export const STATUS_META: Record<UserStatus, { label: string; bg: string; fg: string; dot: string }> = {
  ACTIVE: { label: "Đang hoạt động", bg: "#ecfdf5", fg: "#065f46", dot: "#10b981" },
  INACTIVE: { label: "Tạm ngưng", bg: "#f1f5f9", fg: "#475569", dot: "#94a3b8" },
  LOCKED: { label: "Bị khoá", bg: "#fff1f2", fg: "#be123c", dot: "#f43f5e" },
};

export const formatDate = (v: string | null | undefined) => (v ? new Date(v).toLocaleDateString("vi-VN") : "—");

export const initialOf = (name: string) => (name.trim().split(/\s+/).pop() ?? "?").charAt(0).toUpperCase();

/** Backend limits (UserRequest / UserUpdateRequest): fullName 2-50, phone 0 + 9 digits. */
export const nameSchema = z.string().trim().min(1, "Nhập họ và tên.").min(2, "Họ và tên cần ít nhất 2 ký tự.").max(50, "Họ và tên tối đa 50 ký tự.");
export const emailSchema = z.string().trim().min(1, "Nhập email.").email("Email chưa đúng định dạng.");
export const phoneSchema = z
  .string()
  .trim()
  .refine((v) => v === "" || /^0\d{9}$/.test(v.replace(/\s/g, "")), "Số điện thoại gồm 10 số, bắt đầu bằng 0.");

export const normalizePhone = (v: string) => v.replace(/\s/g, "");

export const DUPLICATE_EMAIL_MSG = "Email đã được dùng cho tài khoản khác.";
