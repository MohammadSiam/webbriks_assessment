import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module.js";
import { BoardsController } from "./boards.controller.js";
import { BoardsService } from "./boards.service.js";
import { BoardAccessGuard } from "../../common/guards/board-access.guard.js";

@Module({
  imports: [UsersModule],
  controllers: [BoardsController],
  providers: [BoardsService, BoardAccessGuard],
})
export class BoardsModule {}
