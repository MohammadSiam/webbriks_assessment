import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../../prisma/prisma.service.js";
import { BOARD_ROLE_KEY, type BoardAccessLevel } from "../decorators/require-board-role.decorator.js";

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
    const request = context.switchToHttp().getRequest();
    const userId: string = request.user.id;
    const boardId: string = request.params.boardId ?? request.params.id;

    const board = await this.prisma.board.findUnique({ where: { id: boardId } });
    if (!board) {
      throw new NotFoundException("Board not found");
    }

    if (board.ownerId === userId) {
      request.boardAccess = { board, role: "OWNER" as const };
      return true;
    }

    const member = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
    });

    if (!member || ROLE_RANK[member.role] < ROLE_RANK[requiredLevel]) {
      throw new ForbiddenException("You do not have sufficient access to this board");
    }

    request.boardAccess = { board, role: member.role };
    return true;
  }
}
