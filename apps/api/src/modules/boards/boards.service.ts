import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { CreateBoardDto } from "./dto/create-board.dto.js";
import type { UpdateBoardDto } from "./dto/update-board.dto.js";

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  create(ownerId: string, dto: CreateBoardDto) {
    return this.prisma.board.create({
      data: { title: dto.title, description: dto.description, ownerId },
    });
  }

  listForUser(userId: string) {
    return this.prisma.board.findMany({
      where: { OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
      orderBy: { createdAt: "desc" },
    });
  }

  findById(id: string) {
    return this.prisma.board.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateBoardDto) {
    return this.prisma.board.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    await this.prisma.board.delete({ where: { id } });
  }
}
