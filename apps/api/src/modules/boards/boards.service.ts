import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import type { BoardRole } from "@webbriks/shared-types";
import { PrismaService } from "../../prisma/prisma.service.js";
import { UsersService } from "../users/users.service.js";
import type { BoardAccessLevel } from "../../common/decorators/require-board-role.decorator.js";
import type { CreateBoardDto } from "./dto/create-board.dto.js";
import type { UpdateBoardDto } from "./dto/update-board.dto.js";

const MEMBER_USER_SELECT = { id: true, email: true, name: true } as const;

@Injectable()
export class BoardsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  create(ownerId: string, dto: CreateBoardDto) {
    return this.prisma.board.create({
      data: { title: dto.title, description: dto.description, ownerId },
    });
  }

  async listForUser(userId: string, page: number, limit: number) {
    const where = { OR: [{ ownerId: userId }, { members: { some: { userId } } }] };

    const [items, total] = await Promise.all([
      this.prisma.board.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.board.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findById(id: string, myRole: BoardAccessLevel) {
    const board = await this.prisma.board.findUnique({
      where: { id },
      include: {
        columns: {
          orderBy: { position: "asc" },
          include: { tasks: { orderBy: { position: "asc" } } },
        },
        members: { include: { user: { select: MEMBER_USER_SELECT } } },
      },
    });
    if (!board) {
      throw new NotFoundException("Board not found");
    }

    return {
      ...board,
      members: myRole === "OWNER" ? board.members : [],
      myRole,
    };
  }

  update(id: string, dto: UpdateBoardDto) {
    return this.prisma.board.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    await this.prisma.board.delete({ where: { id } });
  }

  listMembers(boardId: string) {
    return this.prisma.boardMember.findMany({
      where: { boardId },
      include: { user: { select: MEMBER_USER_SELECT } },
      orderBy: { createdAt: "asc" },
    });
  }

  async addMember(boardId: string, ownerId: string, email: string, role: BoardRole) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException("No user found with that email");
    }
    if (user.id === ownerId) {
      throw new ConflictException("This user already owns the board");
    }

    const existing = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId: user.id } },
    });
    if (existing) {
      throw new ConflictException("This user is already a member of the board");
    }

    return this.prisma.boardMember.create({
      data: { boardId, userId: user.id, role },
      include: { user: { select: MEMBER_USER_SELECT } },
    });
  }

  async updateMemberRole(boardId: string, userId: string, role: BoardRole) {
    const existing = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
    });
    if (!existing) {
      throw new NotFoundException("This user is not a member of the board");
    }

    return this.prisma.boardMember.update({
      where: { boardId_userId: { boardId, userId } },
      data: { role },
      include: { user: { select: MEMBER_USER_SELECT } },
    });
  }

  async removeMember(boardId: string, userId: string) {
    const existing = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
    });
    if (!existing) {
      throw new NotFoundException("This user is not a member of the board");
    }

    await this.prisma.boardMember.delete({ where: { boardId_userId: { boardId, userId } } });
  }
}
