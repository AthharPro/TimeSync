import { ErrorRequestHandler, Response } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http";
import { z } from "zod";
import { AppError } from "../utils/error";
import { clearAuthCookies, REFRESH_PATH } from "../utils/auth";

const handleZodError = (res: Response, err: z.ZodError) => {
  const errors = err.issues.map((err) => ({
    path: err.path.join('.'),
    message: err.message,
  }));

  return res.status(BAD_REQUEST).json({
    message: err.message,
    errors,
  });
};

const handleAppError = (res: Response, error: AppError) => {
  return res.status(error.statusCode).json({
    message: error.message,
    errorCode: error.errorCode,
  });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  console.error(`PATH: ${req.path}`, err);

  if (req.path === REFRESH_PATH) {
    clearAuthCookies(res);
  }

  if (err instanceof z.ZodError) {
    return handleZodError(res, err);
  }

  if (err instanceof AppError) {
    return handleAppError(res, err);
  }

  if (process.env.NODE_ENV === 'development') {
    return res.status(INTERNAL_SERVER_ERROR).json({
      message: err.message || "Internal Server Error",
      stack: err.stack,
      path: req.path,
      method: req.method
    });
  }

  return res.status(INTERNAL_SERVER_ERROR).send("Internal Server Error");
};

export default errorHandler;