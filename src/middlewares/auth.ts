// Core
import { Response, NextFunction } from "express";

// Libraries
import jwt from "jsonwebtoken";

// Types
import type { AuthenticatedRequest } from "../types";

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Token not provided" });
  } else {
    jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
      if (err) {
        res.status(403).json({ message: "Invalid token" });
      } else {
        req.user = user as {
          userId: string;
          email: string;
        };

        next();
      }
    });
  }
};
