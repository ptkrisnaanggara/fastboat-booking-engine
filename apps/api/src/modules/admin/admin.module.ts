import { Module } from '@nestjs/common';
import { AdminApiKeyGuard } from '../auth/admin-api-key.guard';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, AdminApiKeyGuard],
})
export class AdminModule {}
