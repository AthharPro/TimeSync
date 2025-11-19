import { Checkbox } from '@mui/material';
import DataTable from '../../templates/other/DataTable';
import { DataTableColumn } from '../../../interfaces';
import { BillableType } from '@tms/shared';
import {  useState, useMemo } from 'react';
import { useMyTimesheet } from '../../../hooks/timesheet/useMyTimesheet';
import AutocompleteText from '../../atoms/other/inputField/Autocomplete';
import DatePickerField from '../../atoms/other/inputField/DatePickerField';
import { BaseTextField } from '../../atoms';
import HoursField from '../../atoms/other/inputField/HoursField';
import Dropdown from '../../atoms/other/inputField/Dropdown';
import { ITimesheetTableEntry } from 'apps/ui/src/interfaces/component/organism/ITable';

const MyTimesheetTable = () => {
  const { newTimesheets, updateTimesheet } = useMyTimesheet();

  const [openPickers, setOpenPickers] = useState<Set<string>>(new Set());

  const timesheetData: ITimesheetTableEntry[] = useMemo(() => {
    return newTimesheets.map(timesheet => ({
      ...timesheet,
      date: new Date(timesheet.date)
    }));
  }, [newTimesheets]);

  // Calculate selected count and states from isChecked property
  const selectedCount = timesheetData.filter(row => row.isChecked).length;
  const isAllSelected = timesheetData.length > 0 && selectedCount === timesheetData.length;
  const isIndeterminate = selectedCount > 0 && selectedCount < timesheetData.length;

  // Available projects list
  const availableProjects = [
    'Project Alpha',
    'Project Beta',
    'Project Gamma',
    'Project Delta',
  ];

  // Available tasks list
  const availableTasks = [
    'Development',
    'Testing',
    'Code Review',
    'Documentation',
    'Bug Fixing',
    'Meeting',
  ];

  const handleCheckboxChange = (id: string) => {
    const currentRow = timesheetData.find(row => row.id === id);
    if (currentRow) {
      updateTimesheet(id, { isChecked: !currentRow.isChecked });
    }
  };

  const handleSelectAll = () => {
    const newCheckedState = !isAllSelected;
    timesheetData.forEach(row => {
      updateTimesheet(row.id, { isChecked: newCheckedState });
    });
  };

  const handleProjectChange = (id: string, newProject: string | null) => {
    if (newProject !== null) {
      updateTimesheet(id, { project: newProject });
    }
  };

  const handleTaskChange = (id: string, newTask: string | null) => {
    if (newTask !== null) {
      updateTimesheet(id, { task: newTask });
    }
  };

  const handleDescriptionChange = (id: string, newDescription: string) => {
    updateTimesheet(id, { description: newDescription });
  };

  const handleHoursChange = (id: string, newHours: number) => {
    updateTimesheet(id, { hours: newHours });
  };

  const handleBillableTypeChange = (
    id: string,
    newBillableType: BillableType
  ) => {
    updateTimesheet(id, { billableType: newBillableType });
  };

  const handleDateChange = (id: string, newDate: Date | null) => {
    if (newDate !== null) {
      updateTimesheet(id, { date: newDate.toISOString() });
    }
  };

  const columns: DataTableColumn<ITimesheetTableEntry>[] = [
    {
      key: 'checkbox',
      label: '',
      renderHeader: () => (
        <Checkbox
          size="small"
          checked={isAllSelected}
          indeterminate={isIndeterminate}
          onChange={handleSelectAll}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      render: (row) => (
        <Checkbox
          size="small"
          checked={row.isChecked || false}
          onChange={() => handleCheckboxChange(row.id)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      width: '2%',
    },
    {
      key: 'date',
      label: 'Date',
      render: (row) => {
        return (
          <DatePickerField
            value={row.date}
            onChange={(newDate) => handleDateChange(row.id, newDate)}
            open={openPickers.has(row.id)}
            onOpen={() => {
              setOpenPickers(new Set([row.id]));
            }}
            onClose={() => {
              setOpenPickers((prev) => {
                const newSet = new Set(prev);
                newSet.delete(row.id);
                return newSet;
              });
            }}
            onClick={() => {
              setOpenPickers(new Set([row.id]));
            }}
          />
        );
      },
      width: '10%',
    },
    {
      key: 'project',
      label: 'Project',
      render: (row) => (
        <AutocompleteText
          value={row.project}
          onChange={(event, newValue) =>
            handleProjectChange(row.id, newValue)
          }
          options={availableProjects}
        />
      ),
      width: '14%',
    },
    {
      key: 'task',
      label: 'Task',
      render: (row) => (
        <AutocompleteText
          value={row.task}
          onChange={(event, newValue) => handleTaskChange(row.id, newValue)}
          options={availableTasks}
        />
      ),
      width: '30%',
    },
    {
      key: 'description',
      label: 'Description',
      render: (row) => (
        <BaseTextField
          value={row.description}
          onChange={(e) => handleDescriptionChange(row.id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          variant="standard"
          sx={{
            width: '100%',
            '& .MuiInput-underline:before': {
              borderBottom: 'none',
            },
            '& .MuiInput-underline:after': {
              borderBottom: 'none',
            },
            '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
              borderBottom: 'none',
            },
          }}
        />
      ),
      width: '25%',
    },
    {
      key: 'hours',
      label: 'Hours',
      render: (row) => (
        <HoursField
          value={row.hours}
          onChange={(newHours) => handleHoursChange(row.id, newHours)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      width: '7%',
    },
    {
      key: 'billableType',
      label: 'Billable',
      render: (row) => (
        <Dropdown
          value={row.billableType}
          onChange={(newBillableType) =>
            handleBillableTypeChange(row.id, newBillableType)
          }
          options={BillableType}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      width: '10%',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => row.status,
      width: '5%',
    },
  ];

  const handleRowClick = (row: ITimesheetTableEntry) => {
    console.log('Clicked row:', row);
  };



  return (
    <DataTable
      columns={columns}
      rows={timesheetData}
      getRowKey={(row) => row.id}
      onRowClick={handleRowClick}
    />
  );
};

export default MyTimesheetTable;
