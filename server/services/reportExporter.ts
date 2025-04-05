import { HospitalStats } from './statisticsService';
import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export class ReportExporter {
  static async exportToExcel(data: any): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();
    
    // Convert statistics to worksheet
    const statsWS = XLSX.utils.json_to_sheet([data.currentMonth]);
    XLSX.utils.book_append_sheet(workbook, statsWS, 'Current Month Stats');

    // Add trends worksheet
    const trendsWS = XLSX.utils.json_to_sheet([data.improvements]);
    XLSX.utils.book_append_sheet(workbook, trendsWS, 'Trends');

    // Write to buffer
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  static async exportToPDF(data: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument();

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Add title
      doc.fontSize(16).text('Hospital Performance Report', { align: 'center' });
      doc.moveDown();

      // Add hospital info
      doc.fontSize(12).text(`Hospital: ${data.hospital.name}`);
      doc.text(`Report Generated: ${data.generatedAt}`);
      doc.moveDown();

      // Add current month statistics
      doc.fontSize(14).text('Current Month Statistics');
      doc.moveDown();
      Object.entries(data.currentMonth).forEach(([key, value]) => {
        doc.fontSize(10).text(`${this.formatKey(key)}: ${this.formatValue(value)}`);
      });
      doc.moveDown();

      // Add improvements section
      doc.fontSize(14).text('Performance Trends');
      doc.moveDown();
      Object.entries(data.improvements).forEach(([key, value]) => {
        const trend = Number(value) * 100;
        const trendText = trend > 0 ? `+${trend.toFixed(1)}%` : `${trend.toFixed(1)}%`;
        doc.fontSize(10).text(`${this.formatKey(key)}: ${trendText}`);
      });

      doc.end();
    });
  }

  static async exportToCSV(data: any): Promise<string> {
    const headers = Object.keys(data.currentMonth).map(this.formatKey);
    const values = Object.values(data.currentMonth).map(this.formatValue);
    
    return [
      headers.join(','),
      values.join(',')
    ].join('\n');
  }

  private static formatKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }

  private static formatValue(value: any): string {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return String(value);
  }
}

export enum ExportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv'
}