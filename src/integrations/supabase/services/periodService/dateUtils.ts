
/**
 * Helper function to ensure consistent date handling
 * Uses noon UTC to avoid timezone issues
 */
export const toISODateString = (date: Date): string => {
  // Ensure we're working with a fresh date object
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  // Create a new date at noon UTC
  const utcDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
  
  // Return only the date part (YYYY-MM-DD)
  return utcDate.toISOString().split('T')[0];
};
