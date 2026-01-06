import { useState, useEffect, useMemo } from 'react';
import WindowLayout from '../../templates/other/WindowLayout';
import AccountTable from '../table/AccountTable';
import { BaseBtn } from '../../atoms';
import AddIcon from '@mui/icons-material/Add';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import CreateAccountPopUp from '../../organisms/popup/CreateAccountPopup';
import EditAccountPopup from '../../organisms/popup/EditAccountPopup';
import ProfilePopup from '../../organisms/popup/ProfilePopup';
import AccountFilterPopover from '../popover/AccountFilterPopover';
import { UserRole, User } from '@tms/shared';
import { useAccount } from '../../../hooks/account';
import { IAccountTableRow } from '../../../interfaces/component/organism/ITable';
import { IAccountWindowProps } from '../../../interfaces/component/organism/IWindow';
import AppSnackbar from '../../molecules/other/AppSnackbar';
import { useSnackbar } from '../../../hooks/useSnackbar';
import ConformationDailog from '../../molecules/other/ConformationDailog';
import ToggleOffOutlinedIcon from '@mui/icons-material/ToggleOffOutlined';
import ToggleOnOutlinedIcon from '@mui/icons-material/ToggleOnOutlined';
import { useAuth } from '../../../contexts/AuthContext';

function AccountWindow({ roleToCreate = UserRole.Emp }: IAccountWindowProps) {
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<IAccountTableRow | null>(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState<User | null>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [activeFilters, setActiveFilters] = useState({ role: 'all', status: 'all' });
  const { newAccountDetails, loadAccounts, updateAccount } = useAccount();
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [accountToToggle, setAccountToToggle] = useState<IAccountTableRow | null>(null);
  const { user: currentUser } = useAuth();

  const isFilterOpen = Boolean(filterAnchorEl);

  // Filter accounts based on active filters
  const filteredAccounts = useMemo(() => {
    return newAccountDetails.filter((account) => {
      const roleMatch = activeFilters.role === 'all' || account.role === activeFilters.role;
      const statusMatch = activeFilters.status === 'all' || account.status === activeFilters.status;
      return roleMatch && statusMatch;
    });
  }, [newAccountDetails, activeFilters]);

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleClick = () => {
    setIsCreatePopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsCreatePopupOpen(false);
  };

  const handleCreateSuccess = () => {
    // Refresh account table data
    loadAccounts();
    showSuccess('Account created successfully');
  };

  const handleEditRow = (row: IAccountTableRow) => {
    // Prevent non-SuperAdmins from editing SuperAdmin accounts
    if (row.role === UserRole.SuperAdmin && currentUser?.role !== UserRole.SuperAdmin) {
      showError('You do not have permission to edit Super Admin accounts');
      return;
    }
    setSelectedAccount(row);
    setIsEditPopupOpen(true);
  };

  const handleCloseEditPopup = () => {
    setIsEditPopupOpen(false);
    setSelectedAccount(null);
  };

  const handleEditSuccess = () => {
    // Refresh account table data
    loadAccounts();
    showSuccess('Account updated successfully');
  };

  const handleRowClick = (row: IAccountTableRow) => {
    // Convert IAccountTableRow to User format
    const userProfile: User = {
      _id: row.id,
      employee_id: row.employee_id || '',
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      designation: row.designation || '',
      contactNumber: row.contactNumber,
      role: row.role as UserRole || UserRole.Emp,
      status: row.status === 'Active',
      isChangedPwd: true,
    };
    setSelectedUserProfile(userProfile);
    setIsProfilePopupOpen(true);
  };

  const handleCloseProfilePopup = () => {
    setIsProfilePopupOpen(false);
    setSelectedUserProfile(null);
  };

  const handleDelete = async (id: string) => {
    // Find the account to get its current data
    const account = newAccountDetails.find(acc => acc.id === id);
    if (account) {
      // Prevent non-SuperAdmins from deactivating SuperAdmin accounts
      if (account.role === UserRole.SuperAdmin && currentUser?.role !== UserRole.SuperAdmin) {
        showError('You do not have permission to modify Super Admin accounts');
        return;
      }
      setAccountToToggle(account);
      setIsStatusDialogOpen(true);
    }
  };

  const handleConfirmStatusToggle = async () => {
    setIsStatusDialogOpen(false);
    if (!accountToToggle) {
      return;
    }

    try {
      // Toggle the status: if Active, make Inactive; if Inactive, make Active
      const newStatus = accountToToggle.status === 'Active' ? 'Inactive' : 'Active';
      
      await updateAccount(accountToToggle.id!, {
        designation: accountToToggle.designation || '',
        contactNumber: accountToToggle.contactNumber || '',
        status: newStatus,
      });
      loadAccounts();
      showSuccess(`Account status changed to ${newStatus} successfully`);
    } catch (error) {
      console.error('Failed to update account status:', error);
      showError('Failed to update account status. Please try again.');
    } finally {
      setAccountToToggle(null);
    }
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleCloseFilter = () => {
    setFilterAnchorEl(null);
  };

  const handleApplyFilter = (filters: { role: string; status: string }) => {
    setActiveFilters(filters);
    handleCloseFilter();
  };

  const button = (
    <>
      <BaseBtn startIcon={<FilterAltOutlinedIcon />} variant='outlined' onClick={handleFilterClick}>Filter</BaseBtn>
      <BaseBtn startIcon={<AddIcon />} onClick={handleClick}>Create</BaseBtn>
    </>
  );
  
  return (
    <>
      <WindowLayout title="Accounts" buttons={button}>
        <AccountTable 
          rows={filteredAccounts} 
          onEditRow={handleEditRow} 
          onDelete={handleDelete}
          onRowClick={handleRowClick}
          currentUserRole={currentUser?.role}
        />
      </WindowLayout>
      <CreateAccountPopUp
        open={isCreatePopupOpen}
        role={roleToCreate}
        onClose={handleClosePopup}
        onSuccess={handleCreateSuccess}
      />
      <EditAccountPopup
        open={isEditPopupOpen}
        accountData={selectedAccount}
        onClose={handleCloseEditPopup}
        onSuccess={handleEditSuccess}
      />
      <ProfilePopup
        open={isProfilePopupOpen}
        onClose={handleCloseProfilePopup}
        user={selectedUserProfile}
      />
      <AccountFilterPopover
        anchorEl={filterAnchorEl}
        open={isFilterOpen}
        onClose={handleCloseFilter}
        onApplyFilter={handleApplyFilter}
      />
      <AppSnackbar snackbar={snackbar} onClose={hideSnackbar} />
      <ConformationDailog
        open={isStatusDialogOpen}
        title={accountToToggle?.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}
        message={
          accountToToggle?.status === 'Active'
            ? `Are you sure you want to deactivate "${accountToToggle.firstName} ${accountToToggle.lastName}"? This will prevent the user from accessing the system.`
            : `Are you sure you want to activate "${accountToToggle?.firstName} ${accountToToggle?.lastName}"? This will allow the user to access the system.`
        }
        confirmText={accountToToggle?.status === 'Active' ? 'Deactivate' : 'Activate'}
        cancelText="Cancel"
        icon={accountToToggle?.status === 'Active' ? <ToggleOffOutlinedIcon /> : <ToggleOnOutlinedIcon />}
        confirmButtonColor={accountToToggle?.status === 'Active' ? 'warning' : 'success'}
        onConfirm={handleConfirmStatusToggle}
        onCancel={() => {
          setIsStatusDialogOpen(false);
          setAccountToToggle(null);
        }}
      />
    </>
  );
}

export default AccountWindow;
