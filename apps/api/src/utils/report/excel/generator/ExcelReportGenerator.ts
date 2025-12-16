import { 
  DetailedTimesheetExcel 
} from './DetailedTimesheetExcel';
import { 
  ITimesheetReportData 
} from '../../../../interfaces/report';

export class ExcelReportGenerator {
  private generator: DetailedTimesheetExcel | null = null;

  generateDetailedTimesheetReport(
    data: ITimesheetReportData[], 
    filters?: { startDate?: string; endDate?: string }
  ): void {
    this.generator = new DetailedTimesheetExcel();
    this.generator.build(data, filters);
  }

  async generateBuffer(): Promise<Buffer> {
    if (!this.generator) {
      throw new Error('No report generator initialized. Call a generate method first.');
    }
    
    
    const workbook = (this.generator as any).workbook;
    if (workbook && workbook.xlsx && workbook.xlsx.writeBuffer) {
      return await workbook.xlsx.writeBuffer();
    }
    
    throw new Error('Unable to generate buffer from Excel generator');
  }
}

