import { RequestHandler } from "express";
import { appAssert } from "../utils/validation";
import { UNAUTHORIZED, FORBIDDEN } from "../constants/http";
import { verifyToken } from "../utils/auth";
import { UserRole } from "@tms/shared"; 

const authenticate = (requiredRoles?: UserRole[]): RequestHandler => {
  return (req, res, next) => {
    const accessToken = req.cookies?.accessToken as string | undefined;

    appAssert(
      accessToken,
      UNAUTHORIZED,
      "Not authorized"
    );

    const { error, payload } = verifyToken(accessToken);

    appAssert(
      payload,
      UNAUTHORIZED,
      error === "jwt expired" ? "Token expired" : "Invalid token"
    );

    appAssert(
      payload.userId && payload.sessionId && payload.role,
      UNAUTHORIZED,
      "Invalid token payload"
    );

    req.userId = payload.userId;
    req.userRole = payload.role;
    req.sessionId = payload.sessionId;

    const userRole = payload.role as UserRole;

    if (requiredRoles && !requiredRoles.includes(userRole)) {
      appAssert(
        false,
        FORBIDDEN,
        "Access denied: insufficient permissions"
      );
    }
    next();
  };
};

export default authenticate;