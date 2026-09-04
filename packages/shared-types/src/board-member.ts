import { z } from "zod";
import { boardRoleSchema, type BoardRole } from "./board-role.js";
import type { AuthUser } from "./auth.js";

export const addBoardMemberSchema = z.object({
  email: z.string().email(),
  role: boardRoleSchema,
});

export type AddBoardMemberInput = z.infer<typeof addBoardMemberSchema>;

export const updateBoardMemberRoleSchema = z.object({
  role: boardRoleSchema,
});

export type UpdateBoardMemberRoleInput = z.infer<typeof updateBoardMemberRoleSchema>;

export type BoardMember = {
  id: string;
  boardId: string;
  userId: string;
  role: BoardRole;
  createdAt: string;
  user: AuthUser;
};
