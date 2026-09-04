import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const moveTaskSchema = z.object({
  targetColumnId: z.string().uuid(),
  targetIndex: z.number().int().min(0),
});

export type MoveTaskInput = z.infer<typeof moveTaskSchema>;

export type Task = {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string | null;
  position: string;
  createdAt: string;
  updatedAt: string;
};
