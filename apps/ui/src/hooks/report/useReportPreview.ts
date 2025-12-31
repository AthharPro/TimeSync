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

  // Helper function to calculate week end date (Friday = Monday + 4 days)
  const calculateWeekEndDate = (weekStartDate: string): string => {
    try {
      const startDate = new Date(weekStartDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 4); // Friday (Mon + 4 days)
      return endDate.toISOString().slice(0, 10);
    } catch {
      return weekStartDate;
    }
  };

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
        
        // rawData is array of employee weeks with categories structure:
        // [{ employeeName, employeeEmail, weekStartDate, categories: [{ category, items: [{ projectName, teamName, dailyHours, ... }] }] }]
        
        // Filter valid data
        const filteredData = (rawData || []).filter((weekData: any) => {
          if (!weekData || !weekData.employeeName || !weekData.employeeEmail) return false;
          return true;
        });

        // Check if multiple employees are selected
        const uniqueEmployees = new Set(filteredData.map((weekData: any) => `${weekData.employeeName}|${weekData.employeeEmail}`));
        const hasMultipleEmployees = uniqueEmployees.size > 1;
        
        // Check if filtering by project - if so, show separate tables for each user
        const isProjectWiseFilter = filter.projectId && filter.projectId !== '';
        // Check if filtering by team - if so, show separate tables for each user (like individual users)
        const isTeamWiseFilter = filter.teamId && filter.teamId !== '';
        
        // For project-wise filter OR team-wise filter OR individual users with single/multiple employees, group by employee first, then by category
        // Only combine into single table when multiple employees are selected AND it's NOT project-wise filter AND it's NOT team-wise filter
        if (hasMultipleEmployees && !isProjectWiseFilter && !isTeamWiseFilter) {
          // Combine all data into a single table for multiple employees (only when NOT filtering by project)
          // Flatten categories into rows for combined view
          const flatRows: any[] = [];
          
          filteredData.forEach((weekData: any) => {
            (weekData.categories || []).forEach((cat: any) => {
              (cat.items || []).forEach((item: any) => {
                const dailyHours = item.dailyHours || [];
                const total = dailyHours.slice(0, 5).reduce((sum: number, h: any) => sum + (parseFloat(h) || 0), 0);
                
                flatRows.push({
                  employeeName: weekData.employeeName,
                  weekStartDate: weekData.weekStartDate,
                  work: item.projectName || item.teamName || item.work || cat.category,
                  mon: dailyHours[0] ? parseFloat(dailyHours[0]).toFixed(2) : '',
                  tue: dailyHours[1] ? parseFloat(dailyHours[1]).toFixed(2) : '',
                  wed: dailyHours[2] ? parseFloat(dailyHours[2]).toFixed(2) : '',
                  thu: dailyHours[3] ? parseFloat(dailyHours[3]).toFixed(2) : '',
                  fri: dailyHours[4] ? parseFloat(dailyHours[4]).toFixed(2) : '',
                  total: total.toFixed(2)
                });
              });
            });
          });
          
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
                rows: flatRows
              }]
            }
          };
          
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

          // First pass: Aggregate data by employee, week, and project/team (matching PDF logic)
          // This prevents duplicate rows when multiple items exist for same week+project/team
          type WeekTitleKey = string; // Format: "2025-12-01_Project: ProjectName"
          type EmployeeWeekData = {
            [employeeKey: string]: {
              employeeName: string;
              employeeEmail: string;
              weekTitleMap: Map<WeekTitleKey, {
                weekStartDate: string;
                weekEndDate: string;
                title: string;
                isLeave: boolean;
                status: string;
                work?: string;
                mon: number;
                tue: number;
                wed: number;
                thu: number;
                fri: number;
              }>;
            };
          };
          
          const employeeWeekData: EmployeeWeekData = {};

          // Aggregate hours by employee, week, and project/team from raw categories structure
          filteredData.forEach((weekData: any) => {
            const employeeKey = `${weekData.employeeName}|${weekData.employeeEmail}`;
            
            if (!employeeWeekData[employeeKey]) {
              employeeWeekData[employeeKey] = {
                employeeName: weekData.employeeName,
                employeeEmail: weekData.employeeEmail,
                weekTitleMap: new Map()
              };
            }

            // Process categories and items from raw API data
            (weekData.categories || []).forEach((category: any) => {
              (category.items || []).forEach((item: any) => {
                // Determine table title based on project/team
                let tableTitle = category.category;
                if (item.projectName) {
                  tableTitle = `Project: ${item.projectName}`;
                } else if (item.teamName) {
                  tableTitle = `Team: ${item.teamName}`;
                } else if (category.category === 'Other' || category.category.toLowerCase().includes('leave')) {
                  tableTitle = 'Leave';
                }
                
                const isLeave = tableTitle.toLowerCase().includes('leave') || tableTitle === 'Leave';
                
                // Create unique key: weekStartDate + tableTitle
                const weekTitleKey: WeekTitleKey = `${weekData.weekStartDate}_${tableTitle}`;
                
                const weekDataMap = employeeWeekData[employeeKey].weekTitleMap;
                
                if (!weekDataMap.has(weekTitleKey)) {
                  weekDataMap.set(weekTitleKey, {
                    weekStartDate: weekData.weekStartDate,
                    weekEndDate: calculateWeekEndDate(weekData.weekStartDate),
                    title: tableTitle,
                    isLeave: isLeave,
                    status: weekData.status || 'Draft',
                    work: isLeave ? (item.work || '') : undefined,
                    mon: 0,
                    tue: 0,
                    wed: 0,
                    thu: 0,
                    fri: 0
                  });
                }
                
                const aggregated = weekDataMap.get(weekTitleKey)!;
                const dailyHours = item.dailyHours || [];
                
                // Sum up hours for each day (indices 0-4 for Mon-Fri)
                aggregated.mon += parseFloat(dailyHours[0]?.toString() || '0') || 0;
                aggregated.tue += parseFloat(dailyHours[1]?.toString() || '0') || 0;
                aggregated.wed += parseFloat(dailyHours[2]?.toString() || '0') || 0;
                aggregated.thu += parseFloat(dailyHours[3]?.toString() || '0') || 0;
                aggregated.fri += parseFloat(dailyHours[4]?.toString() || '0') || 0;
              });
            });
          });

          // Second pass: Create tables from aggregated data
          Object.keys(employeeWeekData).forEach(employeeKey => {
            const empData = employeeWeekData[employeeKey];
            
            groupedData[employeeKey] = {
              employeeName: empData.employeeName,
              employeeEmail: empData.employeeEmail,
              tables: []
            };
            
            // Group aggregated weeks by table title
            const tablesByTitle = new Map<string, any[]>();
            
            empData.weekTitleMap.forEach((weekData) => {
              if (!tablesByTitle.has(weekData.title)) {
                tablesByTitle.set(weekData.title, []);
              }
              
              const total = weekData.mon + weekData.tue + weekData.wed + weekData.thu + weekData.fri;
              
              const rowData = {
                weekStartDate: weekData.weekStartDate,
                weekEndDate: weekData.weekEndDate,
                status: weekData.status,
                ...(weekData.isLeave && weekData.work ? { work: weekData.work } : {}),
                mon: weekData.mon ? weekData.mon.toFixed(2) : '',
                tue: weekData.tue ? weekData.tue.toFixed(2) : '',
                wed: weekData.wed ? weekData.wed.toFixed(2) : '',
                thu: weekData.thu ? weekData.thu.toFixed(2) : '',
                fri: weekData.fri ? weekData.fri.toFixed(2) : '',
                total: total ? total.toFixed(2) : ''
              };
              
              tablesByTitle.get(weekData.title)!.push(rowData);
            });
            
            // Create tables sorted by priority: Projects first, then Teams, then Leave
            const sortedTitles = Array.from(tablesByTitle.keys()).sort((a, b) => {
              const rank = (t: string) => (t.startsWith('Project:') ? 0 : t.startsWith('Team:') ? 1 : t === 'Leave' ? 2 : 3);
              const rA = rank(a);
              const rB = rank(b);
              if (rA !== rB) return rA - rB;
              return a.localeCompare(b);
            });
            
            sortedTitles.forEach(title => {
              const rows = tablesByTitle.get(title)!;
              const isLeave = title.toLowerCase().includes('leave') || title === 'Leave';
              
              // Define columns based on whether it's a leave table
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
              
              // Sort rows by week start date
              rows.sort((a, b) => new Date(a.weekStartDate).getTime() - new Date(b.weekStartDate).getTime());
              
              groupedData[employeeKey].tables.push({
                title,
                columns,
                rows
              });
            });
          });

          setGroupedPreviewData(groupedData);
        }
        
        // For backward compatibility, also set the original format
        // Flatten the grouped data for backward compatibility
        const backwardCompatRows: any[] = [];
        filteredData.forEach((weekData: any) => {
          (weekData.categories || []).forEach((cat: any) => {
            (cat.items || []).forEach((item: any) => {
              const dailyHours = item.dailyHours || [];
              const total = dailyHours.slice(0, 5).reduce((sum: number, h: any) => sum + (parseFloat(h) || 0), 0);
              backwardCompatRows.push({
                employeeName: weekData.employeeName,
                employeeEmail: weekData.employeeEmail,
                weekStartDate: weekData.weekStartDate,
                status: weekData.status || 'Draft',
                mon: dailyHours[0] ? parseFloat(dailyHours[0]).toFixed(2) : '',
                tue: dailyHours[1] ? parseFloat(dailyHours[1]).toFixed(2) : '',
                wed: dailyHours[2] ? parseFloat(dailyHours[2]).toFixed(2) : '',
                thu: dailyHours[3] ? parseFloat(dailyHours[3]).toFixed(2) : '',
                fri: dailyHours[4] ? parseFloat(dailyHours[4]).toFixed(2) : '',
                total: total.toFixed(2)
              });
            });
          });
        });
        
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
        setPreviewRows(backwardCompatRows);
      } else if (reportType === 'timesheet-entries') {
        const rawEntries = await previewDetailedTimesheetRaw(filter);
        
        // Check if filtering by individual user, project-wise, or team-wise
        const isIndividualUserFilter = filter.employeeIds && filter.employeeIds.length > 0;
        const isProjectWiseFilter = filter.projectId && filter.projectId !== '';
        const isTeamWiseFilter = filter.teamId && filter.teamId !== '';
        
        // Filter employees first
        const filteredEmployees = (rawEntries || []).filter((employee: any) => {
          if (!employee || !employee.employeeName || !employee.employeeEmail) {
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
        // Create separate tables for each project/team when user works on multiple projects/teams
        // When employee has single project/team: create one table
        // When employee has multiple projects/teams: create separate table for each
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
            
            // Collect all unique project/team titles from employee's tables
            const allTitles = new Set<string>();
            (employee.tables || []).forEach((table: any) => {
              if (table.title) {
                allTitles.add(table.title);
              }
            });
            
            const titlesArray = Array.from(allTitles);
            const projectTitles = titlesArray.filter(t => t.includes('Project:'));
            const teamTitles = titlesArray.filter(t => t.includes('Team:'));
            
            // Check if user has ONLY ONE project (and NO teams)
            if (projectTitles.length === 1 && teamTitles.length === 0) {
              // Single project only - combine all entries into one table
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
              
              // Create a single table for this employee
              const projectName = projectTitles[0].replace('Project: ', '').trim();
              groupedData[employeeKey].tables.push({
                title: `Timesheet Entries for ${projectName}`,
                columns: [
                  { key: 'date', header: 'Date', width: '15%' },
                  { key: 'responsible', header: 'Responsible', width: '20%' },
                  { key: 'description', header: 'Description', width: '40%' },
                  { key: 'quantity', header: 'Time Spent (Hours)', width: '25%' },
                ],
                rows: allEmployeeRows
              });
            }
            // Check if user has ONLY ONE team (and NO projects)
            else if (teamTitles.length === 1 && projectTitles.length === 0) {
              // Single team only - combine all entries into one table
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
              
              // Create a single table for this employee
              const teamName = teamTitles[0].replace('Team: ', '').trim();
              groupedData[employeeKey].tables.push({
                title: `Timesheet Entries for ${teamName}`,
                columns: [
                  { key: 'date', header: 'Date', width: '15%' },
                  { key: 'responsible', header: 'Responsible', width: '20%' },
                  { key: 'description', header: 'Description', width: '40%' },
                  { key: 'quantity', header: 'Time Spent (Hours)', width: '25%' },
                ],
                rows: allEmployeeRows
              });
            }
            // User has multiple projects/teams or mixed entries - show separate tables for each
            else if (titlesArray.length > 1) {
              // Create separate table for each project/team
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
                
                // Create rows for this specific project/team
                const tableRows: any[] = [];
                (table.rows || []).forEach((row: any) => {
                  tableRows.push({
                    date: row.date,
                    responsible: employee.employeeName,
                    description: row.description || '',
                    quantity: parseFloat(row.quantity || 0).toFixed(2)
                  });
                });
                
                // Sort rows by date
                tableRows.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
                
                // Extract clean project/team name from title
                let cleanTitle = table.title;
                if (isProjectTable) {
                  const projectName = table.title.replace('Project: ', '').trim();
                  cleanTitle = `Timesheet Entries for ${projectName}`;
                } else if (isTeamTable) {
                  const teamName = table.title.replace('Team: ', '').trim();
                  cleanTitle = `Timesheet Entries for ${teamName}`;
                }
                
                // Create separate table for this project/team
                groupedData[employeeKey].tables.push({
                  title: cleanTitle,
                  columns: [
                    { key: 'date', header: 'Date', width: '15%' },
                    { key: 'responsible', header: 'Responsible', width: '20%' },
                    { key: 'description', header: 'Description', width: '40%' },
                    { key: 'quantity', header: 'Time Spent (Hours)', width: '25%' },
                  ],
                  rows: tableRows
                });
              });
            }
            // Fallback - no clear project/team info
            else {
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
              
              // Create a single table
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
            }
          });
          
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
