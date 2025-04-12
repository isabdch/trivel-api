// Core
import { type Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export interface User {
  id: string;
  fullname: string;
  email: string;
  role: string;
  phone: string;
  password: string;
  itineraries: Itinerary[];
}

export interface Media {
  id: string;
  url: string;
  itinerary_id?: string;
}

export interface Additional {
  [key: string]: string | undefined;
  security?: string;
  accessibility?: string;
  recommendations?: string;
}

export interface Optional {
  id: string;
  title: string;
  detail_id?: string;
  price?: string;
  duration?: number;
  description?: string;
  observations?: string;
}

export interface Details {
  description: string;
  itinerary_id?: string;
  tour?: string;
  alert?: string;
  duration?: number;
  included?: string;
  timetable?: string;
  notIncluded?: string;
  meetingPoint?: string;
  costPerPerson?: string;
  optional?: Optional[];
  additional?: Additional;
}

export interface Itinerary {
  id: string;
  name: string;
  cover: string | null;
  media: Media[];
  popular: boolean | null;
  details: Details | null;
}
