import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../infrastructure/supabase.service';

@Injectable()
export class ManifestService {
  constructor(private readonly supabase: SupabaseService) {}

  async getScheduleManifest(scheduleId: string) {
    const { data, error } = await this.supabase.client
      .from('booking_passengers')
      .select(`
        id,
        full_name,
        nationality,
        identity_type,
        identity_number,
        bookings!inner(
          id,
          booking_code,
          status,
          schedule_id,
          customers(full_name, phone, email)
        )
      `)
      .eq('bookings.schedule_id', scheduleId)
      .in('bookings.status', ['PAID', 'CONFIRMED'])
      .order('full_name', { ascending: true });

    if (error) throw error;

    return {
      scheduleId,
      passengers: data ?? [],
      totalPassengers: data?.length ?? 0,
    };
  }
}
