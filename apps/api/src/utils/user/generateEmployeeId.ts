import mongoose from 'mongoose';

/**
 * Generates the next employee ID in the format EMP/XXXX
 * @returns Promise<string> The next employee ID
 */
export const generateNextEmployeeId = async (): Promise<string> => {
  const lastUser = await mongoose.model('User').findOne(
    { employee_id: { $exists: true, $ne: null } },
    { employee_id: 1 }
  ).sort({ employee_id: -1 }).lean() as { employee_id?: string } | null;

  let nextNumber = 1;
  if (lastUser?.employee_id) {
    // Extract the number from the last employee_id 
    const match = lastUser.employee_id.match(/EMP\/(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `EMP/${nextNumber.toString().padStart(4, '0')}`;
};
