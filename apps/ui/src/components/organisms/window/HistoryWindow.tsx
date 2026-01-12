import { useState, useEffect } from 'react';
import WindowLayout from '../../templates/other/WindowLayout'
import { Box, Alert } from '@mui/material'
import HistoryTable from '../table/HistoryTable'
import { useHistory } from '../../../hooks/history'
import { BaseBtn } from '../../atoms';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import HistoryFilterPopover from '../popover/HistoryFilterPopover';
import { useAuth } from '../../../contexts/AuthContext';
import { UserRole } from '@tms/shared';

function HistoryWindow() {
  const { history, isLoading, error, loadHistory } = useHistory();
  const { user } = useAuth();
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [activeFilters, setActiveFilters] = useState({ entityType: 'all', startDate: '', endDate: '' });

  const isFilterOpen = Boolean(filterAnchorEl);

  // Load history when filters change
  useEffect(() => {
    const params: any = { limit: 50 };
    
    if (activeFilters.entityType !== 'all') {
      params.entityType = activeFilters.entityType;
    }
    
    if (activeFilters.startDate) {
      params.startDate = activeFilters.startDate;
    }
    
    if (activeFilters.endDate) {
      params.endDate = activeFilters.endDate;
    }

    // Exclude SuperAdmin history for Admin and SupervisorAdmin users
    if (user?.role === UserRole.Admin || user?.role === UserRole.SupervisorAdmin) {
      params.excludeSuperAdmin = 'true';
    }
    
    loadHistory(params);
  }, [activeFilters, loadHistory, user?.role]);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleCloseFilter = () => {
    setFilterAnchorEl(null);
  };

  const handleApplyFilter = (filters: { entityType: string; startDate: string; endDate: string }) => {
    setActiveFilters(filters);
    handleCloseFilter();
  };

  return (
    <>
      <WindowLayout title="History" buttons={<BaseBtn variant='outlined' startIcon={<FilterAltOutlinedIcon/>} onClick={handleFilterClick}>Filter</BaseBtn>}>
        {error && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
        <HistoryTable rows={history} isLoading={isLoading} />
      </WindowLayout>
      <HistoryFilterPopover
        anchorEl={filterAnchorEl}
        open={isFilterOpen}
        onClose={handleCloseFilter}
        onApplyFilter={handleApplyFilter}
      />
    </>
  )
}

export default HistoryWindow;