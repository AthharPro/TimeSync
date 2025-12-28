import { ProfessionalBasePDFGenerator } from '../base/ProfessionalBasePDFGenerator';
import { ProfessionalPDFComponents } from '../component/ProfessionalPDFComponents';
import PDFDocument from 'pdfkit';
import { IDetailedTimesheetReport } from '../../../../interfaces/report';
import path from 'path';
import fs from 'fs';

export class DetailedTimesheetPdf extends ProfessionalBasePDFGenerator {
  private components: ProfessionalPDFComponents;
  private pageNumber = 1;
  private latoFont = 'Helvetica';
  private logoPath: string | null = null;
  private pageStartY = 0; // Track where content starts on current page

  constructor() {
    super();
    this.components = new ProfessionalPDFComponents(
      this.doc,
      this.margin,
      () => this.currentY,
      (y) => (this.currentY = y),
      (space) => this.checkPageBreak(space),
      this.pageWidth,
      () => this.isFirstPage
    );

    // Register Lato Medium font if available
    this.registerLatoFont();

    // Find and store logo path
    this.findLogoPath();

    // Add header and footer to each page
    this.setupHeaderAndFooter();
  }

  generate(
    data: IDetailedTimesheetReport[]
  ): PDFDocument {
    // Add header with logo and company info on first page
    this.addCompanyHeader();
    this.pageStartY = this.currentY; // Track where content starts on first page

    // Group data by employee
    const groupedData = this.groupDataByEmployee(data);

    // Add separate table for each employee
    this.addEmployeeTables(groupedData);

    // Add summary statistics
    this.addSummaryStatistics(data);

    // Draw footer on last page only if there's content on the page
    // Check if currentY is significantly beyond pageStartY (at least 50px of content)
    if (this.currentY > this.pageStartY + 50) {
      this.drawFooter();
    }

    return this.doc;
  }

  private registerLatoFont(): void {
    // Try to find Lato Medium font file in multiple locations
    const possibleFontPaths = [
      path.join(__dirname, '../../../../assets/fonts/Lato-Medium.ttf'),
      path.join(__dirname, '../../../../assets/fonts/LatoMedium.ttf'),
      path.join(process.cwd(), 'apps/api/src/assets/fonts/Lato-Medium.ttf'),
      path.join(process.cwd(), 'apps/api/src/assets/fonts/LatoMedium.ttf'),
      path.join(process.cwd(), 'assets/fonts/Lato-Medium.ttf'),
      path.join(process.cwd(), 'assets/fonts/LatoMedium.ttf'),
    ];

    for (const fontPath of possibleFontPaths) {
      try {
        if (fs.existsSync(fontPath)) {
          this.doc.registerFont('Lato-Medium', fontPath);
          this.latoFont = 'Lato-Medium';
          break;
        }
      } catch {
        // Continue to next path
        continue;
      }
    }
  }

  private findLogoPath(): void {
    // Try to find logo from multiple possible locations
    const possibleLogoPaths = [
      // API assets folder (compiled location)
      path.join(__dirname, '../../../../assets/logo.png'),
      path.join(__dirname, '../../../../assets/logo.png'),
      // API assets folder (source location)
      path.join(process.cwd(), 'apps/api/src/assets/logo.png'),
      path.join(process.cwd(), 'apps/api/src/assets/logo.png'),
    ];

    for (const logoPath of possibleLogoPaths) {
      try {
        if (fs.existsSync(logoPath)) {
          this.logoPath = logoPath;
          break;
        }
      } catch {
        // Continue to next path
        continue;
      }
    }
  }

