import { Injectable, Logger } from '@nestjs/common';
import { RabbitMqPublisher } from '../infrastructure/rabbitmq.publisher';
import { SupabaseService } from '../infrastructure/supabase.service';

@Injectable()
export class BookingExpiryService {
  private readonly logger = new Logger(BookingExpiryService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly events: RabbitMqPublisher,
  ) {}

  async expireOverdueBookings(limit = 50) {
    const now = new Date().toISOString();

    const { data: bookings, error } = await this.supabase.client
      .from('bookings')
      .select('id, booking_code, schedule_id, passenger_count, status, expires_at')
      .eq('status', 'PENDING_PAYMENT')
      .lt('expires_at', now)
      .order('expires_at', { ascending: true })
      .limit(limit);

    if (error) throw error;

    const results = [];

    for (const booking of bookings ?? []) {
      const result = await this.expireOne(booking);
      results.push(result);
    }

    return {
      scannedAt: now,
      expiredCount: results.filter((item) => item.expired).length,
      results,
    };
  }

  private async expireOne(booking: {
    id: string;
    booking_code: string;
    schedule_id: string;
    passenger_count: number;
  }) {
    const { data: updatedBooking, error: updateError } = await this.supabase.client
      .from('bookings')
      .update({
        status: 'EXPIRED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking.id)
      .eq('status', 'PENDING_PAYMENT')
      .select('id, booking_code, schedule_id, passenger_count, status')
      .single();

    if (updateError || !updatedBooking) {
      this.logger.warn(`Skip expiry for booking ${booking.id}`);
      return { bookingId: booking.id, expired: false };
    }

    const { data: schedule } = await this.supabase.client
      .from('schedules')
      .select('id, available_capacity')
      .eq('id', booking.schedule_id)
      .single();

    if (schedule) {
      await this.supabase.client
        .from('schedules')
        .update({
          available_capacity: Number(schedule.available_capacity) + Number(booking.passenger_count),
        })
        .eq('id', booking.schedule_id);
    }

    await this.events.publish('booking.expired', {
      id: booking.id,
      bookingCode: booking.booking_code,
      scheduleId: booking.schedule_id,
      passengerCount: booking.passenger_count,
    });

    return { bookingId: booking.id, expired: true };
  }
}
