import { z } from "zod";

export const createColumnSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

export type CreateColumnInput = z.infer<typeof createColumnSchema>;

export const updateColumnSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;

export type Column = {
  id: string;
  boardId: string;
  title: string;
  description: string | null;
  position: string;
  createdAt: string;
  updatedAt: string;
};
