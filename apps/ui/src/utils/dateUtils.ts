/**
 * Convert a Date object to ISO string while preserving the local date
 * (avoids timezone shift issues)
 * 
 * @param date - The date to convert
 * @returns ISO string in format YYYY-MM-DDTHH:mm:ss.sssZ but with local date preserved
 */
export const toLocalISOString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const ms = String(date.getMilliseconds()).padStart(3, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}Z`;
};

/**
 * Convert a Date object to ISO date string (YYYY-MM-DD) preserving the local date
 * 
 * @param date - The date to convert
 * @returns ISO date string in format YYYY-MM-DD
 */
export const toLocalISODate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};
