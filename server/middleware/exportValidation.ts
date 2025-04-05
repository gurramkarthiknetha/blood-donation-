import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';
import { ExportFormat } from '../services/reportExporter';

export const validateExportFormat = (req: Request, res: Response, next: NextFunction) => {
  const { format } = req.query;

  if (!format) {
    // Default to PDF if no format specified
    req.query.format = ExportFormat.PDF;
    return next();
  }

  if (!Object.values(ExportFormat).includes(format as ExportFormat)) {
    throw new ApiError(400, `Invalid export format. Must be one of: ${Object.values(ExportFormat).join(', ')}`);
  }

  next();
};

export const generateExportFileName = (
  hospitalName: string, 
  format: ExportFormat, 
  date: Date = new Date()
): string => {
  const dateStr = date.toISOString().split('T')[0];
  const sanitizedHospitalName = hospitalName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  
  const extension = {
    [ExportFormat.PDF]: 'pdf',
    [ExportFormat.EXCEL]: 'xlsx',
    [ExportFormat.CSV]: 'csv'
  }[format];

  return `${sanitizedHospitalName}_report_${dateStr}.${extension}`;
};