import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { BoardsService } from "./boards.service.js";
import { createBoardSchema, type CreateBoardDto } from "./dto/create-board.dto.js";
import { updateBoardSchema, type UpdateBoardDto } from "./dto/update-board.dto.js";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import { BoardAccessGuard } from "../../common/guards/board-access.guard.js";
import { RequireBoardRole } from "../../common/decorators/require-board-role.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { toApiBodySchema } from "../../common/swagger/zod-schema.util.js";
import type { AuthenticatedUser } from "../auth/authenticated-user.js";

@ApiTags("boards")
@ApiBearerAuth()
@Controller("boards")
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  @ApiBody({ schema: toApiBodySchema(createBoardSchema) })
  create(@CurrentUser() user: AuthenticatedUser, @Body(new ZodValidationPipe(createBoardSchema)) dto: CreateBoardDto) {
    return this.boardsService.create(user.id, dto);
  }

  @Get()
  listMine(@CurrentUser() user: AuthenticatedUser) {
    return this.boardsService.listForUser(user.id);
  }

  @UseGuards(BoardAccessGuard)
  @Get(":id")
  get(@Param("id") id: string) {
    return this.boardsService.findById(id);
  }

  @UseGuards(BoardAccessGuard)
  @RequireBoardRole("EDITOR")
  @Patch(":id")
  @ApiBody({ schema: toApiBodySchema(updateBoardSchema) })
  update(@Param("id") id: string, @Body(new ZodValidationPipe(updateBoardSchema)) dto: UpdateBoardDto) {
    return this.boardsService.update(id, dto);
  }

  @UseGuards(BoardAccessGuard)
  @RequireBoardRole("OWNER")
  @Delete(":id")
  @HttpCode(200)
  async delete(@Param("id") id: string) {
    await this.boardsService.delete(id);
    return { id };
  }
}
