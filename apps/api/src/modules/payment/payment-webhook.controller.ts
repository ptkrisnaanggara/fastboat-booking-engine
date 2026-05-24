import { Body, Controller, Param, Post } from '@nestjs/common';
import { PaymentWebhookService } from './payment-webhook.service';

@Controller('admin/payment-events/:provider')
export class PaymentWebhookController {
  constructor(private readonly paymentWebhookService: PaymentWebhookService) {}

  @Post('receive')
  receive(@Param('provider') provider: string, @Body() body: any) {
    return this.paymentWebhookService.handleProviderWebhook(provider, body);
  }
}
