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
import ProjectFilterPopover from '../popover/ProjectFilterPopover';

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
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [activeFilters, setActiveFilters] = useState({ projectType: 'all', status: 'all', billable: 'all', visibility: 'all', costCenter: 'all' });

  const isFilterOpen = Boolean(filterAnchorEl);

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

  const handleFilter = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleCloseFilter = () => {
    setFilterAnchorEl(null);
  };

  const handleApplyFilter = (filters: { projectType: string; status: string; billable: string; visibility: string; costCenter: string }) => {
    setActiveFilters(filters);
    handleCloseFilter();
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

  // Filter projects based on active filters
  const filteredProjects = useMemo(
    () => {
      console.log('Active filters:', activeFilters);
      console.log('Sample project data:', projects[0]);
      
      return projects.filter(project => {
        // Project Type filter
        const projectTypeMatch = 
          activeFilters.projectType === 'all' ? true :
          project.projectType === activeFilters.projectType;

        // Status filter - Active means status is 'Active', Inactive means 'Completed' or 'On Hold'
        const statusMatch = 
          activeFilters.status === 'all' ? true :
          activeFilters.status === 'active' ? project.status === 'Active' :
          project.status === 'Completed' || project.status === 'On Hold';

        // Billable filter
        const billableMatch = 
          activeFilters.billable === 'all' ? true :
          activeFilters.billable === 'billable' ? project.billable === true :
          project.billable === false;

        // Visibility filter - handle both lowercase and capitalized values
        const visibilityMatch = 
          activeFilters.visibility === 'all' ? true :
          project.projectVisibility && project.projectVisibility.toLowerCase() === activeFilters.visibility.toLowerCase();

        // Cost Center filter - exact match
        const costCenterMatch = 
          activeFilters.costCenter === 'all' ? true :
          project.costCenter === activeFilters.costCenter;

        return projectTypeMatch && statusMatch && billableMatch && visibilityMatch && costCenterMatch;
      });
    },
    [projects, activeFilters]
  );

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
        ) : filteredProjects.length === 0 ? (
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
            rows={filteredProjects}
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

      <ProjectFilterPopover
        anchorEl={filterAnchorEl}
        open={isFilterOpen}
        onClose={handleCloseFilter}
        onApplyFilter={handleApplyFilter}
      />

      <AppSnackbar snackbar={snackbar} onClose={hideSnackbar} />
    </>
  );
}

export default ProjectWindow;
