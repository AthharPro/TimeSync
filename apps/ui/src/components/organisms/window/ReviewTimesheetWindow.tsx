import { useState, useCallback, useMemo } from 'react';
import WindowLayout from '../../templates/other/WindowLayout';
import { BaseBtn } from '../../atoms';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import ReviewTimesheetTable from '../table/ReviewTimesheetTable';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import RejectReasonDialog from '../dialog/RejectReasonDialog';
import { useReviewTimesheet } from '../../../hooks/timesheet';
import ReviewTimesheetFilterPopover, { ReviewTimesheetFilters } from '../popover/ReviewTimesheetFilterPopover';
import dayjs from 'dayjs';

function ReviewTimesheetWindow() {
  const { approveSelectedTimesheets, rejectSelectedTimesheets } = useReviewTimesheet();
  const [selectedTimesheetIds, setSelectedTimesheetIds] = useState<string[]>([]);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);

  // Default filters: current month
  const defaultFilters = useMemo(() => {
    const now = dayjs();
    const year = now.format('YYYY');
    const month = now.format('YYYY-MM');
    const startDate = now.startOf('month').format('YYYY-MM-DD');
    const endDate = now.endOf('month').format('YYYY-MM-DD');
    
    return {
      startDate,
      endDate,
      month,
      year,
      status: 'All' as const,
      filterBy: 'all' as const,
      projectId: 'All',
      teamId: 'All',
    };
  }, []);

  const [filters, setFilters] = useState<ReviewTimesheetFilters>(defaultFilters);

  const handleSelectedTimesheetsChange = useCallback((employeeId: string, timesheetIds: string[]) => {
    setSelectedTimesheetIds(timesheetIds);
    setCurrentEmployeeId(employeeId);
  }, []);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleApplyFilters = (newFilters: ReviewTimesheetFilters) => {
    setFilters(newFilters);
    // Filters will be passed to ReviewTimesheetTable component
  };

  const handleApprove = async () => {
    if (selectedTimesheetIds.length === 0) {
      alert('Please select at least one timesheet to approve.');
      return;
    }

    if (!currentEmployeeId) {
      alert('No employee selected.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to approve ${selectedTimesheetIds.length} timesheet${selectedTimesheetIds.length > 1 ? 's' : ''}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const result = await approveSelectedTimesheets(currentEmployeeId, selectedTimesheetIds);
      alert(`Successfully approved ${result.approved} timesheet${result.approved > 1 ? 's' : ''}`);
    } catch (error: any) {
      alert(`Failed to approve timesheets: ${error.message || 'Unknown error'}`);
    }
  };

  const handleReject = () => {
    if (selectedTimesheetIds.length === 0) {
      alert('Please select at least one timesheet to reject.');
      return;
    }

    if (!currentEmployeeId) {
      alert('No employee selected.');
      return;
    }

    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!currentEmployeeId) {
      return;
    }

    try {
      const result = await rejectSelectedTimesheets(currentEmployeeId, selectedTimesheetIds, reason);
      alert(`Successfully rejected ${result.rejected} timesheet${result.rejected > 1 ? 's' : ''}`);
    } catch (error: any) {
      alert(`Failed to reject timesheets: ${error.message || 'Unknown error'}`);
    }
  };

  const buttons = (
    <>
        <BaseBtn
      variant="outlined"
      startIcon={<ThumbUpAltOutlinedIcon />}
      onClick={handleApprove}
      disabled={selectedTimesheetIds.length === 0}
    >
      Approve
       </BaseBtn>
               <BaseBtn
      variant="outlined"
      startIcon={<ThumbDownAltOutlinedIcon />}
      onClick={handleReject}
      disabled={selectedTimesheetIds.length === 0}
    >
      Reject
       </BaseBtn>
    <BaseBtn
      variant="outlined"
      startIcon={<FilterAltOutlinedIcon />}
      onClick={handleFilterClick}
    >
      Filter
    </BaseBtn>
    </>
  );

  return (
    <>
      <WindowLayout title="Review Timesheet" buttons={buttons}>
        <ReviewTimesheetTable 
          onSelectedTimesheetsChange={handleSelectedTimesheetsChange}
          filters={filters}
        />
      </WindowLayout>

      <ReviewTimesheetFilterPopover
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />

      <RejectReasonDialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        onConfirm={handleRejectConfirm}
        timesheetCount={selectedTimesheetIds.length}
      />
    </>
  );
}

export default ReviewTimesheetWindow;
