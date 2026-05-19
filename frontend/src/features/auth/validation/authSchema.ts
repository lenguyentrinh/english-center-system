import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username is required")
    .max(50, "Username must be at most 50 characters"),
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
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be at most 100 characters"),
  email: z.string().trim().email("Invalid email"),
  fullName: z.string().trim().min(1, "Full name is required"),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type SignupForm = z.infer<typeof signupSchema>;
