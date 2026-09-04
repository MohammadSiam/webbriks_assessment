import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { PrismaService } from "../../prisma/prisma.service.js";
import { BOARD_ROLE_KEY, type BoardAccessLevel } from "../decorators/require-board-role.decorator.js";
import { BOARD_ID_SOURCE_KEY, type BoardIdSource } from "../decorators/board-id-source.decorator.js";

const ROLE_RANK: Record<BoardAccessLevel, number> = {
  VIEWER: 1,
  EDITOR: 2,
  OWNER: 3,
};

@Injectable()
export class BoardAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredLevel = this.reflector.get<BoardAccessLevel>(BOARD_ROLE_KEY, context.getHandler()) ?? "VIEWER";
    const boardIdSource = this.reflector.get<BoardIdSource>(BOARD_ID_SOURCE_KEY, context.getHandler()) ?? "param";
    const request = context.switchToHttp().getRequest();
    const userId: string = request.user.id;

    const boardId = await this.resolveBoardId(request, boardIdSource);

    const boardWithMembership = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        members: { where: { userId }, select: { role: true } },
      },
    });
    if (!boardWithMembership) {
      throw new NotFoundException("Board not found");
    }
    const { members, ...board } = boardWithMembership;

    if (board.ownerId === userId) {
      request.boardAccess = { board, role: "OWNER" as const };
      return true;
    }

    const member = members[0];
    if (!member || ROLE_RANK[member.role] < ROLE_RANK[requiredLevel]) {
      throw new ForbiddenException("You do not have sufficient access to this board");
    }

    request.boardAccess = { board, role: member.role };
    return true;
  }

  private async resolveBoardId(request: Request, source: BoardIdSource): Promise<string> {
    const resourceId = String(request.params.id);

    if (source === "param") {
      return String(request.params.boardId ?? request.params.id);
    }

    if (source === "column") {
      const column = await this.prisma.column.findUnique({
        where: { id: resourceId },
        select: { boardId: true },
      });
      if (!column) {
        throw new NotFoundException("Column not found");
      }
      return column.boardId;
    }

    const task = await this.prisma.task.findUnique({
      where: { id: resourceId },
      select: { boardId: true },
    });
    if (!task) {
      throw new NotFoundException("Task not found");
    }
    return task.boardId;
  }
}
