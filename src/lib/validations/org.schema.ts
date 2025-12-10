import { z } from "zod";

export const createOrgSchema = z.object({
  name: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(50, "Organization name must be less than 50 characters")
    .trim(),
});

export type CreateOrgInput = z.infer<typeof createOrgSchema>;