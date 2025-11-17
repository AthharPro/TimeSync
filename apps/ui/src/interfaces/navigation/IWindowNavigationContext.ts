import { ReactNode } from 'react';

export interface IWindowNavigationContext {
  selectedButton: string | null;
  setSelectedButton: (button: string | null) => void;
}

export interface IWindowNavigationProviderProps {
  children: ReactNode;
}
