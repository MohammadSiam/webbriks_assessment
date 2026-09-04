import { Injectable } from "@nestjs/common";
import { generateKeyBetween } from "fractional-indexing";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { CreateColumnDto } from "./dto/create-column.dto.js";
import type { UpdateColumnDto } from "./dto/update-column.dto.js";

@Injectable()
export class ColumnsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(boardId: string, dto: CreateColumnDto) {
    const lastColumn = await this.prisma.column.findFirst({
      where: { boardId },
      orderBy: { position: "desc" },
    });
    const position = generateKeyBetween(lastColumn?.position ?? null, null);

    return this.prisma.column.create({
      data: { boardId, title: dto.title, position },
    });
  }

  update(id: string, dto: UpdateColumnDto) {
    return this.prisma.column.update({ where: { id }, data: { title: dto.title } });
  }

  async delete(id: string) {
    await this.prisma.column.delete({ where: { id } });
  }
}
