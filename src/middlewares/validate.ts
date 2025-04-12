// Core
import { type Request, type Response, type NextFunction } from "express";

// Libraries
import { ZodSchema } from "zod";

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: "Validation failed",
        details: result.error.format(),
      });

      return;
    }

    req.body = result.data;

    next();
  };
};
