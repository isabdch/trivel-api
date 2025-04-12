// Core
import express, { type Request, type Response } from "express";

// Libraries
import dotenv from "dotenv";

// Routes
import userRoutes from "./routes/userRoutes";
import itineraryRoutes from "./routes/itineraryRoutes";

const app = express();

dotenv.config();

// Routes
app.use("/users", userRoutes);
app.use("/itineraries", itineraryRoutes);

// Test route
app.get("/", (req: Request, res: Response) => {
  res.send("Server is running!");
});
