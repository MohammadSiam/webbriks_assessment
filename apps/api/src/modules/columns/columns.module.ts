import { Module } from "@nestjs/common";
import { ColumnsController } from "./columns.controller.js";
import { ColumnsService } from "./columns.service.js";
import { BoardAccessGuard } from "../../common/guards/board-access.guard.js";

@Module({
  controllers: [ColumnsController],
  providers: [ColumnsService, BoardAccessGuard],
})
export class ColumnsModule {}