  private addCompanyHeader(): void {
    const headerY = 30;
    const logoSize = 40;
    const logoX = this.margin;
    const logoY = headerY;
    const brandTextX = logoX + logoSize + 10;
    const brandTextY = headerY + 20;

    // Draw logo if available
    if (this.logoPath) {
      try {
        this.doc.image(this.logoPath, logoX, logoY, { width: logoSize, height: logoSize });
      } catch {
        // Logo loading failed, continue without it
      }
    }

    // Brand text near the logo
    this.doc
      .fontSize(22)
      .fillColor('#035082')
      .font(this.latoFont)
      .text('ALLION', brandTextX, brandTextY);

    // Calculate position for company information (below logo)
    const companyInfoX = this.margin;
    const lineY = logoY + logoSize + 10; // Line below logo with 10px spacing
    const companyInfoY = lineY + 15; // Company info starts 15px below the line

    // Draw black horizontal line between logo and company details
    if (this.logoPath) {
      this.doc
        .moveTo(this.margin, lineY)
        .lineTo(this.pageWidth - this.margin, lineY)
        .stroke('#000000')
        .lineWidth(1);
    } else {
      // If no logo, draw line at top
      this.doc
        .moveTo(this.margin, headerY + 5)
        .lineTo(this.pageWidth - this.margin, headerY + 5)
        .stroke('#000000')
        .lineWidth(1);
      const adjustedLineY = headerY + 5;
      const adjustedCompanyInfoY = adjustedLineY + 5;

      this.doc
        .fontSize(12)
        .fillColor('#000000')
        .font(this.latoFont)
        .text('Allion Technologies (Pvt) Ltd', companyInfoX, adjustedCompanyInfoY);

      this.doc
        .fontSize(9)
        .fillColor('#000000')
        .font(this.latoFont)
        .text('Level 11, MAGA ONE', companyInfoX, adjustedCompanyInfoY + 15)
        .text('No.200, Narahenpita - Nawala Rd', companyInfoX, adjustedCompanyInfoY + 28)
        .text('Colombo 00500', companyInfoX, adjustedCompanyInfoY + 41)
        .text('Sri Lanka', companyInfoX, adjustedCompanyInfoY + 54);

      this.currentY = adjustedCompanyInfoY + 54 + 20;
      return;
    }

    this.doc
      .fontSize(12)
      .fillColor('#000000')
      .font(this.latoFont)
      .text('Allion Technologies (Pvt) Ltd', companyInfoX, companyInfoY);

    this.doc
      .fontSize(9)
      .fillColor('#000000')
      .font(this.latoFont)
      .text('Level 11, MAGA ONE', companyInfoX, companyInfoY + 15)
      .text('No.200, Narahenpita - Nawala Rd', companyInfoX, companyInfoY + 28)
      .text('Colombo 00500', companyInfoX, companyInfoY + 41)
      .text('Sri Lanka', companyInfoX, companyInfoY + 54);

    this.currentY = companyInfoY + 54 + 20;
  }

