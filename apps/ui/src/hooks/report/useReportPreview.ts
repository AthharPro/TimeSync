import { useState, useEffect } from 'react';
import {
  previewDetailedTimesheet,
  previewDetailedTimesheetRaw,
} from '../../api/report';
import { UseReportPreviewOptions, UseReportPreviewReturn } from '../../interfaces/report/IReportPreview';

export const useReportPreview = ({ 
  reportType, 
  filter,
  isFilterValid = true
}: UseReportPreviewOptions): UseReportPreviewReturn => {
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [previewColumns, setPreviewColumns] = useState<{ key: string; header: string }[]>([]);
  const [groupedPreviewData, setGroupedPreviewData] = useState<{
    [employeeKey: string]: {
      employeeName: string;
      employeeEmail: string;
      tables: Array<{
        title: string;
        columns: { key: string; header: string }[];
        rows: any[];
      }>;
    };
  }>({});
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const loadPreview = async () => {
    if (!reportType || !isFilterValid) return;
    
    setIsLoadingPreview(true);
    setPreviewError(null);

    try {
      if (reportType !== 'detailed-timesheet' && reportType !== 'timesheet-entries') {
        setGroupedPreviewData({});
      }
      
      if (reportType === 'detailed-timesheet') {
        const rawData = await previewDetailedTimesheet(filter);
        console.log('Preview rawData received:', rawData);
        
        // Filter the data first - rawData is already transformed to flat rows
        const filteredData = (rawData || []).filter((row: any) => {
          if (!row || !row.employeeName || !row.employeeEmail) return false;
          return true;
        });

        // Check if multiple employees are selected
        const uniqueEmployees = new Set(filteredData.map((row: any) => `${row.employeeName}|${row.employeeEmail}`));
        const hasMultipleEmployees = uniqueEmployees.size > 1;
        
        // Check if filtering by project - if so, show separate tables for each user
        const isProjectWiseFilter = filter.projectId && filter.projectId !== '';
        // Check if filtering by team - if so, show separate tables for each user (like individual users)
        const isTeamWiseFilter = filter.teamId && filter.teamId !== '';

        // For project-wise filter OR team-wise filter OR individual users with single/multiple employees, group by employee first, then by category
        // Only combine into single table when multiple employees are selected AND it's NOT project-wise filter AND it's NOT team-wise filter
        if (hasMultipleEmployees && !isProjectWiseFilter && !isTeamWiseFilter) {
          // Combine all data into a single table for multiple employees (only when NOT filtering by project)
          const singleTableData: {
            [key: string]: {
              employeeName: string;
              employeeEmail: string;
              tables: Array<{
                title: string;
                columns: { key: string; header: string }[];
                rows: any[];
              }>;
            };
          } = {
            'combined': {
              employeeName: 'Multiple Employees',
              employeeEmail: '',
              tables: [{
                title: 'Combined Report',
                columns: [
                  { key: 'employeeName', header: 'Employee' },
                  { key: 'weekStartDate', header: 'Week Start' },
                  { key: 'work', header: 'Work' },
                  { key: 'mon', header: 'Mon' },
                  { key: 'tue', header: 'Tue' },
                  { key: 'wed', header: 'Wed' },
                  { key: 'thu', header: 'Thu' },
                  { key: 'fri', header: 'Fri' },
                  { key: 'total', header: 'Total' },
                ],
                rows: filteredData
              }]
            }
          };
          
          console.log('Combined preview data for multiple employees:', singleTableData);
          setGroupedPreviewData(singleTableData);
        } else {
          // For project-wise filter OR team-wise filter OR individual users: group by employee first, then by category (project/task/leave)
          // This creates one section per employee, with multiple tables per employee (one per category)
          // For team-wise: number of sections = number of employees in the selected team
          const groupedData: {
            [employeeKey: string]: {
              employeeName: string;
              employeeEmail: string;
              tables: Array<{
                title: string;
                columns: { key: string; header: string }[];
                rows: any[];
              }>;
            };
          } = {};

          filteredData.forEach((row: any) => {
            const employeeKey = `${row.employeeName}|${row.employeeEmail}`;
            
            if (!groupedData[employeeKey]) {
              groupedData[employeeKey] = {
                employeeName: row.employeeName,
                employeeEmail: row.employeeEmail,
                tables: []
              };
            }

            // Use the category as the table title
            const tableTitle = row.category;
            const isLeave = tableTitle.toLowerCase().includes('leave') || tableTitle === 'Leave';
            
            // Find existing table for this category or create new one
            let existingTable = groupedData[employeeKey].tables.find(t => t.title === tableTitle);
            if (!existingTable) {
              // Define columns based on category type (Mon-Fri only, no Sat/Sun)
              const columns = isLeave 
                ? [
                    { key: 'weekStartDate', header: 'Week Start' },
                    { key: 'weekEndDate', header: 'Week End' },
                    { key: 'status', header: 'Status' },
                    { key: 'work', header: 'Work' },
                    { key: 'mon', header: 'Mon' },
                    { key: 'tue', header: 'Tue' },
                    { key: 'wed', header: 'Wed' },
                    { key: 'thu', header: 'Thu' },
                    { key: 'fri', header: 'Fri' },
                    { key: 'total', header: 'Total' },
                  ]
                : [
                    { key: 'weekStartDate', header: 'Week Start' },
                    { key: 'weekEndDate', header: 'Week End' },
                    { key: 'status', header: 'Status' },
                    { key: 'mon', header: 'Mon' },
                    { key: 'tue', header: 'Tue' },
                    { key: 'wed', header: 'Wed' },
                    { key: 'thu', header: 'Thu' },
                    { key: 'fri', header: 'Fri' },
                    { key: 'total', header: 'Total' },
                  ];
              
              existingTable = {
                title: tableTitle,
                columns: columns,
                rows: []
              };
              groupedData[employeeKey].tables.push(existingTable);
            }

            // Add row to the appropriate table
            existingTable.rows.push(row);
          });

          console.log('Grouped preview data (project-wise, team-wise, or individual):', groupedData);
          setGroupedPreviewData(groupedData);
        }
        
        // For backward compatibility, also set the original format
        setPreviewColumns([
          { key: 'employeeName', header: 'Employee' },
          { key: 'employeeEmail', header: 'Email' },
          { key: 'weekStartDate', header: 'Week Start' },
          { key: 'status', header: 'Status' },
          { key: 'mon', header: 'Mon' },
          { key: 'tue', header: 'Tue' },
          { key: 'wed', header: 'Wed' },
          { key: 'thu', header: 'Thu' },
          { key: 'fri', header: 'Fri' },
          { key: 'total', header: 'Total' },
        ]);
        setPreviewRows(rawData);
      } else if (reportType === 'timesheet-entries') {
        const rawEntries = await previewDetailedTimesheetRaw(filter);
        
        console.log('Timesheet entries raw data:', rawEntries);
        
        // Check if filtering by individual user, project-wise, or team-wise
        const isIndividualUserFilter = filter.employeeIds && filter.employeeIds.length > 0;
        const isProjectWiseFilter = filter.projectId && filter.projectId !== '';
        const isTeamWiseFilter = filter.teamId && filter.teamId !== '';
        
        // Filter employees first
        const filteredEmployees = (rawEntries || []).filter((employee: any) => {
          if (!employee || !employee.employeeName || !employee.employeeEmail) {
            console.warn('Invalid employee data:', employee);
            return false;
          }

          // Employee level filtering (by selected employees)
          if (filter.employeeIds && Array.isArray(filter.employeeIds) && filter.employeeIds.length > 0) {
            const employeeId = String(
              employee._id ??
              employee.id ??
              employee.employeeId ??
              ''
            );

            if (employeeId && !filter.employeeIds.includes(employeeId)) {
              return false;
            }
          }
          
          return true;
        });

        // Check if multiple employees
        const hasMultipleEmployees = filteredEmployees.length > 1;

        // For individual user, project-wise, or team-wise filter:
        // Always create separate tables for each employee with columns: date, responsible, description, Time Spent (Hours)
        // When multiple employees: create one table per employee
        if (isIndividualUserFilter || isProjectWiseFilter || isTeamWiseFilter) {
          const groupedData: {
            [employeeKey: string]: {
              employeeName: string;
              employeeEmail: string;
              tables: Array<{
                title: string;
                columns: { key: string; header: string; width?: string }[];
                rows: any[];
              }>;
            };
          } = {};
          
          filteredEmployees.forEach((employee: any) => {
            const employeeKey = `${employee.employeeName}|${employee.employeeEmail}`;
            
            if (!groupedData[employeeKey]) {
              groupedData[employeeKey] = {
                employeeName: employee.employeeName,
                employeeEmail: employee.employeeEmail,
                tables: []
              };
            }
            
            // Collect all rows from all tables for this employee
            const allEmployeeRows: any[] = [];
            
            (employee.tables || []).forEach((table: any) => {
              const isProjectTable = table.title?.includes('Project:');
              const isTeamTable = table.title?.includes('Team:');
              const isLeaveTable = table.title?.includes('Leave');
              
              // Apply workType filtering
              if (filter.workType && !isLeaveTable) {
                if (filter.workType === 'project' && !isProjectTable) {
                  return;
                }
                if (filter.workType === 'team' && !isTeamTable) {
                  return;
                }
              }
              
              // Add rows from this table to the employee's collection
              (table.rows || []).forEach((row: any) => {
                allEmployeeRows.push({
                  date: row.date,
                  responsible: employee.employeeName,
                  description: row.description || '',
                  quantity: parseFloat(row.quantity || 0).toFixed(2)
                });
              });
            });
            
            // Sort all rows by date
            allEmployeeRows.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            // Create a single table for this employee with all their entries
            groupedData[employeeKey].tables.push({
              title: 'Timesheet Entries',
              columns: [
                { key: 'date', header: 'Date', width: '15%' },
                { key: 'responsible', header: 'Responsible', width: '20%' },
                { key: 'description', header: 'Description', width: '40%' },
                { key: 'quantity', header: 'Time Spent (Hours)', width: '25%' },
              ],
              rows: allEmployeeRows
            });
          });
          
          console.log('Grouped preview data (individual/project-wise/team-wise):', groupedData);
          setGroupedPreviewData(groupedData);

          // For backward compatibility - create flat rows
          if (filteredEmployees.length > 0) {
            const allRows: any[] = [];
            filteredEmployees.forEach((employee: any) => {
              (employee.tables || []).forEach((table: any) => {
                const isProjectTable = table.title?.includes('Project:');
                const isTeamTable = table.title?.includes('Team:');
                const isLeaveTable = table.title?.includes('Leave');
                
                // Apply workType filtering
                if (filter.workType && !isLeaveTable) {
                  if (filter.workType === 'project' && !isProjectTable) {
                    return;
                  }
                  if (filter.workType === 'team' && !isTeamTable) {
                    return;
                  }
                }
                
                // Add employee name as responsible for each row
                (table.rows || []).forEach((row: any) => {
                  allRows.push({
                    ...row,
                    work: employee.employeeName,
                    quantity: parseFloat(row.quantity || 0).toFixed(2)
                  });
                });
              });
            });

            // Sort all rows by date
            allRows.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

            // Set preview columns and rows for backward compatibility
            setPreviewColumns([
              { key: 'date', header: 'Date' },
              { key: 'work', header: 'Responsible' },
              { key: 'description', header: 'Description' },
              { key: 'quantity', header: 'Time Spent (Hours)' },
            ]);
            setPreviewRows(allRows);
          }
        }
      }
    } catch (e) {
      console.error('Preview data loading error:', e);
      setPreviewError(e instanceof Error ? e.message : 'Failed to load preview data');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  useEffect(() => {
    if (isFilterValid) {
      loadPreview();
    } else {
      // Clear preview data when filters are invalid
      setGroupedPreviewData({});
      setPreviewRows([]);
      setPreviewColumns([]);
      setPreviewError(null);
    }
  }, [
    reportType,
    filter.startDate,
    filter.endDate,
    (filter.employeeIds || []).join(','),
    filter.projectId,
    filter.teamId,
    filter.workType,
    isFilterValid,
  ]);

  return {
    previewRows,
    previewColumns,
    groupedPreviewData,
    isLoadingPreview,
    previewError,
    loadPreview
  };
};
