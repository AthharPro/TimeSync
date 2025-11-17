import { useContext } from 'react';
import { WindowNavigationContext } from '../contexts/WindowNaviagationContext';
import { IWindowNavigationContext } from '../interfaces';

export const useWindowNavigation = (): IWindowNavigationContext => {
  const context = useContext(WindowNavigationContext);
  if (context === undefined) {
    throw new Error('useWindowNavigation must be used within a WindowNavigationProvider');
  }
  return context;
};
