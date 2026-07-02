import { z } from 'zod';

export const boardSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(300).optional().default(''),
  columns: z.string().min(1, 'At least one column is required'),
});
export type BoardFormValues = z.infer<typeof boardSchema>;
