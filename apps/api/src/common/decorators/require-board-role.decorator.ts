import { SetMetadata } from "@nestjs/common";

export type BoardAccessLevel = "VIEWER" | "EDITOR" | "OWNER";

export const BOARD_ROLE_KEY = "requiredBoardRole";

export const RequireBoardRole = (level: BoardAccessLevel) => SetMetadata(BOARD_ROLE_KEY, level);
