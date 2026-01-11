import React, { createContext, useState, useEffect } from 'react';
import { IWindowNavigationContext, IWindowNavigationProviderProps, ReviewTimesheetNavParams, MyTimesheetNavParams } from '../interfaces';

export const WindowNavigationContext = createContext<IWindowNavigationContext | undefined>(undefined);

const STORAGE_KEY = 'selectedWindow';

export const WindowNavigationProvider: React.FC<IWindowNavigationProviderProps> = ({ children }) => {
  // Initialize state from localStorage if available
  const [selectedButton, setSelectedButtonState] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored || null;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return null;
    }
  });
  
  const [reviewTimesheetParams, setReviewTimesheetParams] = useState<ReviewTimesheetNavParams | null>(null);
  const [myTimesheetParams, setMyTimesheetParams] = useState<MyTimesheetNavParams | null>(null);

  // Wrapper function to update both state and localStorage
  const setSelectedButton = (button: string | null) => {
    setSelectedButtonState(button);
    try {
      if (button) {
        localStorage.setItem(STORAGE_KEY, button);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to write to localStorage:', error);
    }
  };

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
