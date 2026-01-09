import { BaseExcelGenerator } from '../base/BaseExcelGenerator';
import { ITimesheetReportData } from '../../../../interfaces/report';
import path from 'path';
import fs from 'fs';

export class DetailedTimesheetExcel extends BaseExcelGenerator {
  constructor() {
    super('Detailed Timesheet');
  }

  build(data: ITimesheetReportData[], _filters?: Record<string, any>) {
    // Align column structure with PDF (no status column in detail tables)
    const totalColumns = 9;

    // Company header (logo + address) to mirror PDF styling
    const logoId = this.tryAddLogoImage();
    this.addCompanyHeader(totalColumns, logoId);

    const titleRow = this.worksheet.addRow(['Detailed Timesheet Report']);
    this.worksheet.mergeCells(
      titleRow.number,
      1,
      titleRow.number,
      totalColumns
    );
    titleRow.font = { bold: true, size: 14 };
    titleRow.alignment = { horizontal: 'center' };
    titleRow.height = 17;

    const subtitleRow = this.worksheet.addRow([
      'Comprehensive breakdown of employee work hours and project allocations',
    ]);
    this.worksheet.mergeCells(
      subtitleRow.number,
      1,
      subtitleRow.number,
      totalColumns
    );
    subtitleRow.font = { size: 9 };
    subtitleRow.alignment = { horizontal: 'center' };
    subtitleRow.height = 14;

    const start = _filters?.startDate
      ? new Date(_filters.startDate)
      : undefined;
    const end = _filters?.endDate ? new Date(_filters.endDate) : undefined;
    const startStr = start ? start.toISOString().slice(0, 10) : undefined;
    const endStr = end ? end.toISOString().slice(0, 10) : undefined;
    const periodText =
      startStr || endStr
        ? `Period: ${startStr ?? '...'} to ${endStr ?? '...'}`
        : 'Period: All time';

    const periodRow = this.worksheet.addRow([periodText]);
    this.worksheet.mergeCells(
      periodRow.number,
      1,
      periodRow.number,
      totalColumns
    );
    periodRow.font = { size: 8, italic: true };
    periodRow.alignment = { horizontal: 'center' };
    periodRow.height = 13;

    this.worksheet.addRow([]);

    const grouped = this.groupByEmployee(data);

    const employees = Array.from(grouped.values()).sort((a, b) =>
      a.meta.employeeName.localeCompare(b.meta.employeeName)
    );

    employees.forEach((group, idx) => {
      if (idx > 0) this.worksheet.addRow([]);

      // Section header
      const sectionTitle = this.worksheet.addRow([
        `${group.meta.employeeName} - ${group.meta.employeeEmail}`,
      ]);
      this.worksheet.mergeCells(
        sectionTitle.number,
        1,
        sectionTitle.number,
        totalColumns
      );
      sectionTitle.font = { bold: true, size: 12 };

      // Build sub-tables
      const subTables = this.buildSubTables(group.rows);

      subTables.forEach((sub) => {
        // Sub-table title
        const subTitle = this.worksheet.addRow([sub.title]);
        this.worksheet.mergeCells(
          subTitle.number,
          1,
          subTitle.number,
          totalColumns
        );
        subTitle.font = { bold: true, size: 11 };

        // Headers aligned to PDF
        const headers = sub.includeWork
          ? [
              'Week Start',
              'Week End',
              'Work',
              'Mon',
              'Tue',
              'Wed',
              'Thu',
              'Fri',
              'Total',
            ]
          : [
              'Week Start',
              'Week End',
              'Mon',
              'Tue',
              'Wed',
              'Thu',
              'Fri',
              'Total',
            ];
        this.addHeaderRow(headers);
        const hdr = this.worksheet.lastRow;
        if (hdr) {
          hdr.font = { bold: true, size: 9 };
          hdr.height = 14;
        }

        // Rows sorted by week start
        sub.rows
          .slice()
          .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
          .forEach((r) => this.addDataRow(r.cells));

        // Small spacer after each sub-table
        this.worksheet.addRow([]);
      });

      // Per-employee Key Metrics
      const metricsTitle = this.worksheet.addRow(['Working Hours']);
      this.worksheet.mergeCells(
        metricsTitle.number,
        1,
        metricsTitle.number,
        totalColumns
      );
      metricsTitle.font = { bold: true, size: 11 };

      // Table header for metrics
      const metricsHeader = this.worksheet.addRow(['Day', '', '', 'Hours', '']);
      this.worksheet.mergeCells(
        metricsHeader.number,
        1,
        metricsHeader.number,
        3
      );
      this.worksheet.mergeCells(
        metricsHeader.number,
        4,
        metricsHeader.number,
        5
      );
      metricsHeader.font = { bold: true, size: 10 };

      const empStats = this.calculateEmployeeStats(group.rows);
      const empMetrics: Array<[string, string | number]> = [
        ['Monday', empStats.daily[0].toFixed(2) + ' h'],
        ['Tuesday', empStats.daily[1].toFixed(2) + ' h'],
        ['Wednesday', empStats.daily[2].toFixed(2) + ' h'],
        ['Thursday', empStats.daily[3].toFixed(2) + ' h'],
        ['Friday', empStats.daily[4].toFixed(2) + ' h'],
        ['Total', empStats.grandTotal.toFixed(2) + ' h'],
      ];
      empMetrics.forEach((entry) => {
        const row = this.worksheet.addRow([entry[0], '', '', entry[1], '']);
        this.worksheet.mergeCells(row.number, 1, row.number, 3);
        this.worksheet.mergeCells(row.number, 4, row.number, 5);
        row.font = { size: 10 };
        const labelCell = this.worksheet.getCell(row.number, 1);
        labelCell.alignment = { horizontal: 'left' };
        const valueCell = this.worksheet.getCell(row.number, 4);
        valueCell.alignment = { horizontal: 'left' };
      });
    });

    // Overall Summary & Key Metrics
    this.worksheet.addRow([]);
    const summaryTitle = this.worksheet.addRow(['Overall Summary']);
    this.worksheet.mergeCells(
      summaryTitle.number,
      1,
      summaryTitle.number,
      totalColumns
    );
    summaryTitle.font = { bold: true, size: 12 };

    const stats = this.calculateDetailedStatistics(data);
    const summaryHeader = this.worksheet.addRow([
      'Category',
      '',
      '',
      'Result',
      '',
    ]);
    this.worksheet.mergeCells(summaryHeader.number, 1, summaryHeader.number, 3);
    this.worksheet.mergeCells(summaryHeader.number, 4, summaryHeader.number, 5);
    summaryHeader.font = { bold: true, size: 10 };

    const summaryMetrics: Array<[string, string | number]> = [
      ['Total Employees', stats.totalEmployees],
      ['Total Teams', stats.totalTeams],
      ['Total Projects', stats.totalProjects],
      ['Absence Days', stats.otherDays],
      ['Grand Total Hours', `${stats.grandTotal} h`],
    ];
    summaryMetrics.forEach((entry) => {
      const row = this.worksheet.addRow([entry[0], '', '', entry[1], '']);
      this.worksheet.mergeCells(row.number, 1, row.number, 3);
      this.worksheet.mergeCells(row.number, 4, row.number, 5);
      row.font = { size: 10 };
      const labelCell = this.worksheet.getCell(row.number, 1);
      labelCell.alignment = { horizontal: 'left' };
      const valueCell = this.worksheet.getCell(row.number, 4);
      valueCell.alignment = { horizontal: 'left' };
    });
  }

