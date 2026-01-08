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
import EditProjectPopup from '../popup/EditProjectPopup';
import { useProjects } from '../../../hooks/project/useProjects';
import { Box, CircularProgress, Typography } from '@mui/material';
import AppSnackbar from '../../molecules/other/AppSnackbar';
import { useSnackbar } from '../../../hooks/useSnackbar';
import StatusChip from '../../atoms/other/Icon/StatusChip';
import ProjectFilterPopover from '../popover/ProjectFilterPopover';
import { useSearch } from '../../../contexts/SearchContext';

function ProjectWindow() {
  const { projects, loading: isLoading, error, loadProjects, deleteProject, activateProject } = useProjects();
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
  const { searchQuery } = useSearch();

  
  const [selectedProject, setSelectedProject] = useState<IProject | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<IProject | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<IProject | null>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [activeFilters, setActiveFilters] = useState({ projectType: 'all', status: 'all', billable: 'all', visibility: 'all', costCenter: 'all' });

  const isFilterOpen = Boolean(filterAnchorEl);

  // Load projects on component mount
  useEffect(() => {
    loadProjects().catch(() => {
      // Error is handled by the hook
    });
  }, [loadProjects]);

  const handleEdit = (project: IProject) => {
    setProjectToEdit(project);
    setIsEditModalOpen(true);
  };

  const handleDelete = (project: IProject) => {
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  };

  const handleActivate = async (project: IProject) => {
    try {
      await activateProject(project.id);
      showSuccess('Project activated successfully');
      // Projects are automatically updated in Redux store
    } catch (error) {
      showError('Failed to activate project. Please try again.');
    }
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

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setProjectToEdit(null);
  };

  const handleEditSaved = () => {
    showSuccess('Project updated successfully');
    // Refresh project data after update
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
        showSuccess('Project put on hold successfully');
        // Projects are automatically updated in Redux store
      } catch (error) {
        showError('Failed to put project on hold. Please try again.');
      }
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  // Filter projects based on active filters and search query
  const filteredProjects = useMemo(
    () => {
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

        // Search filter: check project name
        const searchMatch = !searchQuery || 
          project.projectName.toLowerCase().includes(searchQuery.toLowerCase());

        return projectTypeMatch && statusMatch && billableMatch && visibilityMatch && costCenterMatch && searchMatch;
      });
    },
    [projects, activeFilters, searchQuery]
  );

  const columns: DataTableColumn<IProject>[] = useMemo(
    () => [
      {
        key: 'projectName',
        label: 'Project Name',
        width: 'auto',
        render: (row) => row.projectName,
      },
      {
        key: 'costCenter',
        label: 'Cost Center',
        width: 'auto',
        render: (row) => row.costCenter || '-',
      },
      {
        key: 'clientName',
        label: 'Client Name',
        width: 'auto',
        render: (row) => row.clientName || '-',
      },
      {
        key: 'projectType',
        label: 'Project Type',
        width: 'auto',
        render: (row) => row.projectType || '-',
      },
      {
        key: 'projectManager',
        label: 'Project Manager',
        width: 'auto',
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
        width: 'auto',
        render: (row) => {
          const isPublicOrInternal = row.projectName === 'Internal' || row.projectVisibility?.toLowerCase() === 'public';
          return (
            <TeamMembersCell
              teamMembers={row.teamMembers}
              onViewTeam={isPublicOrInternal ? undefined : () => handleViewTeam(row)}
              disabled={isPublicOrInternal}
            />
          );
        },
      },
      {
        key: 'dateRange',
        label: 'Start & End Date',
        width: 'auto',
        render: (row) => (
          <DateRangeCell startDate={row.startDate} endDate={row.endDate} />
        ),
      },
      {
        key: 'billable',
        label: 'Billable Type',
        width: 'auto',
        render: (row) => row.billable ? 'Billable' : 'Non-Billable',
      },
      {
        key: 'status',
        label: 'Status',
        width: 'auto',
        render: (row) => <StatusChip status={row.status} />,
      },
       {
              label: '',
              key: 'actions',
              render: (row) => {
                // Don't show any actions for "Internal" project
                if (row.projectName === 'Internal') {
                  return null;
                }
                
                // For public projects, disable edit but keep delete/activate
                const isPublic = row.projectVisibility?.toLowerCase() === 'public';
                const isInactive = row.isActive === false;
                
                return (
                  <ActionButton
                    onEdit={() => handleEdit(row)}
                    onDelete={isInactive ? () => handleActivate(row) : () => handleDelete(row)}
                    disableEdit={isPublic}
                    deleteLabel={isInactive ? 'Activate' : 'On Hold'}
                  />
                );
              },
            },
    ],
    []
  );

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
        title="Put Project On Hold"
        message={`Are you sure you want to put "${
          projectToDelete?.projectName || 'this project'
        }" on hold?`}
        confirmText="On Hold"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Edit Project Modal */}
      {projectToEdit && (
        <EditProjectPopup
          open={isEditModalOpen}
          onClose={handleCloseEditModal}
          project={projectToEdit}
          onSaved={handleEditSaved}
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
