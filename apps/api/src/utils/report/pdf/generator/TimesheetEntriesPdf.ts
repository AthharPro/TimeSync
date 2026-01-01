import { ProfessionalBasePDFGenerator } from '../base/ProfessionalBasePDFGenerator';
import { ProfessionalPDFComponents } from '../component/ProfessionalPDFComponents';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

type TimesheetEntryRow = {
  date: string;
  description: string;
  status: string;
  quantity: string;
};

type FlatEntry = {
  date: string; 
  originalDate: string;
  responsible: string;
  description: string;
  timeSpent: string; 
  projectName?: string;
};

export class TimesheetEntriesPdf extends ProfessionalBasePDFGenerator {
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

  generate(
    data: Array<{
      employeeName: string;
      employeeEmail: string;
      tables: Array<{ title: string; rows: TimesheetEntryRow[] }>;
    }>
  ): PDFDocument {
    // Add header with logo and company info on first page
    this.addCompanyHeader();
    this.pageStartY = this.currentY; // Track where content starts on first page

    // If multiple employees (project-wise or team-wise filter), show each employee with their own table
    if (data.length > 1) {
      // Collect all unique project/team names from all tables
      const allTitles = new Set<string>();
      data.forEach(emp => {
        emp.tables.forEach(table => {
          allTitles.add(table.title);
        });
      });
      
      // Determine the main title based on common pattern
      let mainTitle = '';
      const titlesArray = Array.from(allTitles);
      
      // Check if all titles are for the same project or team
      const projectTitles = titlesArray.filter(t => t.includes('Project:'));
      const teamTitles = titlesArray.filter(t => t.includes('Team:'));
      
      // Check if ALL titles are teams (and NO projects)
      if (teamTitles.length > 0 && projectTitles.length === 0 && titlesArray.length === teamTitles.length) {
        // All entries are from teams only
        const teamName = this.cleanProjectName(teamTitles[0].split('Team:')[1].trim());
        mainTitle = `Timesheet Entries for ${teamName}`;
        
        data.forEach((employeeData, employeeIndex) => {
          // Add new page for each employee after the first
          if (employeeIndex > 0) {
            this.doc.addPage();
          }
          
          // Add team title for each employee on their page
          this.addProjectTitle(mainTitle);

          // Flatten all entries for this employee
          const allEntries = this.flattenEmployeeEntries(employeeData);

          // Add single table with all entries for this employee
          this.addTimesheetTable(allEntries);
        });
      } 
      // Check if ALL titles are projects (and NO teams)
      else if (projectTitles.length > 0 && teamTitles.length === 0 && titlesArray.length === projectTitles.length) {
        // All entries are from projects only
        const projectName = this.cleanProjectName(projectTitles[0].split('Project:')[1].trim());
        mainTitle = `Timesheet Entries for ${projectName} Project`;
        
        data.forEach((employeeData, employeeIndex) => {
          // Add new page for each employee after the first
          if (employeeIndex > 0) {
            this.doc.addPage();
          }
          
          // Add project title for each employee on their page
          this.addProjectTitle(mainTitle);

          // Flatten all entries for this employee
          const allEntries = this.flattenEmployeeEntries(employeeData);

          // Add single table with all entries for this employee
          this.addTimesheetTable(allEntries);
        });
      } 
      // Mixed project and team entries
      else if (projectTitles.length > 0 && teamTitles.length > 0) {
        mainTitle = 'Timesheet Entries - Mixed Work';
        
        // Add main project/team title
        this.addProjectTitle(mainTitle);

        data.forEach((employeeData, employeeIndex) => {
          // Add new page for each employee after the first
          if (employeeIndex > 0) {
            this.doc.addPage();
          }

          // Flatten all entries for this employee
          const allEntries = this.flattenEmployeeEntries(employeeData);

          // Add employee subtitle
          this.addEmployeeSubtitle(employeeData.employeeName);

          // Add single table with all entries for this employee
          this.addTimesheetTable(allEntries);
        });
      } 
      // Multiple projects
      else if (projectTitles.length > 1) {
        mainTitle = 'Timesheet Entries - Multiple Projects';
        
        // Add main project/team title
        this.addProjectTitle(mainTitle);

        data.forEach((employeeData, employeeIndex) => {
          // Add new page for each employee after the first
          if (employeeIndex > 0) {
            this.doc.addPage();
          }

          // Flatten all entries for this employee
          const allEntries = this.flattenEmployeeEntries(employeeData);

          // Add employee subtitle
          this.addEmployeeSubtitle(employeeData.employeeName);

          // Add single table with all entries for this employee
          this.addTimesheetTable(allEntries);
        });
      } 
      // Multiple teams
      else if (teamTitles.length > 1) {
        mainTitle = 'Timesheet Entries - Multiple Teams';
        
        // Add main project/team title
        this.addProjectTitle(mainTitle);

        data.forEach((employeeData, employeeIndex) => {
          // Add new page for each employee after the first
          if (employeeIndex > 0) {
            this.doc.addPage();
          }

          // Flatten all entries for this employee
          const allEntries = this.flattenEmployeeEntries(employeeData);

          // Add employee subtitle
          this.addEmployeeSubtitle(employeeData.employeeName);

          // Add single table with all entries for this employee
          this.addTimesheetTable(allEntries);
        });
      } 
      // Fallback
      else {
        mainTitle = 'Timesheet Entries';
        
        // Add main project/team title
        this.addProjectTitle(mainTitle);

        data.forEach((employeeData, employeeIndex) => {
          // Add new page for each employee after the first
          if (employeeIndex > 0) {
            this.doc.addPage();
          }

          // Flatten all entries for this employee
          const allEntries = this.flattenEmployeeEntries(employeeData);

          // Add employee subtitle
          this.addEmployeeSubtitle(employeeData.employeeName);

          // Add single table with all entries for this employee
          this.addTimesheetTable(allEntries);
        });
      }
    } else {
      // Single employee (individual user filter) - show entries grouped by project/team
      const employeeData = data[0];
      
      // Collect all unique project/team names from all tables (excluding 'Other' and 'Leave')
      const allTitles = new Set<string>();
      employeeData.tables
        .filter(table => table.title !== 'Other' && table.title !== 'Leave')
        .forEach(table => {
          allTitles.add(table.title);
        });
      
      // Determine the main title based on common pattern
      let mainTitle = '';
      const titlesArray = Array.from(allTitles);
      
      // Check if all titles are for the same project or team
      const projectTitles = titlesArray.filter(t => t.includes('Project:'));
      const teamTitles = titlesArray.filter(t => t.includes('Team:'));
      
      // Check if user has ONLY ONE team (and NO projects)
      if (teamTitles.length === 1 && projectTitles.length === 0) {
        // Single team only
        const teamName = this.cleanProjectName(teamTitles[0].split('Team:')[1].trim());
        mainTitle = `Timesheet Entries for ${teamName}`;
        
        // Add main team title
        this.addProjectTitle(mainTitle);
        
        // Flatten all entries for this employee
        const allEntries = this.flattenEmployeeEntries(employeeData);

        // Add single table with all entries
        this.addTimesheetTable(allEntries);
      } 
      // Check if user has ONLY ONE project (and NO teams)
      else if (projectTitles.length === 1 && teamTitles.length === 0) {
        // Single project only
        const projectName = this.cleanProjectName(projectTitles[0].split('Project:')[1].trim());
        mainTitle = `Timesheet Entries for ${projectName}`;
        
        // Add main project title
        this.addProjectTitle(mainTitle);
        
        // Flatten all entries for this employee
        const allEntries = this.flattenEmployeeEntries(employeeData);

        // Add single table with all entries
        this.addTimesheetTable(allEntries);
      } 
      // User has multiple projects/teams or mixed entries - show separate tables for each
      else if (titlesArray.length > 1) {
        // Get entries grouped by project/team
        const groupedEntries = this.getEmployeeEntriesByProject(employeeData);
        
        // Create separate table for each project/team with its own title
        groupedEntries.forEach((group, index) => {
          // Add spacing between tables
          if (index > 0) {
            this.currentY += 20;
          }
          
          // Add title for this project/team
          const cleanName = this.cleanProjectName(group.projectName);
          this.addProjectTitle(`Timesheet Entries for ${cleanName}`);
          
          // Add table for this project/team
          this.addTimesheetTable(group.entries);
        });
      } 
      // Fallback - no clear project/team info
      else {
        mainTitle = 'Timesheet Entries';
        
        // Add main title
        this.addProjectTitle(mainTitle);
        
        // Flatten all entries for this employee
        const allEntries = this.flattenEmployeeEntries(employeeData);

        // Add employee subtitle
        this.addEmployeeSubtitle(employeeData.employeeName);

        // Add single table with all entries
        this.addTimesheetTable(allEntries);
      }
    }

    // Draw footer on last page
    this.drawFooter();

    return this.doc;
  }

