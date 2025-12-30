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
    
    const titleRow = this.worksheet.addRow(['Timesheet Entries Report']);
    this.worksheet.mergeCells(titleRow.number, 1, titleRow.number, totalColumns);
    titleRow.font = { bold: true, size: 14 };
    titleRow.alignment = { horizontal: 'center' };
    titleRow.height = 17;

    const subtitleRow = this.worksheet.addRow([
      'Daily entry view grouped by project with employee time spent'
    ]);
    this.worksheet.mergeCells(subtitleRow.number, 1, subtitleRow.number, totalColumns);
    subtitleRow.font = { size: 9 };
    subtitleRow.alignment = { horizontal: 'center' };
    subtitleRow.height = 14;

    const start = filters?.startDate ? new Date(filters.startDate) : undefined;
    const end = filters?.endDate ? new Date(filters.endDate) : undefined;
    const startStr = start ? start.toISOString().slice(0, 10) : undefined;
    const endStr = end ? end.toISOString().slice(0, 10) : undefined;
    const periodText = startStr || endStr
      ? `Period: ${startStr ?? '...'} to ${endStr ?? '...'}`
      : 'Period: All time';

    const periodRow = this.worksheet.addRow([periodText]);
    this.worksheet.mergeCells(periodRow.number, 1, periodRow.number, totalColumns);
    periodRow.font = { size: 8, italic: true };
    periodRow.alignment = { horizontal: 'center' };
    periodRow.height = 13;

    this.worksheet.addRow([]);

    if (data.length === 0) {
      this.worksheet.addRow(['No data available for the selected period.']).font = {
        italic: true,
        size: 10,
      };
      return;
    }

    let grandTotalHours = 0;

    // If multiple employees (project-wise or team-wise filter), show each employee with their own table
    if (data.length > 1) {
      data.forEach((employeeData, employeeIndex) => {
        if (employeeIndex > 0) this.worksheet.addRow([]);

        // Employee title
        const employeeTitle = this.worksheet.addRow([employeeData.employeeName]);
        this.worksheet.mergeCells(employeeTitle.number, 1, employeeTitle.number, totalColumns);
        employeeTitle.font = { bold: true, size: 12 };

        // Flatten all entries for this employee
        const entries = this.flattenEmployeeEntries(employeeData);

        // Add table headers
        const headers = ['Date', 'Responsible', 'Description', 'Time Spent (Hours)'];
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
        grandTotalHours += employeeTotal;
        const totalRow = this.addDataRow(['', '', 'Total (Hours)', this.formatHoursToHHMM(employeeTotal)]);
        const totalCells = [
          this.worksheet.getCell(totalRow.number, 3),
          this.worksheet.getCell(totalRow.number, 4),
        ];
        totalCells.forEach((cell) => (cell.font = { bold: true, size: 10 }));
      });

      // Grand total row (only for multiple employees)
      this.worksheet.addRow([]);
      const grandRow = this.addDataRow(['', '', 'Grand Total (Hours)', this.formatHoursToHHMM(grandTotalHours)]);
      const grandCells = [
        this.worksheet.getCell(grandRow.number, 3),
        this.worksheet.getCell(grandRow.number, 4),
      ];
      grandCells.forEach((cell) => (cell.font = { bold: true, size: 11 }));
    } else {
      // Single employee (individual user filter) - show entries grouped by project/team
      const employeeData = data[0];

      // Collect all unique project/team names from all tables
      const allTitles = new Set<string>();
      employeeData.tables.forEach(table => {
        allTitles.add(table.title);
      });
      
      const titlesArray = Array.from(allTitles);
      const projectTitles = titlesArray.filter(t => t.includes('Project:'));
      const teamTitles = titlesArray.filter(t => t.includes('Team:'));
      
      // Check if user has ONLY ONE project (and NO teams)
      if (projectTitles.length === 1 && teamTitles.length === 0) {
        // Single project only - combine all entries into one table
        const projectName = projectTitles[0].replace('Project: ', '').trim();
        
        // Project title
        const projectTitle = this.worksheet.addRow([`Timesheet Entries for ${projectName}`]);
        this.worksheet.mergeCells(projectTitle.number, 1, projectTitle.number, totalColumns);
        projectTitle.font = { bold: true, size: 12 };

        // Flatten all entries for this employee
        const entries = this.flattenEmployeeEntries(employeeData);

        // Add table headers
        const headers = ['Date', 'Responsible', 'Description', 'Time Spent (Hours)'];
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
        const totalRow = this.addDataRow(['', '', 'Total (Hours)', this.formatHoursToHHMM(employeeTotal)]);
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
        const teamTitle = this.worksheet.addRow([`Timesheet Entries for ${teamName}`]);
        this.worksheet.mergeCells(teamTitle.number, 1, teamTitle.number, totalColumns);
        teamTitle.font = { bold: true, size: 12 };

        // Flatten all entries for this employee
        const entries = this.flattenEmployeeEntries(employeeData);

        // Add table headers
        const headers = ['Date', 'Responsible', 'Description', 'Time Spent (Hours)'];
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
        const totalRow = this.addDataRow(['', '', 'Total (Hours)', this.formatHoursToHHMM(employeeTotal)]);
        const totalCells = [
          this.worksheet.getCell(totalRow.number, 3),
          this.worksheet.getCell(totalRow.number, 4),
        ];
        totalCells.forEach((cell) => (cell.font = { bold: true, size: 10 }));
      }
      // User has multiple projects/teams or mixed entries - show separate tables for each
      else if (titlesArray.length > 1) {
        // Create separate table for each project/team
        let isFirstTable = true;
        
        employeeData.tables.forEach((table) => {
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
          this.worksheet.mergeCells(tableTitle.number, 1, tableTitle.number, totalColumns);
          tableTitle.font = { bold: true, size: 12 };

          // Add table headers
          const headers = ['Date', 'Responsible', 'Description', 'Time Spent (Hours)'];
          this.addHeaderRow(headers);
          const hdr = this.worksheet.lastRow;
          if (hdr) {
            hdr.font = { bold: true, size: 9 };
            hdr.height = 14;
          }

          // Sort rows by date (newest first)
          const sortedRows = table.rows
            .slice()
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
          const totalRow = this.addDataRow(['', '', 'Total (Hours)', this.formatHoursToHHMM(tableTotal)]);
          const totalCells = [
            this.worksheet.getCell(totalRow.number, 3),
            this.worksheet.getCell(totalRow.number, 4),
          ];
          totalCells.forEach((cell) => (cell.font = { bold: true, size: 10 }));
        });
      }
      // Fallback - no clear project/team info
      else {
        // Employee title
        const employeeTitle = this.worksheet.addRow([employeeData.employeeName]);
        this.worksheet.mergeCells(employeeTitle.number, 1, employeeTitle.number, totalColumns);
        employeeTitle.font = { bold: true, size: 12 };

        // Flatten all entries for this employee
        const entries = this.flattenEmployeeEntries(employeeData);

        // Add table headers
        const headers = ['Date', 'Responsible', 'Description', 'Time Spent (Hours)'];
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
        const totalRow = this.addDataRow(['', '', 'Total (Hours)', this.formatHoursToHHMM(employeeTotal)]);
        const totalCells = [
          this.worksheet.getCell(totalRow.number, 3),
          this.worksheet.getCell(totalRow.number, 4),
        ];
        totalCells.forEach((cell) => (cell.font = { bold: true, size: 10 }));
      }
    }
  }

  private flattenEmployeeEntries(employeeData: {
    employeeName: string;
    employeeEmail: string;
    tables: Array<{ title: string; rows: Array<{ date: string; description: string; status: string; quantity: string }> }>;  
  }) {
    type FlatEntry = {
      employeeName: string;
      date: string;
      rawDate: Date;
      description: string;
      hours: number;
    };

    const entries: FlatEntry[] = [];

    employeeData.tables.forEach((table) => {
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
    return `${String(wholeHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
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
    const possibleLogoPaths = [
      path.join(__dirname, '../../../../assets/logo.png'),
      path.join(process.cwd(), 'apps/api/src/assets/logo.png'),
      path.join(process.cwd(), 'assets/logo.png'),
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
        // continue checking other paths
      }
    }
    return null;
  }

  /**
   * Adds branding and address rows so Excel matches the PDF header.
   */
  private addCompanyHeader(totalColumns: number, logoId: number | null) {
    // Align brand text in columns 2-4; leave col 1 for logo placement
    const brandRow = this.worksheet.addRow(['', 'ALLION']);
    brandRow.font = { bold: true, size: 20, color: { argb: 'FF035082' } };
    brandRow.height = 24;
    this.worksheet.mergeCells(brandRow.number, 2, brandRow.number, totalColumns);

    const nameRow = this.worksheet.addRow(['', 'Allion Technologies (Pvt) Ltd']);
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
    lineCell.border = { bottom: { style: 'thin', color: { argb: 'FF000000' } } };

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

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
    await (this as any).workbook.xlsx.write(res);
    res.end();
  }
}
