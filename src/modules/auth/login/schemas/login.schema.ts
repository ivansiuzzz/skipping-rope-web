import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("email format error"),

  password: z
    .string()
    .min(1, "please enter password")
    .min(6, "password must be at least 6 characters"),

  //   remember: z
  //     .boolean()
  //     .optional()
  //     .default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;
