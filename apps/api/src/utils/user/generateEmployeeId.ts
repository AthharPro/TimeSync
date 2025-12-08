import mongoose from 'mongoose';

export const generateNextEmployeeId = async (): Promise<string> => {
  const lastUser = await mongoose
    .model('User')
    .findOne({ employee_id: { $exists: true, $ne: null } }, { employee_id: 1 })
    .sort({ employee_id: -1 })
    .lean() as { employee_id?: string } | null;

  const lastNumber = lastUser?.employee_id
    ? parseInt(lastUser.employee_id.match(/\d+/)?.[0] ?? '0', 10)
    : 0;

  return `EMP/${(lastNumber + 1).toString().padStart(4, '0')}`;
};
