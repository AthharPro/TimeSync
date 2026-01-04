import { z } from 'zod';

export const createEditRequestSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  year: z.string().regex(/^\d{4}$/, 'Year must be in YYYY format'),
});

export const approveEditRequestSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required'),
});

export const rejectEditRequestSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required'),
  rejectionReason: z.string().min(1, 'Rejection reason is required'),
});

export const getEditRequestsSchema = z.object({
  status: z.enum(['Pending', 'Approved', 'Rejected', 'All']).optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  year: z.string().regex(/^\d{4}$/).optional(),
});
