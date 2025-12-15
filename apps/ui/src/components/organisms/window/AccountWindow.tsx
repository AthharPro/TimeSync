import { useState } from 'react';
import WindowLayout from '../../templates/other/WindowLayout';
import AccountTable from '../table/AccountTable';
import { BaseBtn } from '../../atoms';
import AddIcon from '@mui/icons-material/Add';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import CreateAccountPopUp from '../../organisms/popup/CreateAccountPopUp';
import { UserRole } from '@tms/shared';

function AccountWindow() {
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);

  const handleClick = () => {
    setIsCreatePopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsCreatePopupOpen(false);
  };

  const handleCreateSuccess = () => {
    // TODO: Refresh account table data
    console.log('Account created successfully');
  };

  const button = (
    <>
      <BaseBtn startIcon={<FilterAltOutlinedIcon />} variant='outlined'>Filter</BaseBtn>
      <BaseBtn startIcon={<AddIcon />} onClick={handleClick}>Create</BaseBtn>
    </>
  );
  return (
    <>
      <WindowLayout title="Accounts" buttons={button}>
        <AccountTable rows={[]} />
      </WindowLayout>
      <CreateAccountPopUp
        open={isCreatePopupOpen}
        role={UserRole.Emp}
        onClose={handleClosePopup}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}

export default AccountWindow;
