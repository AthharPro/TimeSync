import { RequestHandler } from "express";
import { appAssert } from "../utils/error";
import { UNAUTHORIZED, FORBIDDEN } from "../constants/http";
import { verifyToken } from "../utils/auth";
import { UserRole } from "@tms/shared"; 

const authenticate = (requiredRoles?: UserRole[]): RequestHandler => {
  return (req, res, next) => {
    try {
    let accessToken: string | undefined;

    // Try Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      accessToken = authHeader.split(" ")[1];
    }

    console.log("Access Token:", accessToken);

    appAssert(accessToken, UNAUTHORIZED, "Not authorized");

    const { error, payload } = verifyToken(accessToken);

    appAssert(
      payload,
      UNAUTHORIZED,
      error === "jwt expired" ? "Token expired" : "Invalid token"
    );

    appAssert(
      payload.userId && payload.role,
      UNAUTHORIZED,
      "Invalid token payload"
    );

    req.userId = payload.userId;
    req.userRole = payload.role;

    if (requiredRoles && !requiredRoles.includes(payload.role as UserRole)) {
      appAssert(false, FORBIDDEN, "Access denied: insufficient permissions");
    }

    return next();
  } catch (err) {
      return next(err);
  }
  };
};

export default authenticate;
