import mongoose from "mongoose";
import VerificationCodeType from "../constants/verificationCodeType";
import { IVerificationCodeDocument } from '../interfaces';

const VerificationCodeSchema = new mongoose.Schema<IVerificationCodeDocument>(
{
    userId : {type:mongoose.Schema.Types.ObjectId, required:true, ref:"User",index:true},
    type:{type:String,required:true},
    expiresAt: {type: Date, required: true},
    createdAt: {type: Date, required: true, default: Date.now},
}
);

const VerificationCodeModel = mongoose.model<IVerificationCodeDocument>("VerificationCode", VerificationCodeSchema,"verification_codes");

export default VerificationCodeModel;