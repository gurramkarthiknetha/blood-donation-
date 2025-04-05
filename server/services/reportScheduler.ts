import cron from 'node-cron';
import Hospital from '../models/hospital';
import { generatePerformanceReport } from './statisticsService';

interface ScheduledReport {
  hospitalId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  lastGenerated?: Date;
  report?: any;
}

class ReportScheduler {
  private static instance: ReportScheduler;
  private scheduledReports: Map<string, ScheduledReport> = new Map();
  private cronJobs: Map<string, cron.ScheduledTask> = new Map();

  private constructor() {}

  static getInstance(): ReportScheduler {
    if (!ReportScheduler.instance) {
      ReportScheduler.instance = new ReportScheduler();
    }
    return ReportScheduler.instance;
  }

  scheduleReport(hospitalId: string, frequency: 'daily' | 'weekly' | 'monthly'): void {
    if (this.scheduledReports.has(hospitalId)) {
      this.unscheduleReport(hospitalId);
    }

    const cronExpression = this.getCronExpression(frequency);
    const job = cron.schedule(cronExpression, async () => {
      await this.generateAndStoreReport(hospitalId);
    });

    this.scheduledReports.set(hospitalId, { hospitalId, frequency });
    this.cronJobs.set(hospitalId, job);
  }

  unscheduleReport(hospitalId: string): void {
    const job = this.cronJobs.get(hospitalId);
    if (job) {
      job.stop();
      this.cronJobs.delete(hospitalId);
      this.scheduledReports.delete(hospitalId);
    }
  }

  private getCronExpression(frequency: 'daily' | 'weekly' | 'monthly'): string {
    switch (frequency) {
      case 'daily':
        return '0 0 * * *';         // Every day at midnight
      case 'weekly':
        return '0 0 * * 0';         // Every Sunday at midnight
      case 'monthly':
        return '0 0 1 * *';         // First day of each month at midnight
      default:
        throw new Error('Invalid frequency');
    }
  }

  private async generateAndStoreReport(hospitalId: string): Promise<void> {
    try {
      const report = await generatePerformanceReport(hospitalId);
      const scheduledReport = this.scheduledReports.get(hospitalId);
      
      if (scheduledReport) {
        scheduledReport.lastGenerated = new Date();
        scheduledReport.report = report;
      }

      // Here you would typically store the report in a database
      console.log(`Generated report for hospital ${hospitalId} at ${new Date()}`);
    } catch (error) {
      console.error(`Error generating report for hospital ${hospitalId}:`, error);
    }
  }

  getLastReport(hospitalId: string): any {
    const scheduledReport = this.scheduledReports.get(hospitalId);
    return scheduledReport?.report;
  }

  getAllScheduledReports(): ScheduledReport[] {
    return Array.from(this.scheduledReports.values());
  }

  async generateImmediateReport(hospitalId: string): Promise<any> {
    await this.generateAndStoreReport(hospitalId);
    return this.getLastReport(hospitalId);
  }
}

export default ReportScheduler;