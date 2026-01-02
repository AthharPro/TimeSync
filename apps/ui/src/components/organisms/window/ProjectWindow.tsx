import { useState, useMemo, useEffect } from 'react';
import WindowLayout from '../../templates/other/WindowLayout';
import AddIcon from '@mui/icons-material/Add';
import DataTable from '../../templates/other/DataTable';
import { IProject, IProjectManager } from '../../../interfaces/project/IProject';
import { DataTableColumn } from '../../../interfaces/layout/ITableProps';
import ProjectManagerCell from '../../molecules/project/ProjectManagerCell';
import TeamMembersCell from '../../molecules/project/TeamMembersCell';
import DateRangeCell from '../../molecules/project/DateRangeCell';
import ProjectTeamViewPopUp from '../popup/ProjectTeamViewPopUp';
import CreateProjectPopUp from '../popup/CreateProjectPopUp';
import { BaseBtn } from '../../atoms';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import ActionButton from '../../molecules/other/ActionButton';
import ConformationDailog from '../../molecules/other/ConformationDailog';
import ProjectStaffManager from '../project/ProjectStaffManager';
import { useProjects } from '../../../hooks/project/useProjects';
import { Box, CircularProgress, Typography } from '@mui/material';
import AppSnackbar from '../../molecules/other/AppSnackbar';
import { useSnackbar } from '../../../hooks/useSnackbar';
import StatusChip from '../../atoms/other/Icon/StatusChip';

function ProjectWindow() {
  const { projects, loading: isLoading, error, loadProjects, deleteProject } = useProjects();
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();

  
  const [selectedProject, setSelectedProject] = useState<IProject | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<IProject | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStaffManagerOpen, setIsStaffManagerOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<IProject | null>(null);

  // Load projects on component mount
  useEffect(() => {
    loadProjects().catch((err) => {
      console.error('ProjectWindow: Error loading projects:', err);
    });
  }, [loadProjects]);

  const handleEdit = (project: IProject) => {
    setProjectToEdit(project);
    setIsStaffManagerOpen(true);
  };

  const handleDelete = (project: IProject) => {
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  };

  const handleViewTeam = (project: IProject) => {
    setSelectedProject(project);
    setIsTeamModalOpen(true);
  };

  const handleCloseTeamModal = () => {
    setIsTeamModalOpen(false);
    setSelectedProject(null);
  };

  const handleAddProject = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCloseStaffManager = () => {
    setIsStaffManagerOpen(false);
    setProjectToEdit(null);
  };

  const handleStaffSaved = () => {
    showSuccess('Project staff updated successfully');
    // Refresh project data after staff update
    loadProjects();
  };

  const handleFilter = () => {
    // TODO: Implement filter functionality
  };

  const handleConfirmDelete = async () => {
    if (projectToDelete) {
      try {
        await deleteProject(projectToDelete.id);
        setIsDeleteDialogOpen(false);
        setProjectToDelete(null);
        showSuccess('Project deleted successfully');
        // Projects are automatically updated in Redux store
      } catch (error) {
        console.error('Failed to delete project:', error);
        showError('Failed to delete project. Please try again.');
      }
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const columns: DataTableColumn<IProject>[] = useMemo(
    () => [
      {
        key: 'projectName',
        label: 'Project Name',
        width: 200,
        render: (row) => row.projectName,
      },
      {
        key: 'costCenter',
        label: 'Cost Center',
        width: 100,
        render: (row) => row.costCenter ,
      },
      {
        key: 'clientName',
        label: 'Client Name',
        width: 120,
        render: (row) => row.clientName,
      },
      {
        key: 'projectType',
        label: 'Project Type',
        width: 80,
        render: (row) => row.projectType,
      },
      {
        key: 'projectManager',
        label: 'Project Manager',
        width: 150,
        render: (row) => {
          // Derive manager details from supervisor + teamMembers
          const managerMember = row.teamMembers.find(
            (member) => member.id === row.supervisor
          );

          const manager: IProjectManager | null = managerMember
            ? {
                id: managerMember.id,
                name: managerMember.name,
                email: managerMember.email || '',
                avatar: managerMember.avatar,
                allocation: managerMember.allocation,
              }
            : null;

          return <ProjectManagerCell manager={manager} />;
        },
      },
      {
        key: 'teamMembers',
        label: 'Team Members',
        width: 100,
        render: (row) => (
          <TeamMembersCell
            teamMembers={row.teamMembers}
            onViewTeam={() => handleViewTeam(row)}
          />
        ),
      },
      {
        key: 'dateRange',
        label: 'Start & End Date',
        width: 120,
        render: (row) => (
          <DateRangeCell startDate={row.startDate} endDate={row.endDate} />
        ),
      },
      {
        key: 'billable',
        label: 'Billable Type',
        width: 80,
        render: (row) => row.billable ? 'Billable' : 'Non-Billable',
      },
      {
        key: 'status',
        label: 'Status',
        width: 80,
        render: (row) => <StatusChip status={row.status} />,
      },
       {
              label: '',
              key: 'actions',
              render: (row) => (
                <ActionButton
                  onEdit={() => handleEdit(row)}
                  onDelete={() => handleDelete(row)}
                />
              ),
            },
    ],
    []
  );

  // Compute initial supervisor details for ProjectStaffManager
  const projectToEditInitialSupervisor = projectToEdit
    ? (() => {
        const managerMember = projectToEdit.teamMembers.find(
          (member) => member.id === projectToEdit.supervisor
        );
        return managerMember
          ? {
              id: managerMember.id,
              name: managerMember.name,
              designation: managerMember.role,
            }
          : null;
      })()
    : null;

  return (
    <>
      <WindowLayout
        title="Projects"
        buttons={
          <>
            <BaseBtn
              variant="outlined"
              startIcon={<FilterAltOutlinedIcon />}
              onClick={handleFilter}
            >
              Filter
            </BaseBtn>
            <BaseBtn
              // variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddProject}
            >
              Project
            </BaseBtn>
          </>
        }
      >
        {isLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
              gap: 2,
            }}
          >
            
          </Box>
        ) : projects.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
            }}
          >
            <Typography color="text.secondary" variant="body1">
              No projects found.
            </Typography>
          </Box>
        ) : (
          <DataTable
            columns={columns}
            rows={projects}
            getRowKey={(row) => row.id}
          />
        )}
      </WindowLayout>

      {/* Team View Modal */}
      {selectedProject && (
        <ProjectTeamViewPopUp
          open={isTeamModalOpen}
          onClose={handleCloseTeamModal}
          project={selectedProject}
        />
      )}

      {/* Create Project Modal */}
      <CreateProjectPopUp
        open={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onProjectCreated={loadProjects}
      />

      <ConformationDailog
        open={isDeleteDialogOpen}
        title="Delete Project"
        message={`Are you sure you want to delete "${
          projectToDelete?.projectName || 'this project'
        }"?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Project Staff Manager Modal */}
      {projectToEdit && (
        <ProjectStaffManager
          open={isStaffManagerOpen}
          onClose={handleCloseStaffManager}
          projectId={projectToEdit.id}
          initialEmployees={projectToEdit.teamMembers.map(member => ({
            id: member.id,
            name: member.name,
            designation: member.role,
            allocation: member.allocation ?? 0,
          }))}
          initialSupervisor={projectToEditInitialSupervisor}
          onSaved={handleStaffSaved}
        />
      )}
      <AppSnackbar snackbar={snackbar} onClose={hideSnackbar} />
    </>
  );
}

export default ProjectWindow;
