export const createWeekOverlapQuery = (startDate?: string | Date, endDate?: string | Date) => {
  if (!startDate && !endDate) {
    return {};
  }

  const query: any = {
    $or: []
  };
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
   
    query.$or.push({
      weekStartDate: {
        $gte: start,
        $lte: end
      }
    });
    
    query.$or.push({
      weekStartDate: { $lt: start },
      $expr: {
        $gte: [
          { $add: ["$weekStartDate", 6 * 24 * 60 * 60 * 1000] }, 
          start
        ]
      }
    });
  } else if (startDate) {
    const start = new Date(startDate);
    
    // Include timesheets that end on or after the start date
    query.$or.push({
      weekStartDate: { $gte: start }
    });
    query.$or.push({
      weekStartDate: { $lt: start },
      $expr: {
        $gte: [
          { $add: ["$weekStartDate", 6 * 24 * 60 * 60 * 1000] },
          start
        ]
      }
    });
  } else if (endDate) {
    const end = new Date(endDate);
    // Include timesheets that start on or before the end date
    return {
      weekStartDate: { $lte: end }
    };
  }

  return query;
};



