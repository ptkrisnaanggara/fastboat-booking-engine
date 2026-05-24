import { Module } from '@nestjs/common';
import { AuditLogService } from '../audit/audit-log.service';
import { AdminApiKeyGuard } from '../auth/admin-api-key.guard';
import { PaymentAdminController } from '../payment/payment-admin.controller';
import { PaymentWebhookService } from '../payment/payment-webhook.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  controllers: [AdminController, PaymentAdminController],
  providers: [AdminService, AdminApiKeyGuard, PaymentWebhookService, AuditLogService],
})
export class AdminModule {}
