import { z } from 'zod';


export const DeviceType = z.enum(['desktop', 'mobile', 'tablet']);


export const TrackEventSchema = z.object({
  apiKey: z
    .string()
    .min(1, 'API key is required')
    .regex(/^nx_[a-f0-9]{64}$/, 'Invalid API key format'),
  
  eventName: z
    .string()
    .min(1, 'Event name is required')
    .max(100, 'Event name too long'),
  
  eventData: z
    .record(z.unknown())
    .optional()
    .nullable(),
  
  visitorsId: z
    .string()
    .optional()
    .nullable(),
  
  sessionId: z
    .string()
    .optional()
    .nullable(),
  
  pageUrl: z
    .string()
    .url('Invalid page URL')
    .optional()
    .nullable(),
  
  pageTitle: z
    .string()
    .max(500, 'Page title too long')
    .optional()
    .nullable(),
  
  referrer: z
    .string()
    .optional()
    .nullable(),
  
  device: DeviceType
    .optional()
    .nullable(),
  
  userAgent: z
    .string()
    .optional()
    .nullable(),

  clientTimestamp: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .or(z.date().optional().nullable()),
});



export type TrackEventInput = z.infer<typeof TrackEventSchema>;