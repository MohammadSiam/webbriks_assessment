import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from "@nestjs/swagger";
import { paginationQuerySchema, type PaginationQuery } from "@webbriks/shared-types";
import { BoardsService } from "./boards.service.js";
import { createBoardSchema, type CreateBoardDto } from "./dto/create-board.dto.js";
import { updateBoardSchema, type UpdateBoardDto } from "./dto/update-board.dto.js";
import { addBoardMemberSchema, type AddMemberDto } from "./dto/add-member.dto.js";
import { updateBoardMemberRoleSchema, type UpdateMemberRoleDto } from "./dto/update-member-role.dto.js";
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
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  listMine(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery,
  ) {
    return this.boardsService.listForUser(user.id, query.page, query.limit);
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

  @UseGuards(BoardAccessGuard)
  @RequireBoardRole("OWNER")
  @Get(":id/members")
  listMembers(@Param("id") id: string) {
    return this.boardsService.listMembers(id);
  }

  @UseGuards(BoardAccessGuard)
  @RequireBoardRole("OWNER")
  @Post(":id/members")
  @ApiBody({ schema: toApiBodySchema(addBoardMemberSchema) })
  addMember(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(addBoardMemberSchema)) dto: AddMemberDto,
  ) {
    return this.boardsService.addMember(id, user.id, dto.email, dto.role);
  }

  @UseGuards(BoardAccessGuard)
  @RequireBoardRole("OWNER")
  @Patch(":id/members/:userId")
  @ApiBody({ schema: toApiBodySchema(updateBoardMemberRoleSchema) })
  updateMemberRole(
    @Param("id") id: string,
    @Param("userId") userId: string,
    @Body(new ZodValidationPipe(updateBoardMemberRoleSchema)) dto: UpdateMemberRoleDto,
  ) {
    return this.boardsService.updateMemberRole(id, userId, dto.role);
  }

  @UseGuards(BoardAccessGuard)
  @RequireBoardRole("OWNER")
  @Delete(":id/members/:userId")
  @HttpCode(200)
  async removeMember(@Param("id") id: string, @Param("userId") userId: string) {
    await this.boardsService.removeMember(id, userId);
    return { userId };
  }
}
