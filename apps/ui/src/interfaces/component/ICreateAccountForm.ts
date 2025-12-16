import { UseFormRegister, FieldErrors, UseFormHandleSubmit } from 'react-hook-form';
import { ICreateAccountData } from '../auth/IAuth';

export interface ICreateAccountFormProps {
  register: UseFormRegister<ICreateAccountData>;
  errors: FieldErrors<ICreateAccountData>;
  isValid: boolean;
  isLoading: boolean;
  error: string | null;
  handleCancel: () => void;
  handleSubmit: UseFormHandleSubmit<ICreateAccountData>;
  onSubmit: (data: ICreateAccountData) => void | Promise<void>;
}