  private cleanProjectName(name: string): string {
    // Remove trailing numbers/IDs that might be appended (e.g., "Test Project 30" -> "Test Project")
    // Match patterns like: " 30", " - 30", " (30)", etc.
    return name.replace(/\s*[-–—]?\s*\(?\d+\)?\s*$/, '').trim();
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

    // Draw logo if available
    if (this.logoPath) {
      try {
        this.doc.image(this.logoPath, logoX, logoY, { width: logoSize, height: logoSize });
      } catch {
        // Logo loading failed, continue without it
      }
    }

    // Brand text near the logo
    const brandTextMarginTop = 18; // Adjust this value to customize vertical position (positive = down, negative = up)
    const brandTextY = logoY + brandTextMarginTop;
    this.doc
      .fontSize(20)
      .fillColor('#035082')
      .font(this.latoFont)
      .text('ALLION', brandTextX, brandTextY);

    // Calculate position for company information (below logo)
    const companyInfoX = this.margin;
    const lineY = logoY + logoSize + 5; // Line below logo with 10px spacing
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

    this.currentY = companyInfoY + 54 + 20;
  }

  private drawPageHeader(): void {
    const headerY = 30;
    const logoSize = 40;
    const logoX = this.margin;
    const logoY = headerY;
    const brandTextX = logoX + logoSize + 10;

    // Draw logo if available
    if (this.logoPath) {
      try {
        this.doc.image(this.logoPath, logoX, logoY, { width: logoSize, height: logoSize });
      } catch {
        // Logo loading failed, continue without it
      }
    }

    // Brand text near the logo
    const brandTextMarginTop = 18; // Adjust this value to customize vertical position (positive = down, negative = up)
    const brandTextY = logoY + brandTextMarginTop;
    this.doc
      .fontSize(20)
      .fillColor('#035082')
      .font(this.latoFont)
      .text('ALLION', brandTextX, brandTextY);

    // Calculate position for company information (below logo)
    const companyInfoX = this.margin;
    const lineY = logoY + logoSize + 5; // Line below logo with 5px spacing
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

    this.currentY = companyInfoY + 54 + 20;
  }

