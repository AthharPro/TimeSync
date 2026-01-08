import WindowLayout from '../../templates/other/WindowLayout';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import AddIcon from '@mui/icons-material/Add';
import { BaseBtn } from '../../atoms';
import StatusChip from '../../atoms/other/Icon/StatusChip';
import DataTable from '../../templates/other/DataTable';
import { ITeam } from '../../../interfaces/team/ITeam';
import { DataTableColumn } from '../../../interfaces/layout/ITableProps';
import { useMemo, useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import ActionButton from '../../molecules/other/ActionButton';
import CreateTeamPopUp from '../../organisms/popup/CreateTeamPopUp';
import EditTeamPopup from '../../organisms/popup/EditTeamPopup';
import ConformationDailog from '../../molecules/other/ConformationDailog';
import ViewTeamMembers from '../team/ViewTeamMembers';
import { useTeam } from '../../../hooks/team';
import AppSnackbar from '../../molecules/other/AppSnackbar';
import { useSnackbar } from '../../../hooks/useSnackbar';
import TeamFilterPopover from '../popover/TeamFilterPopover';

function TeamWindow() {
  const { teams, loading, loadAllTeams, deleteTeam } = useTeam();
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
  const [viewTeam, setViewTeam] = useState<ITeam | null>(null);
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<ITeam | null>(null);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<ITeam | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [activeFilters, setActiveFilters] = useState({ supervisor: 'all', status: 'all' });

  const isFilterOpen = Boolean(filterAnchorEl);

  // Load teams on mount
  useEffect(() => {
    loadAllTeams();
  }, [loadAllTeams]);

  const handleClosePopup = () => {
    setIsCreatePopupOpen(false);
  };

  const handleOpenPopup = () => {
    setIsCreatePopupOpen(true);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleCloseFilter = () => {
    setFilterAnchorEl(null);
  };

  const handleApplyFilter = (filters: { supervisor: string; status: string }) => {
    setActiveFilters(filters);
    handleCloseFilter();
  };

  const handleEditTeam = (team: ITeam) => {
    setEditingTeam(team);
    setIsEditPopupOpen(true);
  };

  const handleCloseEditPopup = () => {
    setIsEditPopupOpen(false);
    setEditingTeam(null);
  };

  const handleTeamSaved = () => {
    // Refresh teams after save
    showSuccess('Team updated successfully');
    loadAllTeams();
    handleCloseEditPopup();
  };
  
  const handleDeleteTeam = (team: ITeam) => {
    setTeamToDelete(team);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (teamToDelete) {
      try {
        await deleteTeam(teamToDelete.id);
        await loadAllTeams(); // Refresh the list
        showSuccess('Team deleted successfully');
      } catch (error) {
        console.error('Failed to delete team:', error);
        showError('Failed to delete team. Please try again.');
      }
    }
    setIsDeleteDialogOpen(false);
    setTeamToDelete(null);
  };
  
  const handleTeamCreated = () => {
    // Refresh teams after creation
    showSuccess('Team created successfully');
    loadAllTeams();
    handleClosePopup();
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setTeamToDelete(null);
  };

  const handleCloseViewTeam = () => {
    setViewTeam(null);
  };

  const theme = useTheme();

  const button = (
    <>
      <BaseBtn
        variant="outlined"
        startIcon={<FilterAltOutlinedIcon />}
        onClick={handleFilterClick}
      >
        Filter
      </BaseBtn>
      <BaseBtn startIcon={<AddIcon />} onClick={handleOpenPopup}>
        Team
      </BaseBtn>
    </>
  );

  // Filter teams based on active filters
  const filteredTeams = useMemo(
    () => teams.filter(team => {
      // Status filter
      const statusMatch = 
        activeFilters.status === 'all' ? team.status !== false :
        activeFilters.status === 'active' ? team.status !== false :
        team.status === false;

      // Supervisor filter
      const supervisorMatch = 
        activeFilters.supervisor === 'all' ? true :
        activeFilters.supervisor === 'with' ? team.supervisor !== null :
        team.supervisor === null;

      return statusMatch && supervisorMatch;
    }),
    [teams, activeFilters]
  );

  const columns: DataTableColumn<ITeam>[] = useMemo(
    () => [
      { label: '', key: 'empty', render: () => null },
      {
        label: 'Team Name',
        key: 'teamName',
        render: (row: ITeam) => row.teamName,
      },
      {
        label: 'Supervisor',
        key: 'supervisorName',
        render: (row: ITeam) =>
          row.supervisor ? (
            row.supervisor.name ? (
              row.supervisor.name
            ) : (
              <span style={{ color: theme.palette.text.secondary }}>
                No supervisor assigned
              </span>
            )
          ) : (
            <span style={{ color: theme.palette.text.secondary }}>
              No supervisor assigned
            </span>
          ),
      },
      {
        label: 'Supervisor Email',
        key: 'supervisorEmail',
        render: (row: ITeam) =>
          row.supervisor?.email || (
            <span style={{ color: theme.palette.text.secondary }}>
              No supervisor assigned
            </span>
          ),
      },
      {
        label: 'Designation',
        key: 'designation',
        render: (row: ITeam) =>
          row.supervisor?.designation || (
            <span style={{ color: theme.palette.text.secondary }}>
              No supervisor assigned
            </span>
          ),
      },
      {
        label: 'Team Members',
        key: 'teamMembers',
        render: (row: ITeam) => (
          <BaseBtn
            variant="outlined"
            size="small"
            onClick={() => setViewTeam(row)}
          >
            View Team
          </BaseBtn>
        ),
      },
      {
        label: 'Status',
        key: 'status',
        render: (row: ITeam) => (
          <StatusChip status={row.status !== false ? 'Active' : 'Inactive'} />
        ),
      },
      {
        label: '',
        key: 'actions',
        render: (row: ITeam) => (
          <ActionButton
            onEdit={() => handleEditTeam(row)}
            onDelete={() => handleDeleteTeam(row)}
          />
        ),
      },
    ],
    [theme, handleEditTeam, handleDeleteTeam]
  );

  return (
    <>
      <WindowLayout title="Team" buttons={button}>
        <DataTable columns={columns} rows={filteredTeams} getRowKey={(row) => row.id} />
      </WindowLayout>
      <CreateTeamPopUp
        open={isCreatePopupOpen}
        onClose={handleClosePopup}
        onTeamCreated={handleTeamCreated}
      />
      <EditTeamPopup
        open={isEditPopupOpen}
        onClose={handleCloseEditPopup}
        team={editingTeam}
        onSaved={handleTeamSaved}
      />
      <ConformationDailog
        open={isDeleteDialogOpen}
        title="Delete Team"
        message={`Are you sure you want to delete "${
          teamToDelete?.teamName || 'this team'
        }"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
      <ViewTeamMembers
        open={viewTeam !== null}
        onClose={handleCloseViewTeam}
        team={viewTeam}
      />
      <TeamFilterPopover
        anchorEl={filterAnchorEl}
        open={isFilterOpen}
        onClose={handleCloseFilter}
        onApplyFilter={handleApplyFilter}
      />
      <AppSnackbar snackbar={snackbar} onClose={hideSnackbar} />
    </>
  );
}

export default TeamWindow;
