import React, { createContext, useState } from 'react';
import { IWindowNavigationContext, IWindowNavigationProviderProps } from '../interfaces';

export const WindowNavigationContext = createContext<IWindowNavigationContext | undefined>(undefined);

export const WindowNavigationProvider: React.FC<IWindowNavigationProviderProps> = ({ children }) => {
  const [selectedButton, setSelectedButton] = useState<string | null>(null);

  return (
    <WindowNavigationContext.Provider value={{ selectedButton, setSelectedButton }}>
      {children}
    </WindowNavigationContext.Provider>
  );
};
