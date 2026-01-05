import { Document, Types } from "mongoose";
import { EditRequestStatus } from "../models/editRequest.model";

export interface IEditRequest {
  userId: Types.ObjectId;
  month: string; // Format: 'YYYY-MM'
  year: string; // Format: 'YYYY'
  status: EditRequestStatus;
  requestDate: Date;
  approvedBy?: Types.ObjectId;
  approvedDate?: Date;
  rejectedBy?: Types.ObjectId;
  rejectedDate?: Date;
  rejectionReason?: string;
}

export interface IEditRequestDocument extends IEditRequest, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEditRequestParams {
  userId: string;
  month: string;
  year: string;
}

export interface ApproveEditRequestParams {
  requestId: string;
  approvedBy: string;
}

export interface RejectEditRequestParams {
  requestId: string;
  rejectedBy: string;
  rejectionReason: string;
}
