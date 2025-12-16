export const createFilledArray = <T>(length: number, value: T): T[] => {
  return Array(length).fill(value);
};

export const removeDuplicateStrings = (arr: string[]): string[] => {
  return Array.from(new Set(arr));
};

export const removeDuplicatesByKey = <T>(arr: T[], key: keyof T): T[] => {
  const seen = new Set();
  return arr.filter(item => {
    const keyValue = item[key];
    if (seen.has(keyValue)) {
      return false;
    }
    seen.add(keyValue);
    return true;
  });
};

export const filterValidIds = (ids: (string | null | undefined)[]): string[] => {
  return ids.filter((id): id is string => !!id && id.trim() !== '');
};

export const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};


export const groupBy = <T, K extends string | number | symbol>(
  array: T[], 
  keyFn: (item: T) => K
): Record<K, T[]> => {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
};

export const safeArrayAccess = <T>(array: T[], index: number, defaultValue: T): T => {
  return array[index] !== undefined ? array[index] : defaultValue;
};
