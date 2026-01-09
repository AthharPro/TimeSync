import { BaseExcelGenerator } from '../base/BaseExcelGenerator';
import path from 'path';
import fs from 'fs';

type TimesheetEntryData = Array<{
  employeeName: string;
  employeeEmail: string;
  tables: Array<{
    title: string;
    rows: Array<{
      date: string;
      description: string;
      status: string;
      quantity: string;
    }>;
  }>;
}>;

export class TimesheetEntriesExcel extends BaseExcelGenerator {
  constructor() {
    super('Timesheet Entries');
  }

  build(data: TimesheetEntryData, filters?: Record<string, any>) {
    const totalColumns = 4;

    // Company header to mirror PDF (logo + address)
    const logoId = this.tryAddLogoImage();
    this.addCompanyHeader(totalColumns, logoId);

    if (data.length === 0) {
      this.worksheet.addRow([
        'No data available for the selected period.',
      ]).font = {
        italic: true,
        size: 10,
      };
      return;
    }

    // If multiple employees (project-wise or team-wise filter), show each employee with their own table
    if (data.length > 1) {
      // Collect all unique project/team names from all tables
      const allTitles = new Set<string>();
      data.forEach((emp) => {
        emp.tables.forEach((table) => {
          allTitles.add(table.title);
        });
      });

      // Determine the main title based on common pattern
      let mainTitle = '';
      const titlesArray = Array.from(allTitles);

      // Check if all titles are for the same project or team
      const projectTitles = titlesArray.filter((t) => t.includes('Project:'));
      const teamTitles = titlesArray.filter((t) => t.includes('Team:'));

      // Check if ALL titles are teams (and NO projects)
      if (
        teamTitles.length > 0 &&
        projectTitles.length === 0 &&
        titlesArray.length === teamTitles.length
      ) {
        // All entries are from teams only
        const teamName = this.cleanProjectName(
          teamTitles[0].split('Team:')[1].trim()
        );
        mainTitle = `Timesheet Entries for ${teamName}`;

        data.forEach((employeeData, employeeIndex) => {
          if (employeeIndex > 0) this.worksheet.addRow([]); // Spacing between employees

          // Add title for each employee
          const titleRow = this.worksheet.addRow([mainTitle]);
          this.worksheet.mergeCells(
            titleRow.number,
            1,
            titleRow.number,
            totalColumns
          );
          titleRow.font = { bold: true, size: 12 };

          // Flatten all entries for this employee
          const entries = this.flattenEmployeeEntries(employeeData);

          // Add table headers
          const headers = [
            'Date',
            'Responsible',
            'Description',
            'Time Spent (Hours)',
          ];
          this.addHeaderRow(headers);
          const hdr = this.worksheet.lastRow;
          if (hdr) {
            hdr.font = { bold: true, size: 9 };
            hdr.height = 14;
          }

          // Sort entries by date (newest first)
          const sortedEntries = entries
            .slice()
            .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

          // Add data rows
          sortedEntries.forEach((row) => {
            const cells = [
              this.formatDateForDisplay(row.date),
              row.employeeName,
              row.description || '-',
              this.formatHoursToHHMM(row.hours),
            ];
            this.addDataRow(cells);
          });

          // Add total row for this employee
          const employeeTotal = entries.reduce((sum, e) => sum + e.hours, 0);
          const totalRow = this.addDataRow([
            '',
            '',
            'Total (Hours)',
            this.formatHoursToHHMM(employeeTotal),
          ]);
          const totalCells = [
            this.worksheet.getCell(totalRow.number, 3),
            this.worksheet.getCell(totalRow.number, 4),
          ];
          totalCells.forEach((cell) => (cell.font = { bold: true, size: 10 }));
        });
      }
      // Check if ALL titles are projects (and NO teams)
      else if (
        projectTitles.length > 0 &&
        teamTitles.length === 0 &&
        titlesArray.length === projectTitles.length
      ) {
        // All entries are from projects only
        const projectName = this.cleanProjectName(
          projectTitles[0].split('Project:')[1].trim()
        );
        mainTitle = `Timesheet Entries for ${projectName} Project`;

        // Add main title row
        const mainTitleRow = this.worksheet.addRow([mainTitle]);
        this.worksheet.mergeCells(
          mainTitleRow.number,
          1,
          mainTitleRow.number,
          totalColumns
        );
        mainTitleRow.font = { bold: true, size: 14 };
        this.worksheet.addRow([]); // Empty row for spacing

        data.forEach((employeeData, employeeIndex) => {
          if (employeeIndex > 0) this.worksheet.addRow([]); // Spacing between employees

          // Add title for each employee
          const titleRow = this.worksheet.addRow([mainTitle]);
          this.worksheet.mergeCells(
            titleRow.number,
            1,
            titleRow.number,
            totalColumns
          );
          titleRow.font = { bold: true, size: 12 };

          // Flatten all entries for this employee
          const entries = this.flattenEmployeeEntries(employeeData);

          // Add table headers
          const headers = [
            'Date',
            'Responsible',
            'Description',
            'Time Spent (Hours)',
          ];
          this.addHeaderRow(headers);
          const hdr = this.worksheet.lastRow;
          if (hdr) {
            hdr.font = { bold: true, size: 9 };
            hdr.height = 14;
          }

          // Sort entries by date (newest first)
          const sortedEntries = entries
            .slice()
            .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

          // Add data rows
          sortedEntries.forEach((row) => {
            const cells = [
              this.formatDateForDisplay(row.date),
              row.employeeName,
              row.description || '-',
              this.formatHoursToHHMM(row.hours),
            ];
            this.addDataRow(cells);
          });

          // Add total row for this employee
          const employeeTotal = entries.reduce((sum, e) => sum + e.hours, 0);
          const totalRow = this.addDataRow([
            '',
            '',
            'Total (Hours)',
            this.formatHoursToHHMM(employeeTotal),
          ]);
          const totalCells = [
            this.worksheet.getCell(totalRow.number, 3),
            this.worksheet.getCell(totalRow.number, 4),
          ];
          totalCells.forEach((cell) => (cell.font = { bold: true, size: 10 }));
        });
      }
      // Mixed project and team entries
      else if (projectTitles.length > 0 && teamTitles.length > 0) {
        mainTitle = 'Timesheet Entries - Mixed Work';

        // Add main title row
        const mainTitleRow = this.worksheet.addRow([mainTitle]);
        this.worksheet.mergeCells(
          mainTitleRow.number,
          1,
          mainTitleRow.number,
          totalColumns
        );
        mainTitleRow.font = { bold: true, size: 14 };
        this.worksheet.addRow([]); // Empty row for spacing

        data.forEach((employeeData, employeeIndex) => {
          if (employeeIndex > 0) this.worksheet.addRow([]); // Spacing between employees

          // Employee subtitle
          const employeeTitle = this.worksheet.addRow([
            employeeData.employeeName,
          ]);
          this.worksheet.mergeCells(
            employeeTitle.number,
            1,
            employeeTitle.number,
            totalColumns
          );
          employeeTitle.font = { bold: true, size: 12 };

          // Flatten all entries for this employee
          const entries = this.flattenEmployeeEntries(employeeData);

          // Add table headers
          const headers = [
            'Date',
            'Responsible',
            'Description',
            'Time Spent (Hours)',
          ];
          this.addHeaderRow(headers);
          const hdr = this.worksheet.lastRow;
          if (hdr) {
            hdr.font = { bold: true, size: 9 };
            hdr.height = 14;
          }

          // Sort entries by date (newest first)
          const sortedEntries = entries
            .slice()
            .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

          // Add data rows
          sortedEntries.forEach((row) => {
            const cells = [
              this.formatDateForDisplay(row.date),
              row.employeeName,
              row.description || '-',
              this.formatHoursToHHMM(row.hours),
            ];
            this.addDataRow(cells);
          });

          // Add total row for this employee
          const employeeTotal = entries.reduce((sum, e) => sum + e.hours, 0);
          const totalRow = this.addDataRow([
            '',
            '',
            'Total (Hours)',
            this.formatHoursToHHMM(employeeTotal),
          ]);
          const totalCells = [
            this.worksheet.getCell(totalRow.number, 3),
            this.worksheet.getCell(totalRow.number, 4),
          ];
          totalCells.forEach((cell) => (cell.font = { bold: true, size: 10 }));
        });
      }
      // Multiple projects
      else if (projectTitles.length > 1) {
        mainTitle = 'Timesheet Entries - Multiple Projects';

        // Add main title row
        const mainTitleRow = this.worksheet.addRow([mainTitle]);
        this.worksheet.mergeCells(
          mainTitleRow.number,
          1,
          mainTitleRow.number,
          totalColumns
        );
        mainTitleRow.font = { bold: true, size: 14 };
        this.worksheet.addRow([]); // Empty row for spacing

        data.forEach((employeeData, employeeIndex) => {
          if (employeeIndex > 0) this.worksheet.addRow([]); // Spacing between employees

          // Employee subtitle
          const employeeTitle = this.worksheet.addRow([
            employeeData.employeeName,
          ]);
          this.worksheet.mergeCells(
            employeeTitle.number,
            1,
            employeeTitle.number,
            totalColumns
          );
          employeeTitle.font = { bold: true, size: 12 };

          // Flatten all entries for this employee
          const entries = this.flattenEmployeeEntries(employeeData);

          // Add table headers
          const headers = [
            'Date',
            'Responsible',
            'Description',
            'Time Spent (Hours)',
          ];
          this.addHeaderRow(headers);
          const hdr = this.worksheet.lastRow;
          if (hdr) {
            hdr.font = { bold: true, size: 9 };
            hdr.height = 14;
          }

          // Sort entries by date (newest first)
          const sortedEntries = entries
            .slice()
            .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

          // Add data rows
          sortedEntries.forEach((row) => {
            const cells = [
              this.formatDateForDisplay(row.date),
              row.employeeName,
              row.description || '-',
              this.formatHoursToHHMM(row.hours),
            ];
            this.addDataRow(cells);
          });

          // Add total row for this employee
          const employeeTotal = entries.reduce((sum, e) => sum + e.hours, 0);
          const totalRow = this.addDataRow([
            '',
            '',
            'Total (Hours)',
            this.formatHoursToHHMM(employeeTotal),
          ]);
          const totalCells = [
            this.worksheet.getCell(totalRow.number, 3),
            this.worksheet.getCell(totalRow.number, 4),
          ];
          totalCells.forEach((cell) => (cell.font = { bold: true, size: 10 }));
        });
      }
      // Multiple teams
      else if (teamTitles.length > 1) {
        mainTitle = 'Timesheet Entries - Multiple Teams';

        // Add main title row
        const mainTitleRow = this.worksheet.addRow([mainTitle]);
        this.worksheet.mergeCells(
          mainTitleRow.number,
          1,
          mainTitleRow.number,
          totalColumns
        );
        mainTitleRow.font = { bold: true, size: 14 };
        this.worksheet.addRow([]); // Empty row for spacing

        data.forEach((employeeData, employeeIndex) => {
          if (employeeIndex > 0) this.worksheet.addRow([]); // Spacing between employees

          // Employee subtitle
          const employeeTitle = this.worksheet.addRow([
            employeeData.employeeName,
          ]);
          this.worksheet.mergeCells(
            employeeTitle.number,
            1,
            employeeTitle.number,
            totalColumns
          );
          employeeTitle.font = { bold: true, size: 12 };

          // Flatten all entries for this employee
          const entries = this.flattenEmployeeEntries(employeeData);

          // Add table headers
          const headers = [
            'Date',
            'Responsible',
            'Description',
            'Time Spent (Hours)',
          ];
          this.addHeaderRow(headers);
          const hdr = this.worksheet.lastRow;
          if (hdr) {
            hdr.font = { bold: true, size: 9 };
            hdr.height = 14;
          }

          // Sort entries by date (newest first)
          const sortedEntries = entries
            .slice()
            .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

          // Add data rows
          sortedEntries.forEach((row) => {
            const cells = [
              this.formatDateForDisplay(row.date),
              row.employeeName,
              row.description || '-',
              this.formatHoursToHHMM(row.hours),
            ];
            this.addDataRow(cells);
          });

          // Add total row for this employee
          const employeeTotal = entries.reduce((sum, e) => sum + e.hours, 0);
          const totalRow = this.addDataRow([
            '',
            '',
            'Total (Hours)',
            this.formatHoursToHHMM(employeeTotal),
          ]);
          const totalCells = [
            this.worksheet.getCell(totalRow.number, 3),
            this.worksheet.getCell(totalRow.number, 4),
          ];
          totalCells.forEach((cell) => (cell.font = { bold: true, size: 10 }));
        });
      }
      // Fallback
      else {
        mainTitle = 'Timesheet Entries';

        // Add main title row
        const mainTitleRow = this.worksheet.addRow([mainTitle]);
        this.worksheet.mergeCells(
          mainTitleRow.number,
          1,
          mainTitleRow.number,
          totalColumns
        );
        mainTitleRow.font = { bold: true, size: 14 };
        this.worksheet.addRow([]); // Empty row for spacing

        data.forEach((employeeData, employeeIndex) => {
          if (employeeIndex > 0) this.worksheet.addRow([]); // Spacing between employees

          // Employee subtitle
          const employeeTitle = this.worksheet.addRow([
            employeeData.employeeName,
          ]);
          this.worksheet.mergeCells(
            employeeTitle.number,
            1,
            employeeTitle.number,
            totalColumns
          );
          employeeTitle.font = { bold: true, size: 12 };

          // Flatten all entries for this employee
          const entries = this.flattenEmployeeEntries(employeeData);

          // Add table headers
          const headers = [
            'Date',
            'Responsible',
            'Description',
            'Time Spent (Hours)',
          ];
          this.addHeaderRow(headers);
          const hdr = this.worksheet.lastRow;
          if (hdr) {
            hdr.font = { bold: true, size: 9 };
            hdr.height = 14;
          }

          // Sort entries by date (newest first)
          const sortedEntries = entries
            .slice()
            .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

          // Add data rows
          sortedEntries.forEach((row) => {
            const cells = [
              this.formatDateForDisplay(row.date),
              row.employeeName,
              row.description || '-',
              this.formatHoursToHHMM(row.hours),
            ];
            this.addDataRow(cells);
          });

          // Add total row for this employee
          const employeeTotal = entries.reduce((sum, e) => sum + e.hours, 0);
          const totalRow = this.addDataRow([
            '',
            '',
            'Total (Hours)',
            this.formatHoursToHHMM(employeeTotal),
          ]);
          const totalCells = [
            this.worksheet.getCell(totalRow.number, 3),
            this.worksheet.getCell(totalRow.number, 4),
          ];
          totalCells.forEach((cell) => (cell.font = { bold: true, size: 10 }));
        });
      }
    } else {
      // Single employee (individual user filter) - show entries grouped by project/team
      const employeeData = data[0];

      // Collect all unique project/team names from all tables (excluding 'Other' and 'Leave')
      const allTitles = new Set<string>();
      employeeData.tables
        .filter((table) => table.title !== 'Other' && table.title !== 'Leave')
        .forEach((table) => {
          allTitles.add(table.title);
        });

      const titlesArray = Array.from(allTitles);
      const projectTitles = titlesArray.filter((t) => t.includes('Project:'));
      const teamTitles = titlesArray.filter((t) => t.includes('Team:'));

      // Check if user has ONLY ONE project (and NO teams)
      if (projectTitles.length === 1 && teamTitles.length === 0) {
        // Single project only - combine all entries into one table
        const projectName = projectTitles[0].replace('Project: ', '').trim();

        // Project title
        const projectTitle = this.worksheet.addRow([
          `Timesheet Entries for ${projectName}`,
        ]);
        this.worksheet.mergeCells(
          projectTitle.number,
          1,
          projectTitle.number,
          totalColumns
        );
        projectTitle.font = { bold: true, size: 12 };

        // Flatten all entries for this employee
        const entries = this.flattenEmployeeEntries(employeeData);

        // Add table headers
        const headers = [
          'Date',
          'Responsible',
          'Description',
          'Time Spent (Hours)',
        ];
        this.addHeaderRow(headers);
        const hdr = this.worksheet.lastRow;
        if (hdr) {
          hdr.font = { bold: true, size: 9 };
          hdr.height = 14;
        }

        // Sort entries by date (newest first)
        const sortedEntries = entries
          .slice()
          .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

        // Add data rows
        sortedEntries.forEach((row) => {
          const cells = [
            this.formatDateForDisplay(row.date),
            row.employeeName,
            row.description || '-',
            this.formatHoursToHHMM(row.hours),
          ];
          this.addDataRow(cells);
        });

        // Add total row
        const employeeTotal = entries.reduce((sum, e) => sum + e.hours, 0);
        const totalRow = this.addDataRow([
          '',
          '',
          'Total (Hours)',
          this.formatHoursToHHMM(employeeTotal),
        ]);
        const totalCells = [
          this.worksheet.getCell(totalRow.number, 3),
          this.worksheet.getCell(totalRow.number, 4),
        ];
        totalCells.forEach((cell) => (cell.font = { bold: true, size: 10 }));
      }
      // Check if user has ONLY ONE team (and NO projects)
      else if (teamTitles.length === 1 && projectTitles.length === 0) {
        // Single team only - combine all entries into one table
        const teamName = teamTitles[0].replace('Team: ', '').trim();

        // Team title
        const teamTitle = this.worksheet.addRow([
          `Timesheet Entries for ${teamName}`,
        ]);
        this.worksheet.mergeCells(
          teamTitle.number,
          1,
          teamTitle.number,
          totalColumns
        );
        teamTitle.font = { bold: true, size: 12 };

        // Flatten all entries for this employee
        const entries = this.flattenEmployeeEntries(employeeData);

        // Add table headers
        const headers = [
          'Date',
          'Responsible',
          'Description',
          'Time Spent (Hours)',
        ];
        this.addHeaderRow(headers);
        const hdr = this.worksheet.lastRow;
        if (hdr) {
          hdr.font = { bold: true, size: 9 };
          hdr.height = 14;
        }

        // Sort entries by date (newest first)
        const sortedEntries = entries
          .slice()
          .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

        // Add data rows
        sortedEntries.forEach((row) => {
          const cells = [
            this.formatDateForDisplay(row.date),
            row.employeeName,
            row.description || '-',
            this.formatHoursToHHMM(row.hours),
          ];
          this.addDataRow(cells);
        });

        // Add total row
        const employeeTotal = entries.reduce((sum, e) => sum + e.hours, 0);
        const totalRow = this.addDataRow([
          '',
          '',
          'Total (Hours)',
          this.formatHoursToHHMM(employeeTotal),
        ]);
        const totalCells = [
          this.worksheet.getCell(totalRow.number, 3),
          this.worksheet.getCell(totalRow.number, 4),
        ];
        totalCells.forEach((cell) => (cell.font = { bold: true, size: 10 }));
      }
      // User has multiple projects/teams or mixed entries - show separate tables for each
      else if (titlesArray.length > 1) {
        // Create separate table for each project/team (excluding 'Other' and 'Leave')
        let isFirstTable = true;

        employeeData.tables
          .filter((table) => table.title !== 'Other' && table.title !== 'Leave')
          .forEach((table) => {
            if (!isFirstTable) {
              this.worksheet.addRow([]);
            }
            isFirstTable = false;

            // Extract clean project/team name from title
            let cleanTitle = table.title;
            const isProjectTable = table.title?.includes('Project:');
            const isTeamTable = table.title?.includes('Team:');

            if (isProjectTable) {
              const projectName = table.title.replace('Project: ', '').trim();
              cleanTitle = `Timesheet Entries for ${projectName}`;
            } else if (isTeamTable) {
              const teamName = table.title.replace('Team: ', '').trim();
              cleanTitle = `Timesheet Entries for ${teamName}`;
            }

            // Table title
            const tableTitle = this.worksheet.addRow([cleanTitle]);
            this.worksheet.mergeCells(
              tableTitle.number,
              1,
              tableTitle.number,
              totalColumns
            );
            tableTitle.font = { bold: true, size: 12 };

            // Add table headers
            const headers = [
              'Date',
              'Responsible',
              'Description',
              'Time Spent (Hours)',
            ];
            this.addHeaderRow(headers);
            const hdr = this.worksheet.lastRow;
            if (hdr) {
              hdr.font = { bold: true, size: 9 };
              hdr.height = 14;
            }

            // Sort rows by date (newest first)
            const sortedRows = table.rows
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              );

            // Add data rows
            let tableTotal = 0;
            sortedRows.forEach((row) => {
              const hours = this.parseHours(row.quantity);
              tableTotal += hours;
              const cells = [
                this.formatDateForDisplay(row.date),
                employeeData.employeeName,
                row.description || '-',
                this.formatHoursToHHMM(hours),
              ];
              this.addDataRow(cells);
            });

            // Add total row for this project/team
            const totalRow = this.addDataRow([
              '',
              '',
              'Total (Hours)',
              this.formatHoursToHHMM(tableTotal),
            ]);
            const totalCells = [
              this.worksheet.getCell(totalRow.number, 3),
              this.worksheet.getCell(totalRow.number, 4),
            ];
            totalCells.forEach(
              (cell) => (cell.font = { bold: true, size: 10 })
            );
          });
      }
      // Fallback - no clear project/team info
      else {
        // Employee title
        const employeeTitle = this.worksheet.addRow([
          employeeData.employeeName,
        ]);
        this.worksheet.mergeCells(
          employeeTitle.number,
          1,
          employeeTitle.number,
          totalColumns
        );
        employeeTitle.font = { bold: true, size: 12 };

        // Flatten all entries for this employee
        const entries = this.flattenEmployeeEntries(employeeData);

        // Add table headers
        const headers = [
          'Date',
          'Responsible',
          'Description',
          'Time Spent (Hours)',
        ];
        this.addHeaderRow(headers);
        const hdr = this.worksheet.lastRow;
        if (hdr) {
          hdr.font = { bold: true, size: 9 };
          hdr.height = 14;
        }

        // Sort entries by date (newest first)
        const sortedEntries = entries
          .slice()
          .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

        // Add data rows
        sortedEntries.forEach((row) => {
          const cells = [
            this.formatDateForDisplay(row.date),
            row.employeeName,
            row.description || '-',
            this.formatHoursToHHMM(row.hours),
          ];
          this.addDataRow(cells);
        });

        // Add total row
        const employeeTotal = entries.reduce((sum, e) => sum + e.hours, 0);
        const totalRow = this.addDataRow([
          '',
          '',
          'Total (Hours)',
          this.formatHoursToHHMM(employeeTotal),
        ]);
        const totalCells = [
          this.worksheet.getCell(totalRow.number, 3),
          this.worksheet.getCell(totalRow.number, 4),
        ];
        totalCells.forEach((cell) => (cell.font = { bold: true, size: 10 }));
      }
    }
  }

  private cleanProjectName(name: string): string {
    // Remove trailing numbers/IDs that might be appended (e.g., "Test Project 30" -> "Test Project")
    // Match patterns like: " 30", " - 30", " (30)", etc.
    return name.replace(/\s*[-–—]?\s*\(?\d+\)?\s*$/, '').trim();
  }

  private flattenEmployeeEntries(employeeData: {
    employeeName: string;
    employeeEmail: string;
    tables: Array<{
      title: string;
      rows: Array<{
        date: string;
        description: string;
        status: string;
        quantity: string;
      }>;
    }>;
  }) {
    type FlatEntry = {
      employeeName: string;
      date: string;
      rawDate: Date;
      description: string;
      hours: number;
    };

    const entries: FlatEntry[] = [];

    employeeData.tables
      .filter((table) => table.title !== 'Other' && table.title !== 'Leave')
      .forEach((table) => {
        table.rows.forEach((row) => {
          const hours = this.parseHours(row.quantity);
          entries.push({
            employeeName: employeeData.employeeName,
            date: row.date,
            rawDate: new Date(row.date),
            description: row.description,
            hours,
          });
        });
      });

    return entries;
  }

  private groupEntriesByProject(data: TimesheetEntryData) {
    type FlatEntry = {
      projectName: string;
      employeeName: string;
      date: string;
      rawDate: Date;
      description: string;
      hours: number;
    };

    const projectMap = new Map<string, FlatEntry[]>();

    data.forEach((employee) => {
      employee.tables.forEach((table) => {
        const projectName = this.resolveProjectName(table.title);
        if (!projectMap.has(projectName)) {
          projectMap.set(projectName, []);
        }

        table.rows.forEach((row) => {
          const hours = this.parseHours(row.quantity);
          const entry: FlatEntry = {
            projectName,
            employeeName: employee.employeeName,
            date: row.date,
            rawDate: new Date(row.date),
            description: row.description,
            hours,
          };
          const array = projectMap.get(projectName);
          if (array) {
            array.push(entry);
          }
        });
      });
    });

    return projectMap;
  }

  private resolveProjectName(title: string): string {
    if (title.startsWith('Project: ')) return title.replace('Project: ', '');
    if (title.startsWith('Team: ')) return title.replace('Team: ', '');
    return title;
  }

  private parseHours(quantity: string): number {
    const num = parseFloat(quantity);
    return isNaN(num) ? 0 : num;
  }

  private formatHoursToHHMM(hours: number): string {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${String(wholeHours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0'
    )}`;
  }

  private formatDateForDisplay(dateStr: string): string {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Attempts to add the company logo to the workbook and returns the image id.
   */
  private tryAddLogoImage(): number | null {
    const runtimeAssetPath = path.join(process.cwd(), 'assets', 'logo.png');

    // Local dev fallback (nx serve / ts-node)
    const devAssetPath = path.join(
      process.cwd(),
      'apps/api/src/assets/logo.png'
    );

    const possibleLogoPaths = [
      runtimeAssetPath, // Azure + production build
      devAssetPath, // Local development
    ];

    for (const logoPath of possibleLogoPaths) {
      try {
        if (fs.existsSync(logoPath)) {
          return this.workbook.addImage({
            filename: logoPath,
            extension: 'png',
          });
        }
      } catch {
        // ignore and continue
      }
    }

    return null;
  }

  private addCompanyHeader(totalColumns: number, logoId: number | null) {
    // Align brand text in columns 2-4; leave col 1 for logo placement
    const brandRow = this.worksheet.addRow(['', 'ALLION']);
    brandRow.font = { bold: true, size: 20, color: { argb: 'FF035082' } };
    brandRow.height = 24;
    this.worksheet.mergeCells(
      brandRow.number,
      2,
      brandRow.number,
      totalColumns
    );

    const nameRow = this.worksheet.addRow([
      '',
      'Allion Technologies (Pvt) Ltd',
    ]);
    nameRow.font = { bold: true, size: 12 };
    this.worksheet.mergeCells(nameRow.number, 2, nameRow.number, totalColumns);

    const addressLines = [
      'Level 11, MAGA ONE',
      'No.200, Narahenpita - Nawala Rd',
      'Colombo 00500',
      'Sri Lanka',
    ];
    addressLines.forEach((line) => {
      const row = this.worksheet.addRow(['', line]);
      row.font = { size: 10 };
      this.worksheet.mergeCells(row.number, 2, row.number, totalColumns);
    });

    const lineRow = this.worksheet.addRow([]);
    this.worksheet.mergeCells(lineRow.number, 1, lineRow.number, totalColumns);
    const lineCell = this.worksheet.getCell(lineRow.number, 1);
    lineCell.border = {
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
    };

    if (logoId !== null) {
      const startRow = brandRow.number;
      const endRow = lineRow.number;
      // Cover first column to keep sizing similar to PDF header layout
      const range = `A${startRow}:A${endRow}`;
      this.worksheet.addImage(logoId, range);
    }

    // Spacer after header
    this.worksheet.addRow([]);
  }

  async write(res: any, filename: string): Promise<void> {
    this.autoSizeColumns();

    const columnMaxWidths = [14, 28, 48, 14];
    this.worksheet.columns.forEach((col, idx) => {
      const current = col.width ?? 10;
      const max = columnMaxWidths[idx] ?? 16;
      const min = 8;
      col.width = Math.max(Math.min(current, max), min);
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${filename}.xlsx`
    );
    await (this as any).workbook.xlsx.write(res);
    res.end();
  }
}
