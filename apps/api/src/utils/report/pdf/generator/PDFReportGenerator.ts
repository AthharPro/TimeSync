import { 
  DetailedTimesheetPdf, 
} from './DetailedTimesheetPdf';
import { 
  IDetailedTimesheetReport 
} from '../../../../interfaces/report';

export class PDFReportGenerator {
  private generator: DetailedTimesheetPdf | null = null;

  generateDetailedTimesheetReport(
    data: IDetailedTimesheetReport[], 
    filters?: { startDate?: string; endDate?: string }
  ): void {
    this.generator = new DetailedTimesheetPdf();
    this.generator.generate(data);
  }

  async generateBuffer(): Promise<Buffer> {
    if (!this.generator) {
      throw new Error('No report generator initialized. Call a generate method first.');
    }
    
    return await this.generator.generateBuffer();
  }
}

