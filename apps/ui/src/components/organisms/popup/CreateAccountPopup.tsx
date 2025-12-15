import PopupLayout from '../../templates/popup/PopUpLayout';
import { UserRole } from '@tms/shared';
import { useEffect, useState } from 'react';
import  CreateAccountFormSchema  from '../../../validations/auth/CreateAccountFormSchema';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box } from '@mui/material';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import {ICreateAccountData} from '../../../interfaces/auth/IAuth'
import { CreateAccountPopupProps } from '../../../interfaces/popup';
import { registerUser } from '../../../api/auth';
import { CreateAccountForm, BulkAccountForm } from '../../molecules/account';

function CreateAccountPopUp({
  open,
  role,
  onClose,
  onSuccess,
}: CreateAccountPopupProps) {
  const title = `${role === UserRole.Admin ? 'Create Admin' : 'Create Employee'}`;
  const [tabValue, setTabValue] = useState<string>('1');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ICreateAccountData>({
    resolver: yupResolver(CreateAccountFormSchema),
    mode: 'onChange',
  });


  useEffect(() => {
    if (!open) {
      reset();
      setError(null);
      setTabValue('1');
    }
   
  }, [open, reset]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const onSubmit = async (data: ICreateAccountData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await registerUser(
        {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          designation: data.designation,
          contactNumber: data.contactNumber,
        },
        role
      );
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleBulkSubmit = async (rows: any[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Process each row and create accounts
      const results = await Promise.allSettled(
        rows.map((row) =>
          registerUser(
            {
              email: row.email || '',
              firstName: row.firstName || row['First Name'] || '',
              lastName: row.lastName || row['Last Name'] || '',
              designation: row.designation || row['Designation'] || '',
              contactNumber: row.contactNumber || row['Contact Number'] || String(row['Contact Number'] || ''),
            },
            role
          )
        )
      );

      const failed = results.filter((r) => r.status === 'rejected');
      if (failed.length > 0) {
        setError(`${failed.length} out of ${rows.length} accounts failed to create.`);
      } else {
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create bulk accounts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkReset = () => {
    setError(null);
  };

  return (
    <PopupLayout open={open} title={title} onClose={onClose} maxWidth='xs'>
      <TabContext value={tabValue}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleTabChange} aria-label="account creation tabs">
            <Tab label="Individual Creation" value="1" />
            <Tab label="Bulk Creation" value="2" />
          </TabList>
        </Box>
        <TabPanel value="1">
          <CreateAccountForm
            register={register}
            errors={errors}
            isValid={isValid}
            isLoading={isLoading}
            error={error}
            handleCancel={handleCancel}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
          />
        </TabPanel>
        <TabPanel value="2">
          <BulkAccountForm
            isLoading={isLoading}
            onSubmit={handleBulkSubmit}
            onReset={handleBulkReset}
          />
          {error && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'error.light',
                color: 'error.contrastText',
                borderRadius: 1,
                textAlign: 'center',
              }}
            >
              {error}
            </Box>
          )}
        </TabPanel>
      </TabContext>
    </PopupLayout>
  );
}
export default CreateAccountPopUp;
