import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

export interface JWTPayload {
  userId: string;
  email: string;
  userType: "customer" | "b2b_pending" | "b2b_approved" | "admin";
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, config.jwt.secret) as JWTPayload;
}
