import WindowLayout from '../../templates/other/WindowLayout';
import { BaseBtn } from '../../atoms';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import ReviewTimesheetTable from '../table/ReviewTimesheetTable';

function ReviewTimesheetWindow() {
  const handleFilter = () => {
    // TODO: Implement filter functionality
    console.log('Filter clicked');
  };

  const buttons = (
    <BaseBtn
      variant="outlined"
      startIcon={<FilterAltOutlinedIcon />}
      onClick={handleFilter}
    >
      Filter
    </BaseBtn>
  );

  return (
    <WindowLayout title="Review Timesheet" buttons={buttons}>
      <ReviewTimesheetTable />
    </WindowLayout>
  );
}

export default ReviewTimesheetWindow;
