import { useState, useMemo } from 'react';
import WindowLayout from '../../templates/other/WindowLayout';
import AddIcon from '@mui/icons-material/Add';
import DataTable from '../../templates/other/DataTable';
import { IProject } from '../../../interfaces/project/IProject';
import { DataTableColumn } from '../../../interfaces/layout/ITableProps';
import { dummyProjects } from '../../../data/dummyProjects';
import ProjectManagerCell from '../../molecules/project/ProjectManagerCell';
import TeamMembersCell from '../../molecules/project/TeamMembersCell';
import DateRangeCell from '../../molecules/project/DateRangeCell';
import ProjectTeamViewPopUp from '../popup/ProjectTeamViewPopUp';
import { BaseBtn } from '../../atoms';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import ActionButton from '../../molecules/other/ActionButton';
function ProjectWindow() {
  const [projects] = useState<IProject[]>(dummyProjects);
  const [isLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<IProject | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  const handleEdit = (project: IProject) => {
    console.log('Edit project:', project);
    // TODO: Implement edit functionality
  };

  const handleDelete = (projectId: string) => {
    console.log('Delete project:', projectId);
    // TODO: Implement delete functionality
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
    console.log('Add new project');
    // TODO: Implement add project functionality
  };

  const handleFilter = () => {
    console.log('Open filter');
    // TODO: Implement filter functionality
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
        render: (row) => <ProjectManagerCell manager={row.projectManager} />,
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
              label: '',
              key: 'actions',
              render: () => <ActionButton />,
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
        <DataTable
          columns={columns}
          rows={projects}
          getRowKey={(row) => row.id}
        />
      </WindowLayout>

      {/* Team View Modal */}
      {selectedProject && (
        <ProjectTeamViewPopUp
          open={isTeamModalOpen}
          onClose={handleCloseTeamModal}
          project={selectedProject}
        />
      )}
    </>
  );
}

export default ProjectWindow;