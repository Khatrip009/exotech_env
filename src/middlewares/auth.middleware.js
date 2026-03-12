// src/middlewares/auth.middleware.js
import jwt from "jsonwebtoken";
import { pool } from "../db/pool.js";
import { env } from "../config/env.js";

/**
 * Authentication middleware
 * - Validates JWT
 * - Ensures session is active
 * - Attaches req.user
 */
export async function authRequired(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing"
      });
    }

    const token = authHeader.split(" ")[1];

    let payload;
    try {
      payload = jwt.verify(token, env.jwtSecret);
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    const { id: userId, role, sessionId } = payload;

    // Validate session is active (not revoked)
    const { rows } = await pool.query(
      `SELECT id, revoked_at
       FROM user_sessions
       WHERE id = $1 AND user_id = $2`,
      [sessionId, userId]
    );

    if (!rows.length || rows[0].revoked_at) {
      return res.status(401).json({
        success: false,
        message: "Session expired or revoked"
      });
    }

    // Attach user context
    req.user = {
      id: userId,
      role,
      sessionId
    };

    next();
  } catch (err) {
    next(err);
  }
}