  private addProjectSubtitle(projectName: string): void {
    this.checkPageBreak(40);

    this.doc
      .fontSize(12)
      .fillColor('#475569')
      .font(this.latoFont)
      .text(projectName, this.margin, this.currentY);

    this.currentY += 25;
  }

  private addProjectTitle(title: string): void {
    this.checkPageBreak(60);

    this.doc
      .fontSize(18)
      .fillColor('#035082')
      .font(this.latoFont)
      .text(title, this.margin, this.currentY);

    this.currentY += 40;
  }

  private addEmployeeSubtitle(employeeName: string): void {
    this.checkPageBreak(40);

    this.doc
      .fontSize(14)
      .fillColor('#334155')
      .font(this.latoFont)
      .text(employeeName, this.margin, this.currentY);

    this.currentY += 30;
  }

  private addEmployeeTitle(employeeName: string): void {
    this.checkPageBreak(60);

    this.doc
      .fontSize(18)
      .fillColor('#035082')
      .font(this.latoFont)
      .text(`${employeeName}` , this.margin, this.currentY);

   
    this.currentY += 50;
  }

  private flattenEmployeeEntries(
    employeeData: {
      employeeName: string;
      employeeEmail: string;
      tables: Array<{ title: string; rows: TimesheetEntryRow[] }>;
    }
  ): FlatEntry[] {
    const entries: FlatEntry[] = [];

    employeeData.tables
      .filter(table => table.title !== 'Other' && table.title !== 'Leave')
      .forEach((table) => {
      // Extract project name from table title
      let projectName = 'All Projects';
      if (table.title.startsWith('Project: ')) {
        projectName = table.title.replace('Project: ', '');
      } else if (table.title.startsWith('Team: ')) {
        projectName = table.title.replace('Team: ', '');
      } else {
        projectName = table.title;
      }

      table.rows.forEach((row) => {
        const hours = parseFloat(row.quantity) || 0;
        const timeSpent = this.formatHoursToHHMM(hours);

        entries.push({
          date: this.formatDateForTable(row.date),
          originalDate: row.date, // Store original date for sorting
          responsible: employeeData.employeeName,
          description: row.description || '-',
          timeSpent: timeSpent,
          projectName: projectName,
        });
      });
    });

    // Sort entries by date (newest first)
    entries.sort((a, b) => {
      const dateCompare = new Date(b.originalDate).getTime() - new Date(a.originalDate).getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.projectName.localeCompare(b.projectName);
    });

    return entries;
  }

