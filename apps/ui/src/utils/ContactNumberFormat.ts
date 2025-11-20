
export const ContactNumberFormat = (contactNumber: string | undefined | null): string => {
  if (!contactNumber) return '-';
  
  // Remove any non-digit characters
  const cleanNumber = contactNumber.replace(/\D/g, '');
  
  // Check if it's a valid 10-digit number
  if (cleanNumber.length !== 10) {
    return contactNumber; 
  }
  
  // Format 
  const firstThree = cleanNumber.substring(0, 3);
  const nextThree = cleanNumber.substring(3, 6);
  const lastFour = cleanNumber.substring(6, 10);
  
  return `${firstThree} - ${nextThree} ${lastFour}`;
};
