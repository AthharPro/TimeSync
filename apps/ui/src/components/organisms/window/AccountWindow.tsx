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

function AccountWindow() {
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<IAccountTableRow | null>(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState<User | null>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [activeFilters, setActiveFilters] = useState({ role: 'all', status: 'all' });
  const { newAccountDetails, loadAccounts, updateAccount } = useAccount();

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
    console.log('Account created successfully');
  };

  const handleEditRow = (row: IAccountTableRow) => {
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
    console.log('Account updated successfully');
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
    try {
      // Find the account to get its current data
      const account = newAccountDetails.find(acc => acc.id === id);
      if (account) {
        // Toggle the status: if Active, make Inactive; if Inactive, make Active
        const newStatus = account.status === 'Active' ? 'Inactive' : 'Active';
        
        await updateAccount(id, {
          designation: account.designation,
          contactNumber: account.contactNumber,
          status: newStatus,
        });
        loadAccounts();
        console.log(`Account status changed to ${newStatus} successfully`);
      }
    } catch (error) {
      console.error('Failed to update account status:', error);
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
        />
      </WindowLayout>
      <CreateAccountPopUp
        open={isCreatePopupOpen}
        role={UserRole.Emp}
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
    </>
  );
}

export default AccountWindow;
