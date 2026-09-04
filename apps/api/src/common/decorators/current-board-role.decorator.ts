import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { BoardAccessLevel } from "./require-board-role.decorator.js";

export const CurrentBoardRole = createParamDecorator((_data: unknown, context: ExecutionContext): BoardAccessLevel => {
  const request = context.switchToHttp().getRequest();
  return request.boardAccess.role;
});
