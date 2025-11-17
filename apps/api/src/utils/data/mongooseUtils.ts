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

export const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id) && id.length === 24;
};

export const createSafeUpdateObject = <T extends Record<string, unknown>>(data: T): Partial<T> => {
  const updateObject: Partial<T> = {};
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (value !== undefined) {
      updateObject[key as keyof T] = value as T[keyof T];
    }
  });
  
  return updateObject;
};

export const createPopulateOptions = (
  path: string, 
  select?: string, 
  model?: string
): mongoose.PopulateOptions => {
  const options: mongoose.PopulateOptions = { path };
  
  if (select) options.select = select;
  if (model) options.model = model;
  
  return options;
};

export const createObjectIdMatchStage = (field: string, ids: string[]): Record<string, unknown> => {
  const validIds = stringArrayToObjectIds(ids);
  return validIds.length > 0 ? { [field]: { $in: validIds } } : {};
};

export const extractObjectIdString = (doc: Record<string, unknown>, field: string): string | undefined => {
  const value = doc[field];
  if (!value) return undefined;
  
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && '_id' in value) {
    const objValue = value as { _id: { toString(): string } };
    return objValue._id.toString();
  }
  if (typeof value === 'object' && value !== null && 'toString' in value) {
    return (value as { toString(): string }).toString();
  }
  
  return undefined;
};
