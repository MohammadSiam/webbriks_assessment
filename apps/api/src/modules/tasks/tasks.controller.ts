import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { TasksService } from "./tasks.service.js";
import { createTaskSchema, type CreateTaskDto } from "./dto/create-task.dto.js";
import { updateTaskSchema, type UpdateTaskDto } from "./dto/update-task.dto.js";
import { moveTaskSchema, type MoveTaskDto } from "./dto/move-task.dto.js";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import { BoardAccessGuard } from "../../common/guards/board-access.guard.js";
import { RequireBoardRole } from "../../common/decorators/require-board-role.decorator.js";
import { ResolveBoardIdFrom } from "../../common/decorators/board-id-source.decorator.js";
import { toApiBodySchema } from "../../common/swagger/zod-schema.util.js";

@ApiTags("tasks")
@ApiBearerAuth()
@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @UseGuards(BoardAccessGuard)
  @RequireBoardRole("EDITOR")
  @ResolveBoardIdFrom("column")
  @Post("columns/:columnId/tasks")
  @ApiBody({ schema: toApiBodySchema(createTaskSchema) })
  create(@Param("columnId") columnId: string, @Body(new ZodValidationPipe(createTaskSchema)) dto: CreateTaskDto) {
    return this.tasksService.create(columnId, dto);
  }

  @UseGuards(BoardAccessGuard)
  @ResolveBoardIdFrom("task")
  @Get("tasks/:id")
  get(@Param("id") id: string) {
    return this.tasksService.findById(id);
  }

  @UseGuards(BoardAccessGuard)
  @RequireBoardRole("EDITOR")
  @ResolveBoardIdFrom("task")
  @Patch("tasks/:id")
  @ApiBody({ schema: toApiBodySchema(updateTaskSchema) })
  update(@Param("id") id: string, @Body(new ZodValidationPipe(updateTaskSchema)) dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @UseGuards(BoardAccessGuard)
  @RequireBoardRole("EDITOR")
  @ResolveBoardIdFrom("task")
  @Delete("tasks/:id")
  @HttpCode(200)
  async delete(@Param("id") id: string) {
    await this.tasksService.delete(id);
    return { id };
  }

  @UseGuards(BoardAccessGuard)
  @RequireBoardRole("EDITOR")
  @ResolveBoardIdFrom("task")
  @Patch("tasks/:id/move")
  @ApiBody({ schema: toApiBodySchema(moveTaskSchema) })
  move(@Param("id") id: string, @Body(new ZodValidationPipe(moveTaskSchema)) dto: MoveTaskDto) {
    return this.tasksService.move(id, dto.targetColumnId, dto.targetIndex);
  }
}
