import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { BoardsModule } from './modules/boards/boards.module.js';
import { ColumnsModule } from './modules/columns/columns.module.js';
import { TasksModule } from './modules/tasks/tasks.module.js';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, BoardsModule, ColumnsModule, TasksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
