export const getMondayUTC = (dateInput: Date | string): Date => {

  let date: Date;
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    date = new Date(dateInput + 'T00:00:00Z');
  } else {
    date = new Date(dateInput);
  }
  const day = date.getUTCDay();
  if (day === 1) {
    date.setUTCHours(0, 0, 0, 0);
    return date;
  }

  const diff = (day === 0 ? -6 : 1 - day); 
  date.setUTCDate(date.getUTCDate() + diff);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}