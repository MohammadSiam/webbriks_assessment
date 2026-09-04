import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { generatePosition, isUniqueConstraintError } from "../../ordering/fractional-index.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { CreateTaskDto } from "./dto/create-task.dto.js";
import type { UpdateTaskDto } from "./dto/update-task.dto.js";

const MAX_MOVE_ATTEMPTS = 3;

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
    const position = generatePosition(lastTask?.position ?? null, null);

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

  async move(taskId: string, targetColumnId: string, targetIndex: number) {
    for (let attempt = 1; attempt <= MAX_MOVE_ATTEMPTS; attempt++) {
      try {
        return await this.attemptMove(taskId, targetColumnId, targetIndex);
      } catch (error) {
        const isLastAttempt = attempt === MAX_MOVE_ATTEMPTS;
        if (!isUniqueConstraintError(error) || isLastAttempt) {
          throw isUniqueConstraintError(error)
            ? new ConflictException("Could not move task due to a conflicting update, please retry")
            : error;
        }
      }
    }

    throw new ConflictException("Could not move task due to a conflicting update, please retry");
  }

  private attemptMove(taskId: string, targetColumnId: string, targetIndex: number) {
    return this.prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({ where: { id: taskId } });
      if (!task) {
        throw new NotFoundException("Task not found");
      }

      const targetColumn = await tx.column.findUnique({ where: { id: targetColumnId } });
      if (!targetColumn) {
        throw new NotFoundException("Target column not found");
      }

      if (targetColumn.boardId !== task.boardId) {
        throw new BadRequestException("Target column belongs to a different board");
      }

      const siblingTasks = await tx.task.findMany({
        where: { columnId: targetColumnId, id: { not: taskId } },
        orderBy: { position: "asc" },
      });

      const clampedIndex = Math.max(0, Math.min(targetIndex, siblingTasks.length));
      const before = siblingTasks[clampedIndex - 1]?.position ?? null;
      const after = siblingTasks[clampedIndex]?.position ?? null;
      const position = generatePosition(before, after);

      return tx.task.update({
        where: { id: taskId },
        data: { columnId: targetColumnId, position },
      });
    });
  }
}
