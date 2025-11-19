import { ReactNode } from "react";

export interface ILoginLeftPanelProps {
    icon?: string;
    title?: string;
    description?: string;
    imageSrc?: string;
}

export interface ITwoColumnLayoutProps {
  leftContent?: ReactNode;
  rightContent?: ReactNode;
}

export interface ILoginData {
  email: string;
  password: string;
}


export interface ICreateAccountData {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  designation: string;
}

export interface ISetPasswordData {
  newPassword: string;
  confirmPassword: string;
}

export interface IPasswordResetData {
  email: string;
}

export interface IAuthFormContainer {
  icon?: string;
  description?: string;
  title: string;
  children: React.ReactNode;
}

export interface ILoginData {
  email: string;
  password: string;
}

export interface ISetPasswordData {
  newPassword: string;
  confirmPassword: string;
}

export interface IPasswordResetData {
  email: string;
}

export interface ICreateAccountData {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  designation: string;
}

