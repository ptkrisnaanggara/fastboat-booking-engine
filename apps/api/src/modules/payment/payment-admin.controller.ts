import { Body, Controller, Param, Post } from '@nestjs/common';
import { PaymentWebhookService } from './payment-webhook.service';

type PaymentBody = {
  bookingCode: string;
  providerReference: string;
  amount: number;
  currency: string;
  status: 'PAID' | 'FAILED' | 'EXPIRED';
  rawPayload?: Record<string, unknown>;
};

@Controller('admin/payments/:provider')
export class PaymentAdminController {
  constructor(private readonly paymentWebhookService: PaymentWebhookService) {}

  @Post('receive')
  receive(@Param('provider') provider: string, @Body() body: PaymentBody) {
    return this.paymentWebhookService.handleProviderWebhook(provider, body);
  }
}
