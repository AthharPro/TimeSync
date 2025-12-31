import React, { createContext, useState } from 'react';
import { IWindowNavigationContext, IWindowNavigationProviderProps, ReviewTimesheetNavParams, MyTimesheetNavParams } from '../interfaces';

export const WindowNavigationContext = createContext<IWindowNavigationContext | undefined>(undefined);

export const WindowNavigationProvider: React.FC<IWindowNavigationProviderProps> = ({ children }) => {
  const [selectedButton, setSelectedButton] = useState<string | null>(null);
  const [reviewTimesheetParams, setReviewTimesheetParams] = useState<ReviewTimesheetNavParams | null>(null);
  const [myTimesheetParams, setMyTimesheetParams] = useState<MyTimesheetNavParams | null>(null);

  return (
    <WindowNavigationContext.Provider 
      value={{ 
        selectedButton, 
        setSelectedButton, 
        reviewTimesheetParams, 
        setReviewTimesheetParams,
        myTimesheetParams,
        setMyTimesheetParams
      }}
    >
      {children}
    </WindowNavigationContext.Provider>
  );
};
