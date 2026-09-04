import { Body, Controller, Delete, HttpCode, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { ColumnsService } from "./columns.service.js";
import { createColumnSchema, type CreateColumnDto } from "./dto/create-column.dto.js";
import { updateColumnSchema, type UpdateColumnDto } from "./dto/update-column.dto.js";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import { BoardAccessGuard } from "../../common/guards/board-access.guard.js";
import { RequireBoardRole } from "../../common/decorators/require-board-role.decorator.js";
import { ResolveBoardIdFrom } from "../../common/decorators/board-id-source.decorator.js";
import { toApiBodySchema } from "../../common/swagger/zod-schema.util.js";

@ApiTags("columns")
@ApiBearerAuth()
@Controller()
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @UseGuards(BoardAccessGuard)
  @RequireBoardRole("EDITOR")
  @Post("boards/:boardId/columns")
  @ApiBody({ schema: toApiBodySchema(createColumnSchema) })
  create(@Param("boardId") boardId: string, @Body(new ZodValidationPipe(createColumnSchema)) dto: CreateColumnDto) {
    return this.columnsService.create(boardId, dto);
  }

  @UseGuards(BoardAccessGuard)
  @RequireBoardRole("EDITOR")
  @ResolveBoardIdFrom("column")
  @Patch("columns/:id")
  @ApiBody({ schema: toApiBodySchema(updateColumnSchema) })
  update(@Param("id") id: string, @Body(new ZodValidationPipe(updateColumnSchema)) dto: UpdateColumnDto) {
    return this.columnsService.update(id, dto);
  }

  @UseGuards(BoardAccessGuard)
  @RequireBoardRole("EDITOR")
  @ResolveBoardIdFrom("column")
  @Delete("columns/:id")
  @HttpCode(200)
  async delete(@Param("id") id: string) {
    await this.columnsService.delete(id);
    return { id };
  }
}
