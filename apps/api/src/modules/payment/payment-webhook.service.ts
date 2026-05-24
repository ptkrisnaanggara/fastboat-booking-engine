import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RabbitMqPublisher } from '../infrastructure/rabbitmq.publisher';
import { SupabaseService } from '../infrastructure/supabase.service';

type WebhookPayload = {
  bookingCode: string;
  providerReference: string;
  amount: number;
  currency: string;
  status: 'PAID' | 'FAILED' | 'EXPIRED';
  rawPayload?: Record<string, unknown>;
};

@Injectable()
export class PaymentWebhookService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly events: RabbitMqPublisher,
  ) {}

  async handleProviderWebhook(provider: string, payload: WebhookPayload) {
    if (!payload.bookingCode || !payload.providerReference) {
      throw new BadRequestException('bookingCode and providerReference are required');
    }

    const { data: existingPayment } = await this.supabase.client
      .from('payments')
      .select('*')
      .eq('provider', provider)
      .eq('provider_reference', payload.providerReference)
      .maybeSingle();

    if (existingPayment) {
      return {
        duplicated: true,
        payment: existingPayment,
      };
    }

    const { data: booking, error: bookingError } = await this.supabase.client
      .from('bookings')
      .select('*')
      .eq('booking_code', payload.bookingCode)
      .single();

    if (bookingError || !booking) {
      throw new NotFoundException('Booking not found');
    }

    const { data: payment, error: paymentError } = await this.supabase.client
      .from('payments')
      .insert({
        booking_id: booking.id,
        provider,
        provider_reference: payload.providerReference,
        amount: payload.amount,
        currency: payload.currency,
        status: payload.status,
        paid_at: payload.status === 'PAID' ? new Date().toISOString() : null,
        raw_payload: payload.rawPayload ?? payload,
      })
      .select('*')
      .single();

    if (paymentError) throw paymentError;

    if (payload.status === 'PAID' && booking.status === 'PENDING_PAYMENT') {
      await this.supabase.client
        .from('bookings')
        .update({
          status: 'PAID',
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.id);

      await this.events.publish('booking.paid', {
        id: booking.id,
        bookingCode: booking.booking_code,
        amount: payload.amount,
        currency: payload.currency,
        provider,
        providerReference: payload.providerReference,
      });
    }

    await this.events.publish('payment.received', {
      bookingId: booking.id,
      bookingCode: booking.booking_code,
      paymentId: payment.id,
      provider,
      status: payload.status,
    });

    return {
      duplicated: false,
      bookingId: booking.id,
      payment,
    };
  }
}
