import { z } from "zod";

export const createBoardSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;

export const updateBoardSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;

export type Board = {
  id: string;
  title: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

export type BoardAccessLevel = "OWNER" | "EDITOR" | "VIEWER";

export type BoardWithRole = Board & { myRole: BoardAccessLevel };
