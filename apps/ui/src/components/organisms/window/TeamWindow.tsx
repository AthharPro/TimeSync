import WindowLayout from '../../templates/other/WindowLayout';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import AddIcon from '@mui/icons-material/Add';
import { BaseBtn } from '../../atoms';
import DataTable from '../../templates/other/DataTable';
import { ITeam } from '../../../interfaces/team/ITeam';
import { DataTableColumn } from '../../../interfaces/layout/ITableProps';
import { useMemo, useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import ActionButton from '../../molecules/other/ActionButton';
import CreateTeamPopUp from '../../organisms/popup/CreateTeamPopUp';
import TeamStaffManager from '../team/TeamStaffManager';
import ConformationDailog from '../../molecules/other/ConformationDailog';
import ViewTeamMembers from '../team/ViewTeamMembers';
import { useTeam } from '../../../hooks/team';
function TeamWindow() {
  const { teams, loading, loadAllTeams, deleteTeam } = useTeam();
  const [viewTeam, setViewTeam] = useState<ITeam | null>(null);
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<ITeam | null>(null);
  const [isStaffManagerOpen, setIsStaffManagerOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<ITeam | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  const handleFilter = () => {
    // TODO: Implement filter functionality
  };

  const handleAddProject = () => {
    // TODO: Implement add project functionality
  };
  const handleEditTeam = (team: ITeam) => {
    setEditingTeam(team);
    setIsStaffManagerOpen(true);
  };

  const handleCloseStaffManager = () => {
    setIsStaffManagerOpen(false);
    setEditingTeam(null);
  };

  const handleTeamStaffSaved = () => {
    // Refresh teams after save
    loadAllTeams();
    handleCloseStaffManager();
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
      } catch (error) {
        console.error('Failed to delete team:', error);
      }
    }
    setIsDeleteDialogOpen(false);
    setTeamToDelete(null);
  };
  
  const handleTeamCreated = () => {
    // Refresh teams after creation
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
        onClick={handleFilter}
      >
        Filter
      </BaseBtn>
      <BaseBtn startIcon={<AddIcon />} onClick={handleOpenPopup}>
        Team
      </BaseBtn>
    </>
  );

  // Filter teams to only show active teams (status=true)
  const activeTeams = useMemo(
    () => teams.filter(team => team.status !== false),
    [teams]
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
        <DataTable columns={columns} rows={activeTeams} getRowKey={(row) => row.id} />
      </WindowLayout>
      <CreateTeamPopUp
        open={isCreatePopupOpen}
        onClose={handleClosePopup}
        onTeamCreated={handleTeamCreated}
      />
      {editingTeam && (
        <TeamStaffManager
          open={isStaffManagerOpen}
          onClose={handleCloseStaffManager}
          teamId={editingTeam.id}
          initialMembers={editingTeam.members}
          initialSupervisor={editingTeam.supervisor}
          onSaved={handleTeamStaffSaved}
        />
      )}
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
    </>
    
  );
}

export default TeamWindow;
