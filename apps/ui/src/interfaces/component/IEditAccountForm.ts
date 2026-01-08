import { FieldErrors, UseFormHandleSubmit, UseFormRegister } from 'react-hook-form';
import { IAccountTableRow } from './organism/ITable';

export interface IEditAccountData {
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  contactNumber: string;
  status: 'Active' | 'Inactive' | string;
}

export interface IEditAccountFormProps {
  register: UseFormRegister<IEditAccountData>;
  errors: FieldErrors<IEditAccountData>;
  isValid: boolean;
  isLoading: boolean;
  error: string | null;
  handleCancel: () => void;
  handleSubmit: UseFormHandleSubmit<IEditAccountData>;
  onSubmit: (data: IEditAccountData) => void;
  accountData: IAccountTableRow;
}
