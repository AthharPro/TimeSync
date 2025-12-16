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

    const entriesByProject = this.groupEntriesByProject(data);

    if (entriesByProject.size === 0) {
      this.worksheet.addRow(['No data available for the selected period.']).font = {
        italic: true,
        size: 10,
      };
      return;
    }

    const sortedProjects = Array.from(entriesByProject.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );
    let grandTotalHours = 0;

    sortedProjects.forEach(([projectName, entries], idx) => {
      if (idx > 0) this.worksheet.addRow([]);

      const projectTitle = this.worksheet.addRow([
        `Timesheet Entries for the ${projectName}`,
      ]);
      this.worksheet.mergeCells(projectTitle.number, 1, projectTitle.number, totalColumns);
      projectTitle.font = { bold: true, size: 12 };

      const headers = ['Date', 'Employee', 'Description', 'Time Spent (Hours)'];
      this.addHeaderRow(headers);
      const hdr = this.worksheet.lastRow;
      if (hdr) {
        hdr.font = { bold: true, size: 9 };
        hdr.height = 14;
      }

      const sortedRows = entries
        .slice()
        .sort((a, b) => {
          const dateDiff = b.rawDate.getTime() - a.rawDate.getTime();
          if (dateDiff !== 0) return dateDiff;
          return a.employeeName.localeCompare(b.employeeName);
        });

      sortedRows.forEach((row) => {
        const cells = [
          this.formatDateForDisplay(row.date),
          row.employeeName,
          row.description || '-',
          this.formatHoursToHHMM(row.hours),
        ];
        this.addDataRow(cells);
      });

      const projectTotal = entries.reduce((sum, e) => sum + e.hours, 0);
      grandTotalHours += projectTotal;
      const totalRow = this.addDataRow(['', '', 'Total (Hours)', this.formatHoursToHHMM(projectTotal)]);
      const totalCells = [
        this.worksheet.getCell(totalRow.number, 3),
        this.worksheet.getCell(totalRow.number, 4),
      ];
      totalCells.forEach((cell) => (cell.font = { bold: true, size: 10 }));
    });

    this.worksheet.addRow([]);
    const grandRow = this.addDataRow(['', '', 'Grand Total (Hours)', this.formatHoursToHHMM(grandTotalHours)]);
    const grandCells = [
      this.worksheet.getCell(grandRow.number, 3),
      this.worksheet.getCell(grandRow.number, 4),
    ];
    grandCells.forEach((cell) => (cell.font = { bold: true, size: 11 }));
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
          projectMap.get(projectName)!.push(entry);
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
