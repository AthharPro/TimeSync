import { ReactNode } from "react";

export interface ITableWindowLayoutProps {
  title: string;
  buttons: ReactNode[];
  table: ReactNode;
  search?: ReactNode;
  filter?: ReactNode;
}