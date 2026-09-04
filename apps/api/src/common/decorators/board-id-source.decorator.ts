import { SetMetadata } from "@nestjs/common";

export type BoardIdSource = "param" | "column" | "task";

export const BOARD_ID_SOURCE_KEY = "boardIdSource";

export const ResolveBoardIdFrom = (source: BoardIdSource) => SetMetadata(BOARD_ID_SOURCE_KEY, source);