  private drawPageHeader(): void {
    const headerY = 30;
    const logoSize = 40; // Match first page logo size
    const logoX = this.margin;
    const logoY = headerY;
    const brandTextX = logoX + logoSize + 10;
    const brandTextY = headerY + 20; // Match first page brand text position

    // Draw logo if available
    if (this.logoPath) {
      try {
        this.doc.image(this.logoPath, logoX, logoY, { width: logoSize, height: logoSize });
      } catch {
        // Logo loading failed, continue without it
      }
    }

    // Brand text near the logo
    this.doc
      .fontSize(22)
      .fillColor('#035082')
      .font(this.latoFont)
      .text('ALLION', brandTextX, brandTextY);

    // Calculate position for company information (below logo)
    const companyInfoX = this.margin;
    const lineY = logoY + logoSize + 10; // Line below logo with 10px spacing
    const companyInfoY = lineY + 15; // Company info starts 15px below the line

    // Draw black horizontal line between logo and company details
    if (this.logoPath) {
      this.doc
        .moveTo(this.margin, lineY)
        .lineTo(this.pageWidth - this.margin, lineY)
        .stroke('#000000')
        .lineWidth(1);
    } else {
      // If no logo, draw line at top
      this.doc
        .moveTo(this.margin, headerY + 10)
        .lineTo(this.pageWidth - this.margin, headerY + 10)
        .stroke('#000000')
        .lineWidth(1);
      const adjustedLineY = headerY + 10;
      const adjustedCompanyInfoY = adjustedLineY + 15;

      this.doc
        .fontSize(12)
        .fillColor('#000000')
        .font(this.latoFont)
        .text('Allion Technologies (Pvt) Ltd', companyInfoX, adjustedCompanyInfoY);

      this.doc
        .fontSize(9)
        .fillColor('#000000')
        .font(this.latoFont)
        .text('Level 11, MAGA ONE', companyInfoX, adjustedCompanyInfoY + 15)
        .text('No.200, Narahenpita - Nawala Rd', companyInfoX, adjustedCompanyInfoY + 28)
        .text('Colombo 00500', companyInfoX, adjustedCompanyInfoY + 41)
        .text('Sri Lanka', companyInfoX, adjustedCompanyInfoY + 54);

      this.currentY = adjustedCompanyInfoY + 54 + 20;
      return;
    }

    this.doc
      .fontSize(12)
      .fillColor('#000000')
      .font(this.latoFont)
      .text('Allion Technologies (Pvt) Ltd', companyInfoX, companyInfoY);

    this.doc
      .fontSize(9)
      .fillColor('#000000')
      .font(this.latoFont)
      .text('Level 11, MAGA ONE', companyInfoX, companyInfoY + 15)
      .text('No.200, Narahenpita - Nawala Rd', companyInfoX, companyInfoY + 28)
      .text('Colombo 00500', companyInfoX, companyInfoY + 41)
      .text('Sri Lanka', companyInfoX, companyInfoY + 54);
    
    // Set currentY to match first page positioning
    this.currentY = companyInfoY + 54 + 20;
  }

  private setupHeaderAndFooter(): void {
    // Override addPage to add header and footer before each new page
    const originalAddPage = this.doc.addPage.bind(this.doc);

    this.doc.addPage = () => {
      this.drawFooter();
      originalAddPage();
      this.drawPageHeader(); // Draw header on new page (sets currentY internally)
      this.pageNumber++;
      // currentY is already set by drawPageHeader to match first page
      this.pageStartY = this.currentY; // Track where content starts on this new page
      this.isFirstPage = false;
    };
  }

  // Override checkPageBreak to account for header space on subsequent pages
  protected checkPageBreak(requiredSpace: number): void {
    // Account for footer space (80px) when checking page breaks
    const availableSpace = this.pageHeight - this.currentY - this.margin - 80;
    
    if (requiredSpace > availableSpace) {
      this.drawFooter();
      this.doc.addPage();
      // currentY is already set by drawPageHeader in our overridden addPage
      // Ensure it's set correctly (should be companyInfoY + 54 + 20 = ~169px from top)
      // Calculate expected header end position: headerY(30) + logoSize(40) + spacing(10) + lineSpacing(15) + companyInfo(54) + bottomSpacing(20) = 169
      const expectedHeaderEnd = 30 + 40 + 10 + 15 + 54 + 20; // 169
      if (this.currentY < expectedHeaderEnd) {
        this.currentY = expectedHeaderEnd;
      }
      this.pageStartY = this.currentY; // Track where content starts on this new page
      this.isFirstPage = false;
    }
  }

  private drawFooter(): void {
    const footerY = this.pageHeight - this.margin - 30;

    // Horizontal line
    this.doc
      .moveTo(this.margin, footerY)
      .lineTo(this.pageWidth - this.margin, footerY)
      .stroke('#E2E8F0');

    // Contact information
    this.doc
      .fontSize(8)
      .fillColor('#64748B')
      .font(this.latoFont)
      .text('accounts@alliontechnologies.com', this.margin, footerY + 5)
      .text('http://www.alliontechnologies.com', this.margin, footerY + 15);

    // Page number
    const pageText = `Page: ${this.pageNumber}`;
    const pageTextWidth = this.doc.widthOfString(pageText, { fontSize: 8 });
    this.doc
      .fontSize(8)
      .fillColor('#64748B')
      .font(this.latoFont)
      .text(pageText, this.pageWidth - this.margin - pageTextWidth, footerY + 10);
  }

