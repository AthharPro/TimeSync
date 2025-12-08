import WindowLayout from '../../templates/other/WindowLayout';
import AccountTable from '../table/AccountTable';
import { BaseBtn } from '../../atoms';
import AddIcon from '@mui/icons-material/Add';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
function AccountWindow() {
  const handleClick = () => {
    // TODO: Implement create account functionality
  };

  const button = (
    <>
      <BaseBtn startIcon={<FilterAltOutlinedIcon />} variant='outlined'>Filter</BaseBtn>
      <BaseBtn startIcon={<AddIcon />} onClick={handleClick}>Create</BaseBtn>
    </>
  );
  return (
    <WindowLayout title="Accounts" buttons={button}>
      <AccountTable rows={[]} />
    </WindowLayout>
  );
}

export default AccountWindow;
