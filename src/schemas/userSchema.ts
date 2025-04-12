// Libraries
import { z } from "zod";

export const userSchema = z.object({
  fullname: z
    .string()
    .min(3, "Name must be at least 3 characters long")
    .refine((value) => value.trim().split(" ").length >= 2, {
      message: "Enter first and last name",
    }),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/,
      "Password must have at least one uppercase letter, one lowercase letter and one number"
    ),
  role: z.enum(["admin", "user"], {
    message: "Role must be either 'admin' or 'user'",
  }),
  phone: z.string(),
});

export const userSchemaWithId = userSchema.extend({
  id: z.string(),
});
