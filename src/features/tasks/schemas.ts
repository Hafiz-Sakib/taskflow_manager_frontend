import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  description: z.string().max(1000).optional().default(''),
  column: z.string().min(1, 'Column is required'),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().optional().default(''),
});
export type TaskFormValues = z.infer<typeof taskSchema>;
