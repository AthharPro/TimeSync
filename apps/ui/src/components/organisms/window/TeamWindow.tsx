import WindowLayout from '../../templates/other/WindowLayout';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import AddIcon from '@mui/icons-material/Add';
import { BaseBtn } from '../../atoms';
import DataTable from '../../templates/other/DataTable';
import { ITeam } from '../../../interfaces/team/ITeam';
import { DataTableColumn } from '../../../interfaces/layout/ITableProps';
import { useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { dummyTeams } from '../../../data/dummyTeams';
import ActionButton from '../../molecules/other/ActionButton';

function TeamWindow() {
  const [teams] = useState<ITeam[]>(dummyTeams as ITeam[]);
  const [viewTeam, setViewTeam] = useState<ITeam | null>(null);
  const handleFilter = () => {
    // TODO: Implement filter functionality
  };

  const handleAddProject = () => {
    // TODO: Implement add project functionality
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
      <BaseBtn startIcon={<AddIcon />} onClick={handleAddProject}>
        Team
      </BaseBtn>
    </>
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
        render: () => <ActionButton />,
      },
    ],
    [theme]
  );
  return (
    <WindowLayout title="Team" buttons={button}>
      <DataTable columns={columns} rows={teams} getRowKey={(row) => row.id} />
    </WindowLayout>
  );
}

export default TeamWindow;
