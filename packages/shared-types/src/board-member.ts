import { z } from "zod";
import { boardRoleSchema } from "./board-role.js";

export const addBoardMemberSchema = z.object({
  email: z.string().email(),
  role: boardRoleSchema,
});

export type AddBoardMemberInput = z.infer<typeof addBoardMemberSchema>;

export const updateBoardMemberRoleSchema = z.object({
  role: boardRoleSchema,
});

export type UpdateBoardMemberRoleInput = z.infer<typeof updateBoardMemberRoleSchema>;
