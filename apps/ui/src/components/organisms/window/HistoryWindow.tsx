import { useState, useMemo } from 'react';
import WindowLayout from '../../templates/other/WindowLayout'
import { Box, Alert } from '@mui/material'
import HistoryTable from '../table/HistoryTable'
import { useHistory } from '../../../hooks/history'
import { BaseBtn } from '../../atoms';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import HistoryFilterPopover from '../popover/HistoryFilterPopover';

function HistoryWindow() {
  const { history, isLoading, error } = useHistory();
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [activeFilters, setActiveFilters] = useState({ entityType: 'all', actionCategory: 'all' });

  const isFilterOpen = Boolean(filterAnchorEl);

  // Filter history based on active filters
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const entityMatch = activeFilters.entityType === 'all' || item.entityType === activeFilters.entityType;
      
      // Check if description contains the action category
      let actionMatch = activeFilters.actionCategory === 'all';
      if (!actionMatch && item.description) {
        const desc = item.description.toLowerCase();
        switch (activeFilters.actionCategory) {
          case 'CREATED':
            actionMatch = desc.includes('created');
            break;
          case 'UPDATED':
            actionMatch = desc.includes('updated');
            break;
          case 'STATUS_CHANGED':
            actionMatch = desc.includes('status changed');
            break;
          case 'SUPERVISOR_CHANGED':
            actionMatch = desc.includes('supervisor changed');
            break;
          case 'MEMBER_ADDED':
            actionMatch = desc.includes('added') && (desc.includes('employee') || desc.includes('member'));
            break;
          case 'MEMBER_REMOVED':
            actionMatch = desc.includes('removed') && (desc.includes('employee') || desc.includes('member'));
            break;
          case 'PASSWORD_CHANGED':
            actionMatch = desc.includes('password changed');
            break;
          default:
            actionMatch = true;
        }
      }
      
      return entityMatch && actionMatch;
    });
  }, [history, activeFilters]);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleCloseFilter = () => {
    setFilterAnchorEl(null);
  };

  const handleApplyFilter = (filters: { entityType: string; actionCategory: string }) => {
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
        <HistoryTable rows={filteredHistory} isLoading={isLoading} />
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