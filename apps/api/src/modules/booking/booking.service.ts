import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { RabbitMqPublisher } from '../infrastructure/rabbitmq.publisher';
import { RedisLockService } from '../infrastructure/redis-lock.service';
import { SupabaseService } from '../infrastructure/supabase.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly lock: RedisLockService,
    private readonly events: RabbitMqPublisher,
  ) {}

  async createBooking(input: CreateBookingDto) {
    const passengerCount = input.passengers.length;
    const lockKey = `schedule:${input.scheduleId}:inventory`;
    const lockValue = nanoid();
    const lockAcquired = await this.lock.acquire(lockKey, lockValue, 30);

    if (!lockAcquired) {
      throw new BadRequestException('Schedule is being booked. Please retry shortly.');
    }

    try {
      const { data: schedule, error: scheduleError } = await this.supabase.client
        .from('schedules')
        .select('*')
        .eq('id', input.scheduleId)
        .single();

      if (scheduleError || !schedule) {
        throw new NotFoundException('Schedule not found');
      }

      if (schedule.available_capacity < passengerCount) {
        throw new BadRequestException('Not enough seats available');
      }

      const customer = await this.supabase.insertOne<{ id: string }>('customers', input.customer);
      const totalAmount = Number(schedule.base_price) * passengerCount;
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      const booking = await this.supabase.insertOne<{ id: string; booking_code: string }>('bookings', {
        booking_code: `FB${nanoid(10).toUpperCase()}`,
        customer_id: customer.id,
        schedule_id: input.scheduleId,
        status: 'PENDING_PAYMENT',
        passenger_count: passengerCount,
        total_amount: totalAmount,
        currency: schedule.currency,
        expires_at: expiresAt.toISOString(),
      });

      await this.supabase.client.from('booking_passengers').insert(
        input.passengers.map((passenger) => ({
          booking_id: booking.id,
          full_name: passenger.fullName,
          nationality: passenger.nationality,
          identity_type: passenger.identityType,
          identity_number: passenger.identityNumber,
        })),
      );

      await this.supabase.client
        .from('schedules')
        .update({ available_capacity: schedule.available_capacity - passengerCount })
        .eq('id', input.scheduleId);

      await this.events.publish('booking.created', {
        id: booking.id,
        bookingCode: booking.booking_code,
        scheduleId: input.scheduleId,
        passengerCount,
        totalAmount,
      });

      return this.findOne(booking.id);
    } finally {
      await this.lock.release(lockKey, lockValue);
    }
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.client
      .from('bookings')
      .select(`
        *,
        customers(*),
        schedules(*),
        booking_passengers(*),
        payments(*)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Booking not found');
    }

    return data;
  }

  async markPaid(id: string) {
    const booking = await this.findOne(id);

    if (booking.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException(`Booking cannot be paid from status ${booking.status}`);
    }

    await this.supabase.client.from('payments').insert({
      booking_id: id,
      provider: 'manual',
      provider_reference: `MANUAL-${nanoid(12).toUpperCase()}`,
      amount: booking.total_amount,
      currency: booking.currency,
      status: 'PAID',
      paid_at: new Date().toISOString(),
      raw_payload: {
        source: 'admin-mark-paid',
      },
    });

    const updated = await this.supabase.updateOne('bookings', id, {
      status: 'PAID',
      updated_at: new Date().toISOString(),
    });

    await this.events.publish('booking.paid', {
      id,
      bookingCode: booking.booking_code,
      amount: booking.total_amount,
      currency: booking.currency,
    });

    return updated;
  }
}