  private groupDataByEmployee(data: IDetailedTimesheetReport[]): Map<string, IDetailedTimesheetReport[]> {
    const groupedData = new Map<string, IDetailedTimesheetReport[]>();
    
    data.forEach(timesheetWeek => {
      const employeeKey = `${timesheetWeek.employeeId}-${timesheetWeek.employeeName}`;
      
      if (!groupedData.has(employeeKey)) {
        groupedData.set(employeeKey, []);
      }
      
      const array = groupedData.get(employeeKey);
      if (array) {
        array.push(timesheetWeek);
      }
    });
    
    return groupedData;
  }

  private addEmployeeTables(groupedData: Map<string, IDetailedTimesheetReport[]>): void {
    if (groupedData.size === 0) {
      this.doc.fontSize(10)
        .fillColor(this.colors.text.secondary)
        .font('Helvetica')
        .text('No data available for the selected period.', this.margin, this.currentY);
      
      this.currentY += 40;
      return;
    }

    // Sort employees by name for consistent ordering
    const sortedEmployees = Array.from(groupedData.entries()).sort(([keyA], [keyB]) => {
      const nameA = keyA.split('-')[1] || '';
      const nameB = keyB.split('-')[1] || '';
      return nameA.localeCompare(nameB);
    });

    sortedEmployees.forEach(([, employeeData], index) => {
      if (index > 0) {
        // Add page break before each new employee 
        this.checkPageBreak(200);
        this.currentY += 20;
      }

      this.addEmployeeTable(employeeData);
    });
  }

