// Libraries
import { z } from "zod";

export const userSchema = z.object({
  fullname: z.string().min(3, "Name must be at least 3 characters long"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "USER"]),
  phone: z.string().min(10, "Invalid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
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
  description: z.string().min(10, "Description must be at least 10 characters long"),
  tour: z.string().optional(),
  alert: z.string().optional(),
  duration: z.number().positive("Duration must be a positive number").optional(),
  included: z.string().optional(),
  notIncluded: z.string().optional(),
  meetingPoint: z.string().optional(),
  costPerPerson: z.string().optional(),
  itinerary_id: z.string().uuid("Invalid itinerary ID"),
  additional: z.object({
    security: z.string().optional(),
    accessibility: z.string().optional(),
    recommendations: z.string().optional(),
  }).optional(),
});

export const optionalSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  price: z.string().optional(),
  duration: z.number().positive("Duration must be a positive number").optional(),
  description: z.string().optional(),
  observations: z.string().optional(),
  detail_id: z.string().uuid("Invalid detail ID"),
});

export const mediaSchema = z.object({
  url: z.string().url("Invalid URL"),
  itinerary_id: z.string().uuid("Invalid itinerary ID"),
});
