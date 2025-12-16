import PDFDocument from 'pdfkit';

export class ProfessionalPDFComponents {
  private readonly colors = {
    primary: '#2563EB',      
    secondary: '#64748B',    
    accent: '#059669',       
    danger: '#DC2626',    
    warning: '#D97706',      
    background: '#F8FAFC',   
    border: '#E2E8F0',       
    text: {
      primary: '#1E293B',    
      secondary: '#64748B',  
      muted: '#94A3B8'      
    }
  };

  constructor(
    private doc: PDFDocument,
    private margin: number,
    private getCurrentY: () => number,
    private setCurrentY: (y: number) => void,
    private checkPageBreak: (space: number) => void,
    private pageWidth: number,
    private getIsFirstPage: () => boolean
  ) {}

  //report header with company branding
  addProfessionalHeader(
    title: string,
    filters: { startDate?: string; endDate?: string },
    subtitle?: string,
    
  ): void {
    const startY = this.getCurrentY();
    
    // Header background
    this.doc.rect(0, 0, this.pageWidth, 120)
      .fill(this.colors.primary);

    // Report title 
    this.doc.fontSize(22)
      .fillColor('white')
      .font('Helvetica-Bold')
      .text(title, 0, 35, { 
        align: 'center',
        width: this.pageWidth
      });

    if (subtitle) {
      this.doc.fontSize(12)
        .fillColor('#E2E8F0')
        .font('Helvetica')
        .text(subtitle, 0, 65, { 
          align: 'center',
          width: this.pageWidth
        });
    }

    // Filter information 
    let filterText = '';
    if (filters.startDate && filters.endDate) {
      filterText = `Period: ${this.formatDateProfessional(filters.startDate)} - ${this.formatDateProfessional(filters.endDate)}`;
    } else if (filters.startDate) {
      filterText = `From: ${this.formatDateProfessional(filters.startDate)}`;
    } else if (filters.endDate) {
      filterText = `Until: ${this.formatDateProfessional(filters.endDate)}`;
    } else {
      filterText = 'All Records';
    }

    this.doc.fontSize(10)
      .fillColor('#E2E8F0')
      .text(filterText, 0, 85, {
        align: 'center',
        width: this.pageWidth
      });

    this.setCurrentY(140);
  }

  //table styling
  addProfessionalTable(
    headers: string[],
    data: string[][],
    columnWidths: number[],
    options: {
      alternateRows?: boolean;
      headerColor?: string;
      textAlign?: 'left' | 'center' | 'right';
      fontSize?: number;
      rowHeight?: number;
    } = {}
  ): void {
    const {
      alternateRows = true,
      headerColor = this.colors.primary,
      textAlign = 'left',
      fontSize = 9,
      rowHeight = 22
    } = options;

    const headerHeight = 35;
   
    this.checkPageBreak(headerHeight + 5 + rowHeight);

    // Determine if we're starting table on first page with header
    const isFirstPageTable = this.getIsFirstPage();

    // Table header
    let x = this.margin;
    const tableY = this.getCurrentY();

    // Header background with gradient effect
    this.doc.rect(this.margin, tableY, 
      columnWidths.reduce((sum, width) => sum + width, 0), headerHeight)
      .fill(headerColor);

    // Header shadow effect
    this.doc.rect(this.margin, tableY + headerHeight, 
      columnWidths.reduce((sum, width) => sum + width, 0), 2)
      .fill(this.colors.border);

    // Header text
    this.doc.fontSize(8)
      .fillColor('white')
      .font('Helvetica-Bold');

    headers.forEach((header, index) => {
      this.doc.text(header, x + 10, tableY + 12, {
        width: columnWidths[index] - 20,
        align: textAlign,
        ellipsis: true
      });
      
      // Column separators
      if (index < headers.length - 1) {
        this.doc.rect(x + columnWidths[index], tableY, 1, headerHeight)
          .fill('rgba(255,255,255,0.2)');
      }
      
      x += columnWidths[index];
    });

    this.setCurrentY(tableY + headerHeight + 5);

    // Track rows on current page
    let rowsOnCurrentPage = 0;
    const maxRowsFirstPage = 29; // First page with header
    const maxRowsOtherPages = 35; // Other pages without header

    // Table rows
    data.forEach((rowData, rowIndex) => {
      // Check if we need to break to new page based on row count
      const currentPageIsFirst = this.getIsFirstPage();
      const maxRowsForCurrentPage = currentPageIsFirst ? maxRowsFirstPage : maxRowsOtherPages;
      
      if (rowsOnCurrentPage >= maxRowsForCurrentPage) {
        this.checkPageBreak(rowHeight * 5); // Force page break
        rowsOnCurrentPage = 0;
        
        // Re-render table header on new page
        x = this.margin;
        const newTableY = this.getCurrentY();
        
        this.doc.rect(this.margin, newTableY, 
          columnWidths.reduce((sum, width) => sum + width, 0), headerHeight)
          .fill(headerColor);
        
        this.doc.rect(this.margin, newTableY + headerHeight, 
          columnWidths.reduce((sum, width) => sum + width, 0), 2)
          .fill(this.colors.border);
        
        this.doc.fontSize(8)
          .fillColor('white')
          .font('Helvetica-Bold');
        
        x = this.margin;
        headers.forEach((header, index) => {
          this.doc.text(header, x + 10, newTableY + 12, {
            width: columnWidths[index] - 20,
            align: textAlign,
            ellipsis: true
          });
          
          if (index < headers.length - 1) {
            this.doc.rect(x + columnWidths[index], newTableY, 1, headerHeight)
              .fill('rgba(255,255,255,0.2)');
          }
          
          x += columnWidths[index];
        });
        
        this.setCurrentY(newTableY + headerHeight + 5);
      }
      
      this.checkPageBreak(rowHeight + 5);
      
      const currentRowY = this.getCurrentY();
      x = this.margin;

      // Row background
      if (alternateRows && rowIndex % 2 === 1) {
        this.doc.rect(this.margin, currentRowY, 
          columnWidths.reduce((sum, width) => sum + width, 0), rowHeight)
          .fill(this.colors.background);
      }

      // Row border
      this.doc.rect(this.margin, currentRowY, 
        columnWidths.reduce((sum, width) => sum + width, 0), rowHeight)
        .stroke(this.colors.border);

      // Row text
      this.doc.fontSize(fontSize)
        .fillColor(this.colors.text.primary)
        .font('Helvetica');

      rowData.forEach((cellData, cellIndex) => {
        // Apply color coding for status columns
        let textColor = this.colors.text.primary;
        if (headers[cellIndex].toLowerCase().includes('status')) {
          textColor = this.getStatusColor(cellData);
        }

       
        let displayText = cellData;
        let cellFontSize = fontSize;
        
        if (cellData.length > 20 && columnWidths[cellIndex] < 100) {
          cellFontSize = Math.max(fontSize - 1, 7);
          if (cellData.length > 30) {
            displayText = cellData.substring(0, 27) + '...';
          }
        }

        this.doc.fontSize(cellFontSize)
          .fillColor(textColor)
          .text(displayText, x + 5, currentRowY + Math.floor((rowHeight - cellFontSize) / 2), {
            width: columnWidths[cellIndex] - 10,
            align: textAlign,
            ellipsis: true,
            height: rowHeight - 4
          });

        // Column separators
        if (cellIndex < columnWidths.length - 1) {
          this.doc.rect(x + columnWidths[cellIndex], currentRowY, 1, rowHeight)
            .stroke(this.colors.border);
        }

        x += columnWidths[cellIndex];
      });

      this.setCurrentY(currentRowY + rowHeight);
      rowsOnCurrentPage++;
    });

    this.setCurrentY(this.getCurrentY() + 10);
  }