  private addEmployeeTable(employeeData: IDetailedTimesheetReport[]): void {
    if (employeeData.length === 0) return;

    const employee = employeeData[0];
    
    // Employee section header
    this.checkPageBreak(40);
    this.doc
      .fontSize(18)
      .fillColor('#035082')
      .font(this.latoFont)
      .text(`${employee.employeeName} - ${employee.employeeEmail}`, this.margin, this.currentY);
    this.currentY += 30;
    
    // Divider line
    this.doc
      .moveTo(this.margin, this.currentY)
      .lineTo(this.pageWidth - this.margin, this.currentY)
      .stroke('#E2E8F0')
      .lineWidth(1);
    this.currentY += 20;
    // Group data into separate sub-tables similar to the preview 
    // CRITICAL: Aggregate by BOTH week date AND project/team to avoid duplicate rows
    type SubRow = { sortDate: Date; cells: string[] };
    type SubTable = { title: string; includeWork: boolean; rows: SubRow[] };
    const tablesByTitle = new Map<string, SubTable>();

    // Calculate totals for this employee
    const employeeDailyTotals = [0, 0, 0, 0, 0];
    let employeeGrandTotal = 0;
    let hasProject = false;
    let hasTeam = false;
    let hasLeave = false;

    // First pass: aggregate all data by week+title to handle duplicate weeks
    type WeekTitleKey = string; // Format: "2025-12-01_Project: ProjectName"
    type AggregatedWeekItem = {
      weekStartRaw: Date;
      weekStart: string;
      weekEnd: string;
      title: string;
      includeWork: boolean;
      work?: string;
      dailyHours: number[];
    };
    const weekTitleMap = new Map<WeekTitleKey, AggregatedWeekItem>();

    employeeData.forEach((timesheetWeek) => {
      const weekStartRaw = new Date(timesheetWeek.weekStartDate);
      const weekStart = this.formatDate(weekStartRaw);
      const weekEnd = this.formatDate(this.addDays(timesheetWeek.weekStartDate, 4)); // Friday = Monday + 4 days

      timesheetWeek.categories.forEach((category) => {
        category.items.forEach((item) => {
          const dailyHours = item.dailyHours || [];

          let title: string | null = null;
          let includeWork = false;
          if (item.projectName) {
            title = `Project: ${item.projectName}`;
            hasProject = true;
          } else if (item.teamName) {
            title = `Team: ${item.teamName}`;
            hasTeam = true;
          } else if (category.category === 'Other') {
            title = 'Leave';
            includeWork = true;
            hasLeave = true;
          }

          // Skip items that don't belong to any specific category
          if (!title) return;

          // Create unique key combining week start date and title
          const weekTitleKey: WeekTitleKey = `${weekStart}_${title}`;

          // Aggregate items with the same week+title combination
          if (!weekTitleMap.has(weekTitleKey)) {
            weekTitleMap.set(weekTitleKey, {
              weekStartRaw,
              weekStart,
              weekEnd,
              title,
              includeWork,
              work: includeWork ? (item.work || '') : undefined,
              dailyHours: [0, 0, 0, 0, 0, 0, 0]
            });
          }

          const aggregatedItem = weekTitleMap.get(weekTitleKey);
          if (aggregatedItem) {
            // Sum up the hours for each day
            dailyHours.forEach((hours, index) => {
              aggregatedItem.dailyHours[index] += parseFloat(hours?.toString() || '0') || 0;
            });
          }
        });
      });
    });

    // Second pass: create rows from aggregated data
    weekTitleMap.forEach((aggregatedItem) => {
      const { weekStartRaw, weekStart, weekEnd, title, includeWork, work, dailyHours } = aggregatedItem;

      // Add to employee totals
      dailyHours.forEach((hours, index) => {
        if (index < 5 && hours) {
          employeeDailyTotals[index] += hours;
        }
      });
      const rowTotal = dailyHours.slice(0, 5).reduce((sum, hours) => sum + hours, 0);
      employeeGrandTotal += rowTotal;

      // Ensure table container for this title
      if (!tablesByTitle.has(title)) {
        tablesByTitle.set(title, { title, includeWork, rows: [] });
      }
      const table = tablesByTitle.get(title);
      if (!table) return;

      // Build row - one row per unique week+project/team combination
      const baseCells = [
        weekStart,
        weekEnd,
      ]
      const workCells = includeWork ? [work || ''] : [];
      const dayCells = [
        this.formatHoursForDisplay(dailyHours[0]),
        this.formatHoursForDisplay(dailyHours[1]),
        this.formatHoursForDisplay(dailyHours[2]),
        this.formatHoursForDisplay(dailyHours[3]),
        this.formatHoursForDisplay(dailyHours[4]),
        this.formatHoursForDisplay(rowTotal),
      ];
      table.rows.push({ sortDate: weekStartRaw, cells: [...baseCells, ...workCells, ...dayCells] });
    });

    // Sort tables
    const tableOrder = Array.from(tablesByTitle.values()).sort((a, b) => {
      const rank = (t: string) => (t.startsWith('Project:') ? 0 : t.startsWith('Team:') ? 1 : t === 'Leave' ? 2 : 3);
      const rA = rank(a.title);
      const rB = rank(b.title);
      if (rA !== rB) return rA - rB;
      return a.title.localeCompare(b.title);
    });

    // Render each sub-table with consistent styling
    tableOrder.forEach((sub) => {
      this.checkPageBreak(60);
      
      this.doc.fontSize(14)
        .fillColor('#035082')
        .font(this.latoFont)
        .text(sub.title, this.margin, this.currentY);
      this.currentY += 20;

      const headers = sub.includeWork
        ? ['Week Start', 'Week End', 'Work', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Total']
        : ['Week Start', 'Week End', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Total'];
      const columnWidths = sub.includeWork
        ? [75, 75, 80, 45, 45, 45, 45, 45, 50]
        : [100, 100, 45, 45, 45, 45, 45, 50];

      const sortedRows = sub.rows
        .slice()
        .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
        .map((r) => r.cells);

      this.addCustomTable(headers, sortedRows, columnWidths);

      this.currentY += 15;
    });

    
    if (hasProject && hasTeam && hasLeave) {
      // addPage will draw footer and header automatically
      this.doc.addPage();
      // currentY is already set to margin + 180 by our overridden addPage
    }

    const metricsHeaders = ['Day', 'Hours']; 
    const metricsData: string[][] = [
      ['Monday', `${employeeDailyTotals[0].toFixed(2)} h`],
      ['Tuesday',`${employeeDailyTotals[1].toFixed(2)} h`],
      ['Wednesday', `${employeeDailyTotals[2].toFixed(2)} h`],
      ['Thursday', `${employeeDailyTotals[3].toFixed(2)} h`],
      ['Friday', `${employeeDailyTotals[4].toFixed(2)} h`],
      ['Total', `${employeeGrandTotal.toFixed(2)} h`],
    ];
    this.checkPageBreak(60);
    this.doc.fontSize(14)
      .fillColor('#035082')
      .font(this.latoFont)
      .text('Working Hours', this.margin, this.currentY);
    this.currentY += 20;
    this.addCustomTable(metricsHeaders, metricsData, [255, 255], 20);
  }

  
  
  private addSummaryStatistics(data: IDetailedTimesheetReport[]): void {
    this.checkPageBreak(200);
    
    this.doc
      .fontSize(18)
      .fillColor('#035082')
      .font(this.latoFont)
      .text('Overall Summary', this.margin, this.currentY);
    this.currentY += 30;
    
    // Divider line
    this.doc
      .moveTo(this.margin, this.currentY)
      .lineTo(this.pageWidth - this.margin, this.currentY)
      .stroke('#E2E8F0')
      .lineWidth(1);
    this.currentY += 20;

    const stats = this.calculateDetailedStatistics(data);
    
    const summaryData = [
      { 
        label: 'Total Employees', 
        value: stats.totalEmployees,
        type: 'info' as const
      },
      { 
        label: 'Total Teams', 
        value: stats.totalTeams,
        type: 'info' as const
      },
      { 
        label: 'Total Projects', 
        value: stats.totalProjects,
        type: 'info' as const
      },
      { 
        label: 'Absence Days', 
        value: stats.otherDays,
        type: 'warning' as const
      },
      { 
        label: 'Grand Total Hours', 
        value: `${stats.grandTotal} h`,
        type: 'success' as const
      },
      
    ];

    // Add summary cards with proper spacing
    this.addSummaryCards(summaryData);

    // Add employee breakdown if multiple employees
    if (stats.totalEmployees > 1) {
      this.addEmployeeBreakdown(data);
    }
  }

  private addEmployeeBreakdown(data: IDetailedTimesheetReport[]): void {
    this.currentY += 20;
    this.checkPageBreak(150);
    
    // Group data by employee to get individual totals
    const employeeStats = new Map<string, { name: string; email: string; totalHours: number; weeks: number }>();
    
    data.forEach(timesheetWeek => {
      const key = timesheetWeek.employeeId;
      
      if (!employeeStats.has(key)) {
        employeeStats.set(key, {
          name: timesheetWeek.employeeName,
          email: timesheetWeek.employeeEmail,
          totalHours: 0,
          weeks: 0
        });
      }
      
      const employeeStat = employeeStats.get(key);
      if (employeeStat) {
        employeeStat.weeks++;
      
      // Calculate total hours from categories
      timesheetWeek.categories.forEach(category => {
        category.items.forEach(item => {
          const dailyHours = item.dailyHours || [];
          const rowTotal = dailyHours.slice(0, 5).reduce((sum, hours) => {
            return sum + (parseFloat(hours?.toString()) || 0);
          }, 0);
          employeeStat.totalHours += rowTotal;
        });
      });
      }
    });

  }

  private addSummaryCards(summaryData: { label: string; value: number | string; type: 'success' | 'warning' | 'danger' | 'info' }[]): void {
    this.checkPageBreak(150);
    
    // Create a metrics table format
    const tableWidth = this.pageWidth - (this.margin * 2);
    const rowHeight = 25;
    
    // Table header
    this.doc.rect(this.margin, this.currentY, tableWidth, 30)
      .fill(this.colors.primary);
    
    this.doc.fontSize(11)
      .fillColor('white')
      .font('Helvetica-Bold')
      .text('Category', this.margin + 10, this.currentY + 10)
      .text('Result', this.margin + tableWidth - 100, this.currentY + 10);
    
    this.currentY += 35;

    // Add metrics rows
    summaryData.forEach((item, index) => {
      const rowY = this.currentY;
      const bgColor = index % 2 === 0 ? '#F8FAFC' : 'white';
      
      // Row background
      this.doc.rect(this.margin, rowY, tableWidth, rowHeight)
        .fill(bgColor)
        .stroke(this.colors.border);
      
      // Status indicator 
      const indicatorColor = this.getSummaryColor(item.type);
      this.doc.circle(this.margin + 15, rowY + 12, 4)
        .fill(indicatorColor);
      
      // Metric label
      this.doc.fontSize(10)
        .fillColor(this.colors.text.primary)
        .font('Helvetica')
        .text(item.label, this.margin + 30, rowY + 8);
      
      // Metric value
      this.doc.fontSize(12)
        .fillColor(this.colors.text.primary)
        .font('Helvetica-Bold')
        .text(String(item.value), this.margin + tableWidth - 90, rowY + 8, {
          align: 'left',
          width: 80
        });
      
      this.currentY += rowHeight;
    });
    
    this.currentY += 15;
  }

  private addCustomTable(
    headers: string[],
    data: string[][],
    columnWidths: number[],
    rowHeight = 25
  ): void {
    if (data.length === 0) {
      return;
    }

    const headerHeight = 30;

    // Check if we need a new page
    this.checkPageBreak(headerHeight + rowHeight * 5);

    let tableStartY = this.currentY;
    let rowsOnCurrentPage = 0;
    // Account for footer (80px) when calculating available space
    const maxRowsPerPage = Math.floor((this.pageHeight - this.currentY - this.margin - 80) / rowHeight);

    // Draw table header
    this.drawTableHeader(headers, columnWidths, headerHeight, tableStartY);

    tableStartY += headerHeight;
    this.currentY = tableStartY;

    // Draw table rows
    data.forEach((rowData, index) => {
      // Check if we need a new page
      if (rowsOnCurrentPage >= maxRowsPerPage) {
        // addPage will draw footer and header automatically
        this.doc.addPage();
        // Header is already drawn by setupHeaderAndFooter, adjust for table
        // currentY is already set to margin + 180 by our overridden addPage
        tableStartY = this.currentY;
        this.drawTableHeader(headers, columnWidths, headerHeight, tableStartY);
        tableStartY += headerHeight;
        this.currentY = tableStartY;
        rowsOnCurrentPage = 0;
      }

      const rowY = this.currentY;
      const bgColor = index % 2 === 0 ? 'white' : '#F8FAFC';

      // Row background
      this.doc
        .rect(this.margin, rowY, columnWidths.reduce((sum, w) => sum + w, 0), rowHeight)
        .fill(bgColor)
        .stroke('#E2E8F0');

      // Row data
      let x = this.margin;
      const cellPadding = 8;

      rowData.forEach((cellData, cellIndex) => {
        this.doc
          .fontSize(9)
          .fillColor('#1E293B')
          .font(this.latoFont)
          .text(cellData || '', x + cellPadding, rowY + 7, {
            width: columnWidths[cellIndex] - cellPadding * 2,
            ellipsis: true,
          });
        x += columnWidths[cellIndex];
      });

      // Column separators
      x = this.margin;
      for (let i = 0; i < columnWidths.length - 1; i++) {
        x += columnWidths[i];
        this.doc
          .moveTo(x, rowY)
          .lineTo(x, rowY + rowHeight)
          .stroke('#E2E8F0');
      }

      this.currentY += rowHeight;
      rowsOnCurrentPage++;
    });

    this.currentY += 10;
  }

  private drawTableHeader(headers: string[], columnWidths: number[], headerHeight: number, startY: number): void {
    // Header background
    this.doc
      .rect(this.margin, startY, columnWidths.reduce((sum, w) => sum + w, 0), headerHeight)
      .fill('white')
      .stroke('#E2E8F0');

    // Header text
    let x = this.margin;
    this.doc.fontSize(10).fillColor('#af7115').font(this.latoFont);

    headers.forEach((header, index) => {
      this.doc.text(header, x + 8, startY + 9, { width: columnWidths[index] - 16 });
      x += columnWidths[index];
    });

    // Column separators in header
    x = this.margin;
    for (let i = 0; i < columnWidths.length - 1; i++) {
      x += columnWidths[i];
      this.doc
        .moveTo(x, startY)
        .lineTo(x, startY + headerHeight)
        .stroke('#E2E8F0');
    }
  }

  private getSummaryColor(type: string): string {
    switch (type) {
      case 'success': return this.colors.accent;
      case 'warning': return this.colors.warning;
      case 'danger': return this.colors.danger;
      case 'info': return this.colors.primary;
      default: return this.colors.secondary;
    }
  }

  private formatHoursForDisplay(hours: number | undefined | null | string): string {
    if (!hours || hours === 0 || hours === '0') return '';
    
    // Convert to number 
    const numHours = typeof hours === 'string' ? parseFloat(hours) : hours;
    
    // Check if it's a valid number
    if (isNaN(numHours) || numHours === 0) return '';
    
    return numHours.toFixed(2);
  }

  private addDays(dateInput: string | Date, days: number): string {
    const d = new Date(dateInput);
    d.setDate(d.getDate() + days);
    return this.formatDate(d);
  }

  private calculateDetailedStatistics(data: IDetailedTimesheetReport[]) {
    const totalEmployees = new Set(data.map(d => d.employeeId)).size;
    let totalHours = 0;
    let grandTotal = 0;
    let otherDays = 0;
    
    const allProjects = new Set<string>();
    const allTeams = new Set<string>();
    let totalTasks = 0;
    
  
    data.forEach(d => {
     
      const weeklyLeaveHours: number[] = [0, 0, 0, 0, 0];

      d.categories.forEach(cat => {
        cat.items.forEach(item => {
          if (item.projectName) allProjects.add(item.projectName);
          if (item.teamName) allTeams.add(item.teamName);
          totalTasks++;
          totalHours += item.totalHours || 0;

          // Calculate from daily hours
          const dailyHours = item.dailyHours || [];
          const rowTotal = dailyHours.slice(0, 5).reduce((sum, hours) => {
            return sum + (parseFloat(hours?.toString()) || 0);
          }, 0);
          grandTotal += rowTotal;

          // Aggregate leave hours per day for this week
          if (cat.category === 'Other') {
            for (let i = 0; i < 5; i++) {
              const h = dailyHours[i];
              const n = typeof h === 'string' ? parseFloat(h) : (typeof h === 'number' ? h : 0);
              if (!isNaN(n) && n > 0) weeklyLeaveHours[i] += n;
            }
          }
        });
      });

      // Convert weekly aggregated leave hours to other day fractions 
      for (let i = 0; i < 5; i++) {
        const fraction = weeklyLeaveHours[i] / 8;
        if (fraction > 0) otherDays += Math.min(fraction, 1);
      }
    });

    const totalProjects = allProjects.size;
    const totalTeams = allTeams.size;
    const totalWeeks = data.length;
    const avgHoursPerWeek = totalWeeks > 0 ? (totalHours / totalWeeks).toFixed(1) : '0';
    const utilizationRate = totalWeeks > 0 ? Math.round((totalHours / (totalWeeks * 40)) * 100) : 0;

    return {
      totalEmployees,
      totalHours: Math.round(totalHours * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100, 
      totalProjects,
      totalTeams,
      totalTasks,
      otherDays: Math.round(otherDays * 100) / 100,
      avgHoursPerWeek,
      utilizationRate
    };
  }
}