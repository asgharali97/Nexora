import { z } from 'zod'

export const CreateApiKeySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name too long'),
  
  orgId: z
    .string()
    .min(1, 'Organization ID is required'),
});


export const UpdateApiKeySchema = z.object({
  isActive: z.boolean(),
});


export type CreateApiKeyInput = z.infer<typeof CreateApiKeySchema>;
export type UpdateApiKeyInput = z.infer<typeof UpdateApiKeySchema>;