import { Request } from "express";
import mongoose from "mongoose";
import { UserDocument } from "../models/user.model";
import { SessionDocument } from "../models/session.model";
import { UserRole } from "@tms/shared";

declare module "express-serve-static-core" {
  interface Request {
    userId: UserDocument["_id"];
    userRole: UserRole|string;
    sessionId: SessionDocument["_id"];
  }
}


