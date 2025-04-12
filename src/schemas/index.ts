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

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const itinerarySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  cover: z.string().url("Invalid URL").optional(),
  popular: z.boolean().optional(),
});

export const detailsSchema = z.object({
  description: z
    .string()
    .min(3, "Description must be at least 3 characters long"),
  tour: z.string().optional(),
  alert: z.string().optional(),
  duration: z
    .number()
    .positive("Duration must be a positive number")
    .optional(),
  included: z.string().optional(),
  notIncluded: z.string().optional(),
  meetingPoint: z.string().optional(),
  costPerPerson: z.number().optional(),
  itinerary_id: z.string().uuid("Invalid itinerary ID"),
  additional: z
    .object({
      security: z.string().optional(),
      accessibility: z.string().optional(),
      recommendations: z.string().optional(),
    })
    .optional(),
});

export const optionalSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  price: z.number().optional(),
  duration: z
    .number()
    .positive("Duration must be a positive number")
    .optional(),
  description: z.string().optional(),
  observations: z.string().optional(),
  detail_id: z.string().uuid("Invalid detail ID"),
});

export const mediaSchema = z.object({
  url: z.string().url("Invalid URL"),
  itinerary_id: z.string().uuid("Invalid itinerary ID"),
});
