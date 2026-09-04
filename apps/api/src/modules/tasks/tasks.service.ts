import { Injectable, NotFoundException } from "@nestjs/common";
import { generateKeyBetween } from "fractional-indexing";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { CreateTaskDto } from "./dto/create-task.dto.js";
import type { UpdateTaskDto } from "./dto/update-task.dto.js";

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(columnId: string, dto: CreateTaskDto) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
      select: { boardId: true },
    });
    if (!column) {
      throw new NotFoundException("Column not found");
    }

    const lastTask = await this.prisma.task.findFirst({
      where: { columnId },
      orderBy: { position: "desc" },
    });
    const position = generateKeyBetween(lastTask?.position ?? null, null);

    return this.prisma.task.create({
      data: { boardId: column.boardId, columnId, title: dto.title, description: dto.description, position },
    });
  }

  findById(id: string) {
    return this.prisma.task.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateTaskDto) {
    return this.prisma.task.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    await this.prisma.task.delete({ where: { id } });
  }
}
