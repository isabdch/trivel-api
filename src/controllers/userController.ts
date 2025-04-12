// Core
import { Request, Response } from "express";

// Libraries
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

// Config
import { prisma } from "../config/prisma";

// Types
import type { AuthenticatedRequest, User } from "../types";

export const getUser = async (req: AuthenticatedRequest, res: Response) => {
  const userRequest = req.user;

  if (!userRequest) {
    res.status(401).json({ message: "Unauthorized" });

    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userRequest.userId },
    include: { itineraries: true },
  });

  if (!user) {
    res.status(404).json({ message: "User not found" });

    return;
  }

  const userWithoutPassword = {
    id: user.id,
    fullname: user.fullname,
    email: user.email,
    role: user.role,
    phone: user.phone,
    itineraries: user.itineraries,
  };

  res.status(200).json(userWithoutPassword);
};

export const createUser = async (req: Request, res: Response) => {
  const { fullname, email, role, phone, password }: User = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      res.status(400).json({ error: "Email already in use" });

      return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        id: uuidv4(),
        fullname,
        email,
        role,
        phone,
        password: hashedPassword,
        itineraries: {
          create: [],
        },
      },
    });

    if (!newUser) {
      res.status(400).json({ message: "Error creating user" });

      return;
    }

    const userWithoutPassword = {
      id: newUser.id,
      role: newUser.role,
      email: newUser.email,
      phone: newUser.phone,
      fullname: newUser.fullname,
    };

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: "Error creating user", detail: error });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    res.status(401).json({ message: "Invalid credentials" });

    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    res.status(401).json({ message: "Invalid password" });

    return;
  }

  const accessToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: "7d" }
  );

  // NOTE: create refresh token for every login, even if the user is already logged in (in case of another device)
  await prisma.refresh_token.create({
    data: {
      id: uuidv4(),
      user_id: user.id,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  res.json({ accessToken, refreshToken });
};

export const logoutUser = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ message: "Refresh token not provided" });

    return;
  }

  await prisma.refresh_token.deleteMany({
    where: { token: refreshToken },
  });

  res.status(200).json({ message: "Logout successful" });
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ message: "Refresh token not provided" });

    return;
  }

  const existing = await prisma.refresh_token.findUnique({
    where: { token: refreshToken },
  });

  if (!existing) {
    res.status(403).json({ message: "Refresh token not found" });

    return;
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as { userId: string };

    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: "Token expired or invalid" });
  }
};