  private getEmployeeEntriesByProject(
    employeeData: {
      employeeName: string;
      employeeEmail: string;
      tables: Array<{ title: string; rows: TimesheetEntryRow[] }>;
    }
  ): Array<{ projectName: string; entries: FlatEntry[] }> {
    const projectMap = new Map<string, FlatEntry[]>();

    employeeData.tables
      .filter(table => table.title !== 'Other' && table.title !== 'Leave')
      .forEach((table) => {
      // Extract project name from table title
      let projectName = 'All Projects';
      if (table.title.startsWith('Project: ')) {
        projectName = table.title.replace('Project: ', '');
      } else if (table.title.startsWith('Team: ')) {
        projectName = table.title.replace('Team: ', '');
      } else {
        projectName = table.title;
      }

      if (!projectMap.has(projectName)) {
        projectMap.set(projectName, []);
      }

      table.rows.forEach((row) => {
        const hours = parseFloat(row.quantity) || 0;
        const timeSpent = this.formatHoursToHHMM(hours);

        const array = projectMap.get(projectName);
        if (array) {
          array.push({
            date: this.formatDateForTable(row.date),
            originalDate: row.date, // Store original date for sorting
            responsible: employeeData.employeeName,
            description: row.description || '-',
            timeSpent: timeSpent,
            projectName: projectName,
          });
        }
      });
    });

    // Sort entries by date (newest first) for each project
    const result = Array.from(projectMap.entries()).map(([projectName, entries]) => {
      entries.sort((a, b) => {
        // Use originalDate for accurate sorting
        const dateCompare = new Date(b.originalDate).getTime() - new Date(a.originalDate).getTime();
        if (dateCompare !== 0) return dateCompare;
        return a.responsible.localeCompare(b.responsible);
      });
      return { projectName, entries };
    });

    return result;
  }

