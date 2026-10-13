import { z } from "zod";

// Limits mirror the backend DTOs (Constant.java / *Request.java); keep them in sync.
const passwordRule = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(100, "Password must be at most 100 characters")
  .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, "Password must contain at least one letter and one number");

const emailRule = z.string().trim().email("Invalid email").max(255, "Email must be at most 255 characters");

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username or email is required")
    .max(100, "Must be at most 100 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(100, "Password must be at most 100 characters"),
});

export const signupSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters"),
  password: passwordRule,
  email: emailRule,
  fullName: z.string().trim().min(1, "Full name is required"),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
});

export const forgotPasswordSchema = z.object({
  email: emailRule,
});

export const otpSchema = z.object({
  otp: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export const newPasswordSchema = z
  .object({
    newPassword: passwordRule,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required").max(100),
    newPassword: passwordRule,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    message: "New password must be different from the current password",
    path: ["newPassword"],
  });

export type LoginForm = z.infer<typeof loginSchema>;
export type SignupForm = z.infer<typeof signupSchema>;
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
export type OtpForm = z.infer<typeof otpSchema>;
export type NewPasswordForm = z.infer<typeof newPasswordSchema>;
export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
