import { useState, useMemo } from 'react';
import WindowLayout from '../../templates/other/WindowLayout';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TableTemplate from '../../templates/table/TableTemplate';
import { IProject } from '../../../interfaces/project/IProject';
import { ITableColumn } from '../../../interfaces/table/ITable';
import { dummyProjects } from '../../../data/dummyProjects';
import CostCenterBadge from '../../atoms/project/CostCenterBadge';
import ProjectTypeChip from '../../atoms/project/ProjectTypeChip';
import BillableChip from '../../atoms/project/BillableChip';
import ProjectManagerCell from '../../molecules/project/ProjectManagerCell';
import TeamMembersCell from '../../molecules/project/TeamMembersCell';
import DateRangeCell from '../../molecules/project/DateRangeCell';
import ProjectActionButtons from '../../molecules/project/ProjectActionButtons';

function ProjectWindow() {
  const [projects] = useState<IProject[]>(dummyProjects);
  const [isLoading] = useState(false);

  const handleEdit = (project: IProject) => {
    console.log('Edit project:', project);
    // TODO: Implement edit functionality
  };

  const handleDelete = (projectId: string) => {
    console.log('Delete project:', projectId);
    // TODO: Implement delete functionality
  };

  const handleViewTeam = (project: IProject) => {
    console.log('View team for project:', project);
    // TODO: Implement view team functionality
  };

  const handleAddProject = () => {
    console.log('Add new project');
    // TODO: Implement add project functionality
  };

  const columns: ITableColumn<IProject>[] = useMemo(
    () => [
      {
        id: 'projectName',
        label: 'Project Name',
        minWidth: 200,
        render: (row) => row.projectName,
      },
      {
        id: 'costCenter',
        label: 'Cost Center',
        minWidth: 100,
        render: (row) => <CostCenterBadge costCenter={row.costCenter} />,
      },
      {
        id: 'clientName',
        label: 'Client Name',
        minWidth: 120,
        render: (row) => row.clientName,
      },
      {
        id: 'projectType',
        label: 'Project Type',
        minWidth: 100,
        render: (row) => <ProjectTypeChip type={row.projectType} />,
      },
      {
        id: 'projectManager',
        label: 'Project Manager',
        minWidth: 200,
        render: (row) => <ProjectManagerCell manager={row.projectManager} />,
      },
      {
        id: 'teamMembers',
        label: 'Team Members',
        minWidth: 150,
        render: (row) => (
          <TeamMembersCell
            teamMembers={row.teamMembers}
            onViewTeam={() => handleViewTeam(row)}
          />
        ),
      },
      {
        id: 'dateRange',
        label: 'Start & End Date',
        minWidth: 120,
        render: (row) => (
          <DateRangeCell startDate={row.startDate} endDate={row.endDate} />
        ),
      },
      {
        id: 'billable',
        label: 'Billable Type',
        minWidth: 50,
        align: 'center',
        render: (row) => <BillableChip billable={row.billable} />,
      },
      {
        id: 'actions',
        label: 'Actions',
        minWidth: 80,
        align: 'center',
        render: (row) => (
          <ProjectActionButtons
            project={row}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ),
      },
    ],
    []
  );

  return (
    <WindowLayout
      title="Projects"
      buttons={
        <>
          <Button variant="outlined">Filter</Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddProject}
          >
            Add Project
          </Button>
        </>
      }
    >
      <TableTemplate
        columns={columns}
        data={projects}
        isLoading={isLoading}
        emptyMessage="No projects found"
        keyExtractor={(row) => row.id}
      />
    </WindowLayout>
  );
}

export default ProjectWindow;