  /**
   * Attempts to add the company logo to the workbook and returns the image id.
   * Mirrors the PDF logic for locating the logo so both outputs stay consistent.
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

  /**
   * Adds branding and address rows to align with the PDF header.
   */
  private addCompanyHeader(totalColumns: number, logoId: number | null) {
    // Reserve a few rows so the logo can sit alongside text
    const brandRow = this.worksheet.addRow(['', '', 'ALLION']);
    brandRow.font = { bold: true, size: 22, color: { argb: 'FF035082' } };
    brandRow.height = 26;
    this.worksheet.mergeCells(
      brandRow.number,
      3,
      brandRow.number,
      totalColumns
    );

    const nameRow = this.worksheet.addRow([
      '',
      '',
      'Allion Technologies (Pvt) Ltd',
    ]);
    nameRow.font = { bold: true, size: 12 };
    this.worksheet.mergeCells(nameRow.number, 3, nameRow.number, totalColumns);

    const addressLines = [
      'Level 11, MAGA ONE',
      'No.200, Narahenpita - Nawala Rd',
      'Colombo 00500',
      'Sri Lanka',
    ];

    addressLines.forEach((line) => {
      const row = this.worksheet.addRow(['', '', line]);
      row.font = { size: 10 };
      this.worksheet.mergeCells(row.number, 3, row.number, totalColumns);
    });

    // Underline separator similar to PDF header line
    const lineRow = this.worksheet.addRow([]);
    this.worksheet.mergeCells(lineRow.number, 1, lineRow.number, totalColumns);
    const lineCell = this.worksheet.getCell(lineRow.number, 1);
    lineCell.border = {
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
    };

    // Place logo over the reserved rows (left side)
    if (logoId !== null) {
      const startRow = brandRow.number;
      const endRow = lineRow.number; // place logo within header block
      // Cover first two columns to align with PDF layout
      const range = `A${startRow}:B${endRow}`;
      this.worksheet.addImage(logoId, range);
    }

    // Spacer after header
    this.worksheet.addRow([]);
  }