  //summary section 
  addProfessionalSummary(
    summaryData: { label: string; value: number | string; type?: 'success' | 'warning' | 'danger' | 'info' }[],
    title = 'Summary'
  ): void {
    this.checkPageBreak(summaryData.length * 30 + 60);
    
    const startY = this.getCurrentY();
    
    // Summary section background
    this.doc.rect(this.margin, startY, 
      this.pageWidth - (this.margin * 2), summaryData.length * 30 + 50)
      .fill('#FAFBFC')
      .stroke(this.colors.border);

    // Section title
    this.doc.fontSize(16)
      .fillColor(this.colors.text.primary)
      .font('Helvetica-Bold')
      .text(title, this.margin + 20, startY + 20);

    this.setCurrentY(startY + 50);

    // Summary items in grid layout
    const itemsPerRow = 2;
    const itemWidth = (this.pageWidth - (this.margin * 2) - 40) / itemsPerRow;
    
    summaryData.forEach((item, index) => {
      const col = index % itemsPerRow;
      const row = Math.floor(index / itemsPerRow);
      const itemX = this.margin + 20 + (col * itemWidth);
      const itemY = this.getCurrentY() + (row * 35);

      // Summary item card
      this.doc.rect(itemX, itemY, itemWidth - 10, 30)
        .fill('white')
        .stroke(this.colors.border);

      // Status indicator
      const indicatorColor = this.getSummaryColor(item.type);
      this.doc.rect(itemX, itemY, 4, 30)
        .fill(indicatorColor);

      // Label
      this.doc.fontSize(10)
        .fillColor(this.colors.text.secondary)
        .font('Helvetica')
        .text(item.label, itemX + 15, itemY + 6);

      // Value
      this.doc.fontSize(14)
        .fillColor(this.colors.text.primary)
        .font('Helvetica-Bold')
        .text(String(item.value), itemX + 15, itemY + 16);
    });

    this.setCurrentY(this.getCurrentY() + Math.ceil(summaryData.length / itemsPerRow) * 35 + 20);
  }



  //section divider
  addSectionDivider(title?: string): void {
    this.checkPageBreak(30);
    
    if (title) {
      this.doc.fontSize(14)
        .fillColor(this.colors.text.primary)
        .font('Helvetica-Bold')
        .text(title, this.margin, this.getCurrentY());
      
      this.setCurrentY(this.getCurrentY() + 25);
    }

    // Divider line
    this.doc.rect(this.margin, this.getCurrentY(), 
      this.pageWidth - (this.margin * 2), 2)
      .fill(this.colors.primary);

    this.setCurrentY(this.getCurrentY() + 20);
  }

  // Helper methods
  private formatDateProfessional(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  private getStatusColor(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('submitted') || statusLower.includes('approved') || statusLower.includes('complete')) {
      return this.colors.accent;
    }
    if (statusLower.includes('pending') || statusLower.includes('review')) {
      return this.colors.warning;
    }
    if (statusLower.includes('rejected') || statusLower.includes('missing') || statusLower.includes('late')) {
      return this.colors.danger;
    }
    return this.colors.text.primary;
  }

  private getSummaryColor(type?: string): string {
    switch (type) {
      case 'success': return this.colors.accent;
      case 'warning': return this.colors.warning;
      case 'danger': return this.colors.danger;
      case 'info': return this.colors.primary;
      default: return this.colors.secondary;
    }
  }
}