import { Module } from "@nestjs/common";
import { TasksController } from "./tasks.controller.js";
import { TasksService } from "./tasks.service.js";
import { BoardAccessGuard } from "../../common/guards/board-access.guard.js";

@Module({
  controllers: [TasksController],
  providers: [TasksService, BoardAccessGuard],
})
export class TasksModule {}
