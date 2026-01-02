import { useState, useCallback, useMemo, useEffect } from 'react';
import WindowLayout from '../../templates/other/WindowLayout';
import { BaseBtn } from '../../atoms';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import ReviewTimesheetTable from '../table/ReviewTimesheetTable';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import RejectReasonDialog from '../dialog/RejectReasonDialog';
import { useReviewTimesheet } from '../../../hooks/timesheet';
import { useMyProjects } from '../../../hooks/project/useMyProject';
import { useTeam } from '../../../hooks/team';
import ReviewTimesheetFilterPopover, { ReviewTimesheetFilters } from '../popover/ReviewTimesheetFilterPopover';
import EditRequestFilterPopover, { EditRequestFilterOptions } from '../popover/EditRequestFilterPopover';
import dayjs from 'dayjs';
import { useWindowNavigation } from '../../../hooks/useWindowNavigation';
import AppSnackbar from '../../molecules/other/AppSnackbar';
import { useSnackbar } from '../../../hooks/useSnackbar';
import ConformationDailog from '../../molecules/other/ConformationDailog';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import { Box } from '@mui/material';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import EditRequestTable from '../table/EditRequestTable';

function ReviewTimesheetWindow() {
  const { approveSelectedTimesheets, rejectSelectedTimesheets } = useReviewTimesheet();
  const { myProjects, loadMyProjects } = useMyProjects();
  const { allSupervisedTeams, loadAllSupervisedTeams } = useTeam();
  const { reviewTimesheetParams, setReviewTimesheetParams } = useWindowNavigation();
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
  
  const [selectedTimesheetIds, setSelectedTimesheetIds] = useState<string[]>([]);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [initialEmployeeId, setInitialEmployeeId] = useState<string | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState('1');

  // Load projects and teams on mount
  useEffect(() => {
    loadMyProjects();
    loadAllSupervisedTeams();
  }, [loadMyProjects, loadAllSupervisedTeams]);

  // Get supervised project and team IDs
  const supervisedProjectIds = useMemo(() => {
    const ids = myProjects.map(p => p._id);
    console.log('Supervised Project IDs:', ids);
    return ids;
  }, [myProjects]);
  
  const supervisedTeamIds = useMemo(() => {
    const ids = allSupervisedTeams.map(t => t.id);
    console.log('===== SUPERVISED TEAMS DEBUG =====');
    console.log('All Supervised Teams:', allSupervisedTeams);
    console.log('Supervised Team IDs:', ids);
    console.log('Count:', ids.length);
    return ids;
  }, [allSupervisedTeams]);

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
  const [editRequestFilters, setEditRequestFilters] = useState<EditRequestFilterOptions>({ status: 'All' });

  // Handle navigation from notification
  useEffect(() => {
    if (reviewTimesheetParams) {
      const { employeeId, month, status } = reviewTimesheetParams;
      
      // Set initial employee ID to auto-open drawer
      if (employeeId) {
        setInitialEmployeeId(employeeId);
      }
      
      // Apply filters based on notification params
      if (month || status) {
        const newFilters = { ...filters };
        
        if (month) {
          const monthDate = dayjs(month, 'YYYY-MM');
          newFilters.month = month;
          newFilters.year = monthDate.format('YYYY');
          newFilters.startDate = monthDate.startOf('month').format('YYYY-MM-DD');
          newFilters.endDate = monthDate.endOf('month').format('YYYY-MM-DD');
        }
        
        if (status) {
          newFilters.status = status as any;
        }
        
        setFilters(newFilters);
      }
      
      // Clear the params after processing
      setReviewTimesheetParams(null);
    }
  }, [reviewTimesheetParams, setReviewTimesheetParams]);

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

  const handleApplyEditRequestFilters = (newFilters: EditRequestFilterOptions) => {
    setEditRequestFilters(newFilters);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const handleApprove = async () => {
    if (selectedTimesheetIds.length === 0) {
      showError('Please select at least one timesheet to approve.');
      return;
    }

    if (!currentEmployeeId) {
      showError('No employee selected.');
      return;
    }

    setIsApproveDialogOpen(true);
  };

  const handleConfirmApprove = async () => {
    setIsApproveDialogOpen(false);
    if (!currentEmployeeId) {
      return;
    }

    try {
      const result = await approveSelectedTimesheets(currentEmployeeId, selectedTimesheetIds);
      showSuccess(`Successfully approved ${result.approved} timesheet${result.approved > 1 ? 's' : ''}`);
    } catch (error: any) {
      showError(`Failed to approve timesheets: ${error.message || 'Unknown error'}`);
    }
  };

  const handleReject = () => {
    if (selectedTimesheetIds.length === 0) {
      showError('Please select at least one timesheet to reject.');
      return;
    }

    if (!currentEmployeeId) {
      showError('No employee selected.');
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
      showSuccess(`Successfully rejected ${result.rejected} timesheet${result.rejected > 1 ? 's' : ''}`);
    } catch (error: any) {
      showError(`Failed to reject timesheets: ${error.message || 'Unknown error'}`);
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
        <TabContext value={tabValue}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Header Row */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
              }}
            >
              {/* Tab List - Left Corner */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList onChange={handleTabChange} aria-label="review timesheet tabs">
                  <Tab label="Review" value="1" />
                  <Tab label="Edit Request" value="2" />
                </TabList>
              </Box>
            </Box>

            {/* Tab Panels */}
            <Box sx={{ width: '100%' }}>
              <TabPanel value="1" sx={{ padding: 0 }}>
                <ReviewTimesheetTable 
                  onSelectedTimesheetsChange={handleSelectedTimesheetsChange}
                  filters={filters}
                  supervisedProjectIds={supervisedProjectIds}
                  supervisedTeamIds={supervisedTeamIds}
                  initialEmployeeId={initialEmployeeId}
                />
              </TabPanel>
              <TabPanel value="2" sx={{ padding: 0 }}>
                {/* Edit Request Content */}
                <EditRequestTable 
                  statusFilter={editRequestFilters.status}
                  onStatusFilterChange={(newStatus) => setEditRequestFilters({ status: newStatus })}
                />
              </TabPanel>
            </Box>
          </Box>
        </TabContext>
      </WindowLayout>

      {tabValue === '1' && (
        <ReviewTimesheetFilterPopover
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
          onApplyFilters={handleApplyFilters}
          currentFilters={filters}
        />
      )}

      {tabValue === '2' && (
        <EditRequestFilterPopover
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
          onApplyFilters={handleApplyEditRequestFilters}
          currentFilters={editRequestFilters}
        />
      )}

      <RejectReasonDialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        onConfirm={handleRejectConfirm}
        timesheetCount={selectedTimesheetIds.length}
      />
      <AppSnackbar snackbar={snackbar} onClose={hideSnackbar} />
      <ConformationDailog
        open={isApproveDialogOpen}
        title="Approve Timesheets"
        message={`Are you sure you want to approve ${selectedTimesheetIds.length} timesheet${selectedTimesheetIds.length > 1 ? 's' : ''}?`}
        confirmText="Approve"
        cancelText="Cancel"
        icon={<ThumbUpOutlinedIcon />}
        confirmButtonColor="success"
        onConfirm={handleConfirmApprove}
        onCancel={() => setIsApproveDialogOpen(false)}
      />
    </>
  );
}

export default ReviewTimesheetWindow;
