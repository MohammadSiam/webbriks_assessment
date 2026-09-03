import { z } from "zod";

export const boardRoleSchema = z.enum(["VIEWER", "EDITOR"]);

export type BoardRole = z.infer<typeof boardRoleSchema>;
