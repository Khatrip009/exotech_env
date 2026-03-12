// src/middlewares/error.middleware.js
import { ZodError } from "zod";
import { normalizeZodError } from "../utils/zodError.js";
import { logger } from "../config/logger.js";

export function errorHandler(err, req, res, next) {
  // ZOD VALIDATION ERRORS
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: normalizeZodError(err)
    });
  }

  // MANUAL / BUSINESS ERRORS
  if (err.status) {
    return res.status(err.status).json({
      success: false,
      message: err.message
    });
  }

  // UNEXPECTED ERRORS
  logger.error(err);

  return res.status(500).json({
    success: false,
    message: "Internal server error"
  });
}
