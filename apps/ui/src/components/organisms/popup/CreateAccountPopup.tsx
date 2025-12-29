import PopupLayout from '../../templates/popup/PopUpLayout';
import { UserRole } from '@tms/shared';
import { useEffect, useState } from 'react';
import CreateAccountFormSchema from '../../../validations/auth/CreateAccountFormSchema';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Typography } from '@mui/material';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { ICreateAccountData } from '../../../interfaces/auth/IAuth';
import { CreateAccountPopupProps } from '../../../interfaces/popup';
import { bulkRegisterUsers } from '../../../api/auth';
import { CreateAccountForm, BulkAccountForm } from '../../molecules/account';
import { useAccount } from '../../../hooks/account';

function CreateAccountPopUp({
  open,
  role,
  onClose,
  onSuccess,
}: CreateAccountPopupProps) {
  const title = `${
    role === UserRole.Admin ? 'Create Admin' : 'Create Employee'
  }`;
  const [tabValue, setTabValue] = useState<string>('1');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { createAccount } = useAccount();
  const [bulkErrors, setBulkErrors] = useState<
    { email: string; message: string }[]
  >([]);

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
      await createAccount(
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
      setError(
        err?.response?.data?.message ||
          'Failed to create account. Please try again.'
      );
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
    setBulkErrors([]);

    try {
      const formattedRows = rows.map((row) => ({
        email: row.email || row['Email'],
        firstName: row.firstName || row['First Name'],
        lastName: row.lastName || row['Last Name'],
        designation: row.designation || row['Designation'],
        contactNumber: String(row.contactNumber || row['Contact Number'] || ''),
      }));

      const res = await bulkRegisterUsers(formattedRows, role);

      const { success, failed, errors } = res.data.results;

      if (failed > 0) {
        setError(
          `${failed} account(s) failed. ${success} created successfully.`
        );
        setBulkErrors(errors);
      } else {
        onSuccess?.();
        onClose();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Bulk creation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkReset = () => {
    setError(null);
  };

  return (
    <PopupLayout open={open} title={title} onClose={onClose} maxWidth="xs">
      <TabContext value={tabValue}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList
            onChange={handleTabChange}
            aria-label="account creation tabs"
          >
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
          {bulkErrors.length > 0 && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 1,
                bgcolor: 'error.lighter',
                border: '1px solid',
                borderColor: 'error.light',
              }}
            >
              <Typography variant="subtitle2" color="error.main" mb={1}>
                {bulkErrors.length} account(s) failed to create
              </Typography>

              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                {bulkErrors.map((err, index) => (
                  <Typography
                    component="li"
                    key={index}
                    variant="body2"
                    color="error.dark"
                    sx={{ mb: 0.5 }}
                  >
                    <strong>{err.email || `Row ${index + 1}`}</strong> —{' '}
                    {(err.message)}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}
        </TabPanel>
      </TabContext>
    </PopupLayout>
  );
}
export default CreateAccountPopUp;
