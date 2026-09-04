import { z } from "zod";

export const createColumnSchema = z.object({
  title: z.string().min(1),
});

export type CreateColumnInput = z.infer<typeof createColumnSchema>;

export const updateColumnSchema = z.object({
  title: z.string().min(1),
});

export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;

export type Column = {
  id: string;
  boardId: string;
  title: string;
  position: string;
  createdAt: string;
  updatedAt: string;
};