  private flattenAndGroupEntries(
    data: Array<{
      employeeName: string;
      employeeEmail: string;
      tables: Array<{ title: string; rows: TimesheetEntryRow[] }>;
    }>
  ): Array<{ projectName: string; entries: FlatEntry[] }> {
    const projectMap = new Map<string, FlatEntry[]>();

    data.forEach((emp) => {
      emp.tables.forEach((table) => {
        // Extract project name from table title
        let projectName = 'All Projects';
        if (table.title.startsWith('Project: ')) {
          projectName = table.title.replace('Project: ', '');
        } else if (table.title.startsWith('Team: ')) {
          projectName = table.title.replace('Team: ', '');
        } else {
          projectName = table.title;
        }

        if (!projectMap.has(projectName)) {
          projectMap.set(projectName, []);
        }

        table.rows.forEach((row) => {
          const hours = parseFloat(row.quantity) || 0;
          const timeSpent = this.formatHoursToHHMM(hours);

          const array = projectMap.get(projectName);
          if (array) {
            array.push({
              date: this.formatDateForTable(row.date),
              originalDate: row.date, // Store original date for sorting
              responsible: emp.employeeName,
              description: row.description || '-',
              timeSpent: timeSpent,
              projectName: projectName,
            });
          }
        });
      });
    });

    // Sort entries by date (newest first, then by responsible)
    const result = Array.from(projectMap.entries()).map(([projectName, entries]) => {
      entries.sort((a, b) => {
        // Use originalDate for accurate sorting
        const dateCompare = new Date(b.originalDate).getTime() - new Date(a.originalDate).getTime();
        if (dateCompare !== 0) return dateCompare;
        return a.responsible.localeCompare(b.responsible);
      });
      return { projectName, entries };
    });

    return result;
  }

