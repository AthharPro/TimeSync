export const createWeekOverlapQuery = (startDate?: string | Date, endDate?: string | Date) => {
  if (!startDate && !endDate) {
    return {};
  }

  const query: any = {};
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Query timesheets where date is between startDate and endDate (inclusive)
    query.date = {
      $gte: start,
      $lte: end
    };
  } else if (startDate) {
    const start = new Date(startDate);
    
    // Include timesheets on or after the start date
    query.date = { $gte: start };
  } else if (endDate) {
    const end = new Date(endDate);
    // Include timesheets on or before the end date
    query.date = { $lte: end };
  }

  return query;
};



