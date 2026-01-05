import ExcelJS from 'exceljs';

export abstract class BaseExcelGenerator {
  protected workbook: ExcelJS.Workbook;
  protected worksheet: ExcelJS.Worksheet;

  constructor(sheetName: string) {
    this.workbook = new ExcelJS.Workbook();
    this.worksheet = this.workbook.addWorksheet(sheetName);
  }

  protected addHeaderRow(headers: string[]): void {
    const row = this.worksheet.addRow(headers);
    row.font = { bold: true };
  }

  protected addDataRow(values: (string | number | null | undefined)[]): ExcelJS.Row {
    return this.worksheet.addRow(values.map((v) => (v === undefined || v === null ? '' : v)));
  }

  protected autoSizeColumns(): void {
    this.worksheet.columns.forEach((column) => {
      let maxLength = 10;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const v = cell.value as string | number | undefined | null;
        const len = (v ? String(v) : '').length;
        if (len > maxLength) maxLength = len;
      });
      column.width = Math.min(Math.max(maxLength + 2, 10), 50);
    });
  }

  abstract build(data: any, filters?: Record<string, any>): Promise<void> | void;

  async write(res: any, filename: string): Promise<void> {
    this.autoSizeColumns();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
    await this.workbook.xlsx.write(res);
    res.end();
  }
}