  private formatHoursToHHMM(hours: number): string {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${String(wholeHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  private parseHHMMToHours(timeStr: string): number {
    // Parse HH:MM format to hours (decimal)
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours || 0) + (minutes || 0) / 60;
  }

  private calculateTotalHours(entries: FlatEntry[]): string {
    // Calculate total hours from all entries
    const totalHours = entries.reduce((sum, entry) => {
      return sum + this.parseHHMMToHours(entry.timeSpent);
    }, 0);
    return this.formatHoursToHHMM(totalHours);
  }

  private formatDateForTable(dateStr: string): string {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private addTimesheetTable(entries: FlatEntry[]): void {
    if (entries.length === 0) {
      return;
    }

    const headers = ['Date', 'Responsible', 'Description', 'Time Spent (Hours)'];
    const columnWidths = [70, 130, 260, 70];
    const headerHeight = 30;
    const rowHeight = 25;
    const footerSpace = 80; // Space needed for footer
    const minRowsForTable = 3; // Minimum rows to show before allowing table to start

    // Check if we need a new page - ensure we have space for header + minimum rows + footer
    const requiredSpace = headerHeight + (rowHeight * minRowsForTable) + footerSpace;
    this.checkPageBreak(requiredSpace);

    let tableStartY = this.currentY;
    let rowsOnCurrentPage = 0;
    // Account for footer (80px) when calculating available space
    // Header is already accounted for in currentY position
    let maxRowsPerPage = Math.floor((this.pageHeight - this.currentY - this.margin - footerSpace) / rowHeight);

    // Draw table header
    this.drawTableHeader(headers, columnWidths, headerHeight, tableStartY);

    tableStartY += headerHeight;
    this.currentY = tableStartY;

    // Draw table rows
    entries.forEach((entry, index) => {
      // Check if we need a new page
      if (rowsOnCurrentPage >= maxRowsPerPage) {
        this.doc.addPage(); // addPage override handles footer/header and currentY
        tableStartY = this.currentY;
        this.drawTableHeader(headers, columnWidths, headerHeight, tableStartY);
        tableStartY += headerHeight;
        this.currentY = tableStartY;
        rowsOnCurrentPage = 0;
        // Recalculate maxRowsPerPage for the new page
        maxRowsPerPage = Math.floor((this.pageHeight - this.currentY - this.margin - footerSpace) / rowHeight);
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

      // Date
      this.doc
        .fontSize(9)
        .fillColor('#1E293B')
        .font(this.latoFont)
        .text(entry.date, x + cellPadding, rowY + 7, { width: columnWidths[0] - cellPadding * 2 });
      x += columnWidths[0];

      // Responsible
      this.doc
        .fontSize(9)
        .fillColor('#1E293B')
        .font(this.latoFont)
        .text(entry.responsible, x + cellPadding, rowY + 7, {
          width: columnWidths[1] - cellPadding * 2,
          ellipsis: true,
        });
      x += columnWidths[1];

      // Description
      this.doc
        .fontSize(9)
        .fillColor('#1E293B')
        .font(this.latoFont)
        .text(entry.description, x + cellPadding, rowY + 7, {
          width: columnWidths[2] - cellPadding * 2,
          ellipsis: true,
        });
      x += columnWidths[2];

      // Time Spent
      this.doc
        .fontSize(9)
        .fillColor('#1E293B')
        .font(this.latoFont)
        .text(entry.timeSpent, x + cellPadding, rowY + 7, { width: columnWidths[3] - cellPadding * 2 });

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

    // Add total row after all entries
    this.addTotalRow(entries, columnWidths, rowHeight);

    this.currentY += 15;
  }

  private addTotalRow(entries: FlatEntry[], columnWidths: number[], rowHeight: number): void {
    // Check if we need a new page for the total row
    this.checkPageBreak(rowHeight + 5);

    const totalY = this.currentY;
    const totalRowHeight = rowHeight;

    // Draw separator line above total
    this.doc
      .moveTo(this.margin, totalY)
      .lineTo(this.margin + columnWidths.reduce((sum, w) => sum + w, 0), totalY)
      .stroke('#E2E8F0')
      .lineWidth(1);

    // Calculate total hours
    const totalHours = this.calculateTotalHours(entries);

    // Draw total row background
    this.doc
      .rect(this.margin, totalY, columnWidths.reduce((sum, w) => sum + w, 0), totalRowHeight)
      .fill('white')
      .stroke('#E2E8F0');

    // Calculate position for "Total (Hours)" and total value (right-aligned in Time Spent column)
    const totalLabel = 'Total (Hours)';
    const timeSpentColumnX = this.margin + columnWidths[0] + columnWidths[1] + columnWidths[2];
    const cellPadding = 8;
    
    // Calculate text width to position them properly
    const totalLabelWidth = this.doc.widthOfString(totalLabel, { fontSize: 9 });
    const totalValueWidth = this.doc.widthOfString(totalHours, { fontSize: 9 });
    const spacing = 10; // Space between label and value
    
    // Position: both right-aligned in the Time Spent column
    const totalValueX = timeSpentColumnX + columnWidths[3] - cellPadding - totalValueWidth;
    const totalLabelX = totalValueX - spacing - totalLabelWidth;

    // Draw "Total (Hours)" label
    this.doc
      .fontSize(9)
      .fillColor('#1E293B')
      .font(this.latoFont)
      .text(totalLabel, totalLabelX, totalY + 7);

    // Draw total hours value
    this.doc
      .fontSize(9)
      .fillColor('#1E293B')
      .font(this.latoFont)
      .text(totalHours, totalValueX, totalY + 7);

    this.currentY += totalRowHeight;
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

  private setupHeaderAndFooter(): void {
    // Override addPage to add header and footer before each new page
    const originalAddPage = this.doc.addPage.bind(this.doc);

    this.doc.addPage = () => {
      this.drawFooter();
      originalAddPage();
      this.drawPageHeader(); // Draw header on new page (this sets currentY correctly)
      this.pageNumber++;
      this.pageStartY = this.currentY; // Track where content starts on this new page
      this.isFirstPage = false;
    };
  }

  // Override to align page-break handling with header/footer spacing from base
  protected checkPageBreak(requiredSpace: number): void {
    const footerSpace = 80;
    const availableSpace = this.pageHeight - this.currentY - this.margin - footerSpace;

    if (requiredSpace > availableSpace) {
      this.doc.addPage(); // addPage override will draw footer and header
      // drawPageHeader already sets currentY correctly, no need to override it
      this.pageStartY = this.currentY;
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
}