  private groupByEmployee(data: ITimesheetReportData[]) {
    const map = new Map<
      string,
      {
        meta: {
          employeeId: string;
          employeeName: string;
          employeeEmail: string;
        };
        rows: ITimesheetReportData[];
      }
    >();
    data.forEach((d) => {
      const key = `${d.employeeId}-${d.employeeName}`;
      if (!map.has(key)) {
        map.set(key, {
          meta: {
            employeeId: d.employeeId,
            employeeName: d.employeeName,
            employeeEmail: d.employeeEmail,
          },
          rows: [],
        });
      }
      const array = map.get(key);
      if (array) {
        array.rows.push(d);
      }
    });
    return map;
  }

  private buildSubTables(employeeWeeks: ITimesheetReportData[]) {
    type SubRow = { sortDate: Date; cells: (string | number)[] };
    type SubTable = { title: string; includeWork: boolean; rows: SubRow[] };
    const tablesByTitle = new Map<string, SubTable>();

    // First pass: aggregate all data by week+title to handle duplicate weeks
    // This matches the PDF aggregation logic exactly
    type WeekTitleKey = string; // Format: "2025-12-01_Project: ProjectName" or "2025-12-01_Team: TeamName"
    type AggregatedWeekItem = {
      weekStartRaw: Date;
      weekStart: string;
      weekEnd: string;
      title: string; // e.g., "Project: Project Alpha" or "Team: Engineering"
      includeWork: boolean;
      work?: string;
      dailyHours: number[];
    };
    const weekTitleMap = new Map<WeekTitleKey, AggregatedWeekItem>();

    for (const timesheetWeek of employeeWeeks) {
      const weekStartRaw = new Date(timesheetWeek.weekStartDate as any);
      const weekStart = this.formatDate(weekStartRaw);
      // Calculate week end as Friday (Monday + 4 days) to match PDF
      const weekEndRaw = new Date(weekStartRaw);
      weekEndRaw.setDate(weekStartRaw.getDate() + 4);
      const weekEnd = this.formatDate(weekEndRaw);

      // Filter out 'Other' and 'Leave' categories
      const filteredCategories = timesheetWeek.categories.filter(
        (category: any) =>
          category.category !== 'Other' && category.category !== 'Leave'
      );

      for (const category of filteredCategories) {
        for (const item of category.items) {
          const dailyHours = Array.isArray(item.dailyHours)
            ? item.dailyHours
            : [];

          let title: string | null = null;
          const includeWork = false;

          // Each project gets its own table with unique title
          if (item.projectName) {
            title = `Project: ${item.projectName}`;
          }
          // Each team gets its own table with unique title
          else if (item.teamName) {
            title = `Team: ${item.teamName}`;
          }
          // Use category name as-is, don't convert 'Other' to 'Leave'
          else {
            title = category.category;
          }

          // Skip items that don't belong to any specific category
          if (!title) continue;

          // Create unique key combining week start date and title
          // This ensures same project/team in different weeks are aggregated correctly
          const weekTitleKey: WeekTitleKey = `${weekStart}_${title}`;

          // Aggregate items with the same week+title combination
          if (!weekTitleMap.has(weekTitleKey)) {
            weekTitleMap.set(weekTitleKey, {
              weekStartRaw,
              weekStart,
              weekEnd,
              title,
              includeWork,
              work: includeWork ? item.work || '' : undefined,
              dailyHours: [0, 0, 0, 0, 0, 0, 0],
            });
          }

          const aggregatedItem = weekTitleMap.get(weekTitleKey);
          if (aggregatedItem) {
            // Sum up the hours for each day
            dailyHours.forEach((hours, index) => {
              const numHours =
                typeof hours === 'string' ? parseFloat(hours) : hours || 0;
              aggregatedItem.dailyHours[index] += isNaN(numHours)
                ? 0
                : numHours;
            });
          }
        }
      }
    }

    // Second pass: create rows from aggregated data
    weekTitleMap.forEach((aggregatedItem) => {
      const {
        weekStartRaw,
        weekStart,
        weekEnd,
        title,
        includeWork,
        work,
        dailyHours,
      } = aggregatedItem;

      // Ensure table container for this title (each project/team gets separate table)
      if (!tablesByTitle.has(title)) {
        tablesByTitle.set(title, { title, includeWork, rows: [] });
      }
      const table = tablesByTitle.get(title);
      if (!table) return;

      // Calculate row total from Mon-Fri (indices 0-4)
      const rowTotal = dailyHours
        .slice(0, 5)
        .reduce((sum, hours) => sum + hours, 0);

      // Build row - one row per unique week+project/team combination
      const baseCells: (string | number)[] = [weekStart, weekEnd];
      const workCells: (string | number)[] = includeWork ? [work || ''] : [];
      const dayCells: (string | number)[] = [
        this.formatHoursForDisplay(dailyHours[0]),
        this.formatHoursForDisplay(dailyHours[1]),
        this.formatHoursForDisplay(dailyHours[2]),
        this.formatHoursForDisplay(dailyHours[3]),
        this.formatHoursForDisplay(dailyHours[4]),
        this.formatHoursForDisplay(rowTotal),
      ];

      table.rows.push({
        sortDate: weekStartRaw,
        cells: [...baseCells, ...workCells, ...dayCells],
      });
    });

    // Sort tables by priority: Projects first, then Teams, then Leave
    const ordered = Array.from(tablesByTitle.values()).sort((a, b) => {
      const rank = (t: string) =>
        t.startsWith('Project:')
          ? 0
          : t.startsWith('Team:')
          ? 1
          : t === 'Leave'
          ? 2
          : 3;
      const rA = rank(a.title);
      const rB = rank(b.title);
      if (rA !== rB) return rA - rB;
      return a.title.localeCompare(b.title);
    });
    return ordered;
  }

