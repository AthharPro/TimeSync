import { ReactNode } from "react";
import INavItemProps from "../navigation/INavItemProps";

export interface IMainLayoutProps {
  children: ReactNode;
  items: INavItemProps[][];
}