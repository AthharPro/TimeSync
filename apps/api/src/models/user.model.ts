import mongoose from 'mongoose';
import { hashValue, compareValue } from '../utils/auth';
import { generateNextEmployeeId } from '../utils/user';
import { UserRole } from '@tms/shared';
import { IUserDocument, IUserModel } from '../interfaces';

const userSchema = new mongoose.Schema<IUserDocument>(
  {
    employee_id: { type: String, unique: true, sparse: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    designation: { type: String, required: true },
    contactNumber: { type: String, required: true },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), required: true },
    status: { type: Boolean, default: true }, 
    isChangedPwd: { type: Boolean, default: false }
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (this.isNew && !this.employee_id) {
    try {
      this.employee_id = await generateNextEmployeeId();
    } catch (error) {
      return next(error as Error);
    }
  }

  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await hashValue(this.password);
  next();
});

userSchema.methods.comparePassword = async function (val: string) {
  return compareValue(val, this.password);
};

userSchema.methods.omitPassword = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const UserModel = mongoose.model<IUserDocument, IUserModel>('User', userSchema);

export { UserModel };