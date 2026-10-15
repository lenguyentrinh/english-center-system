import { z } from "zod";

// Limits mirror the backend DTOs (Constant.java / *Request.java); keep them in sync.
const passwordRule = z
  .string()
  .min(6, "Mật khẩu cần ít nhất 6 ký tự.")
  .max(100, "Mật khẩu tối đa 100 ký tự.")
  .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, "Mật khẩu cần có ít nhất một chữ cái và một chữ số.");

const emailRule = z
  .string()
  .trim()
  .min(1, "Nhập email.")
  .email("Email chưa đúng định dạng.")
  .max(255, "Email tối đa 255 ký tự.");

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Nhập tên đăng nhập hoặc email.")
    .max(100, "Tối đa 100 ký tự."),
  password: z
    .string()
    .min(1, "Nhập mật khẩu.")
    .max(100, "Mật khẩu tối đa 100 ký tự."),
});

export const signupSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Nhập tên đăng nhập.")
    .regex(/^\S*$/, "Không dùng khoảng trắng.")
    .min(5, "Ít nhất 5 ký tự.")
    .max(50, "Tối đa 50 ký tự."),
  password: passwordRule,
  email: emailRule,
  fullName: z.string().trim().min(1, "Nhập họ và tên.").min(5, "Họ và tên cần 5–50 ký tự.").max(50, "Họ và tên cần 5–50 ký tự."),
  phone: z
    .string()
    .trim()
    .regex(/^(0\d{9})?$/, "Số điện thoại chưa đúng.")
    .optional(),
});

export const forgotPasswordSchema = z.object({
  email: emailRule,
});

export const otpSchema = z.object({
  otp: z.string().trim().regex(/^\d{6}$/, "Mã gồm đúng 6 chữ số."),
});

export const newPasswordSchema = z
  .object({
    newPassword: passwordRule,
    confirmPassword: z.string().min(1, "Nhập lại mật khẩu."),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Hai mật khẩu chưa khớp.",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Nhập mật khẩu hiện tại.").max(100),
    newPassword: passwordRule,
    confirmPassword: z.string().min(1, "Nhập lại mật khẩu."),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Hai mật khẩu chưa khớp.",
    path: ["confirmPassword"],
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    message: "Mật khẩu mới phải khác mật khẩu hiện tại.",
    path: ["newPassword"],
  });

export type LoginForm = z.infer<typeof loginSchema>;
export type SignupForm = z.infer<typeof signupSchema>;
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
export type OtpForm = z.infer<typeof otpSchema>;
export type NewPasswordForm = z.infer<typeof newPasswordSchema>;
export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
