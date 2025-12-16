import PopupLayout from '../../templates/popup/PopUpLayout';
import { useEffect, useState } from 'react';
import EditAccountFormSchema from '../../../validations/auth/EditAccountFormSchema';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { IEditAccountData } from '../../../interfaces/component/IEditAccountForm';
import { EditAccountForm } from '../../molecules/account';
import { useAccount } from '../../../hooks/account';
import { IAccountTableRow } from '../../../interfaces/component/organism/ITable';

interface EditAccountPopupProps {
  open: boolean;
  accountData: IAccountTableRow | null;
  onClose: () => void;
  onSuccess?: () => void;
}

function EditAccountPopup({
  open,
  accountData,
  onClose,
  onSuccess,
}: EditAccountPopupProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { updateAccount } = useAccount();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<IEditAccountData>({
    resolver: yupResolver(EditAccountFormSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (open && accountData) {
      // Populate form with account data
      reset({
        designation: accountData.designation || '',
        contactNumber: accountData.contactNumber || '',
        status: accountData.status || 'Active',
      });
      setError(null);
    } else if (!open) {
      reset();
      setError(null);
    }
  }, [open, accountData, reset]);

  const onSubmit = async (data: IEditAccountData) => {
    if (!accountData?.id) {
      setError('Account ID is missing');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await updateAccount(accountData.id, {
        designation: data.designation,
        contactNumber: data.contactNumber,
        status: data.status,
      });

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to update account. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!accountData) {
    return null;
  }

  return (
    <PopupLayout open={open} title="Edit Account" onClose={onClose} maxWidth="xs">
      <EditAccountForm
        register={register}
        errors={errors}
        isValid={isValid}
        isLoading={isLoading}
        error={error}
        handleCancel={handleCancel}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        accountData={accountData}
      />
    </PopupLayout>
  );
}

export default EditAccountPopup;
