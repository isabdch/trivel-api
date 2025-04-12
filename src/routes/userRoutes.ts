// Core
import { Router } from "express";

// Middlewares
import { authenticateToken, validateRequest } from "../middlewares";

// Schemas
import { loginSchema, userSchema } from "../schemas";

// Controllers
import {
  getUser,
  loginUser,
  logoutUser,
  createUser,
  refreshToken,
} from "../controllers/userController";

const router = Router();

router.post("/", validateRequest(userSchema), createUser);

router.get("/", authenticateToken, getUser);

router.post("/login", validateRequest(loginSchema), loginUser);

router.post("/logout", logoutUser);

router.post("/refresh-token", refreshToken);

export default router;
