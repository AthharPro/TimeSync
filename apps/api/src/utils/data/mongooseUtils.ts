import mongoose from 'mongoose';

export const stringArrayToObjectIds = (ids: (string | null | undefined)[]): mongoose.Types.ObjectId[] => {
  return ids
    .filter((id): id is string => !!id && id.trim() !== '')
    .map(id => new mongoose.Types.ObjectId(id));
};

export const stringToObjectId = (id: string | null | undefined): mongoose.Types.ObjectId | null => {
  if (!id || id.trim() === '') return null;
  try {
    return new mongoose.Types.ObjectId(id);
  } catch {
    return null;
  }
};