  private calculateEmployeeStats(employeeWeeks: ITimesheetReportData[]) {
    const daily = [0, 0, 0, 0, 0];
    let grandTotal = 0;
    employeeWeeks.forEach((week) => {
      week.categories.forEach((cat) => {
        cat.items.forEach((item) => {
          const hours = Array.isArray(item.dailyHours) ? item.dailyHours : [];
          hours.slice(0, 5).forEach((h, i) => {
            const nNum =
              typeof h === 'string'
                ? parseFloat(h)
                : typeof h === 'number'
                ? h
                : 0;
            if (!isNaN(nNum)) daily[i] += nNum;
          });
          const rowTotal: number = hours.slice(0, 5).reduce<number>((s, h) => {
            const nNum =
              typeof h === 'string'
                ? parseFloat(h)
                : typeof h === 'number'
                ? h
                : 0;
            return s + (isNaN(nNum) ? 0 : nNum);
          }, 0);
          grandTotal += rowTotal;
        });
      });
    });
    return { daily, grandTotal };
  }

  private calculateDetailedStatistics(data: ITimesheetReportData[]) {
    const totalEmployees = new Set(data.map((d) => d.employeeId)).size;
    let grandTotal = 0;
    let otherDays = 0;
    const allProjects = new Set<string>();
    const allTeams = new Set<string>();
    let totalTasks = 0;

    data.forEach((d) => {
      // Track per-week leave hours aggregated across all other items
      const weeklyLeaveHours: number[] = [0, 0, 0, 0, 0];

      d.categories.forEach((cat) => {
        cat.items.forEach((item) => {
          if (item.projectName) allProjects.add(item.projectName);
          if (item.teamName) allTeams.add(item.teamName);
          totalTasks++;
          const dailyHours = Array.isArray(item.dailyHours)
            ? item.dailyHours
            : [];
          const rowTotal: number = dailyHours
            .slice(0, 5)
            .reduce<number>((sum, hours) => {
              const nNum =
                typeof hours === 'string'
                  ? parseFloat(hours)
                  : typeof hours === 'number'
                  ? hours
                  : 0;
              return sum + (isNaN(nNum) ? 0 : nNum);
            }, 0);
          grandTotal += rowTotal;
        });
      });

      // Convert weekly aggregated leave hours to other day fractions (8h = 1 day)
      for (let i = 0; i < 5; i++) {
        const fraction = weeklyLeaveHours[i] / 8;
        if (fraction > 0) otherDays += Math.min(fraction, 1);
      }
    });

    return {
      totalEmployees,
      totalProjects: allProjects.size,
      totalTeams: allTeams.size,
      totalTasks,
      otherDays: Math.round(otherDays * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100,
    };
  }

  private formatDate(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  private formatHoursForDisplay(
    hours: number | undefined | null | string
  ): string {
    if (!hours || hours === 0 || hours === '0') return '';
    const num = typeof hours === 'string' ? parseFloat(hours) : hours;
    if (isNaN(num)) return '' as any;
    return num.toFixed(2);
  }

  async write(res: any, filename: string): Promise<void> {
    this.autoSizeColumns();

    const columnMaxWidths = [16, 16, 24, 10, 10, 10, 10, 10, 12];
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
