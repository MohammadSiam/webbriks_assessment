import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { BoardsModule } from './modules/boards/boards.module.js';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, BoardsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
