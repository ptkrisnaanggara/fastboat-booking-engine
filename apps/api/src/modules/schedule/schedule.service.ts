import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../infrastructure/supabase.service';
import { SearchScheduleDto } from './dto/search-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(private readonly supabase: SupabaseService) {}

  async search(query: SearchScheduleDto) {
    const start = new Date(`${query.departureDate}T00:00:00.000Z`);
    const end = new Date(`${query.departureDate}T23:59:59.999Z`);

    if (Number.isNaN(start.getTime())) {
      throw new BadRequestException('Invalid departureDate');
    }

    const { data, error } = await this.supabase.client
      .from('schedules')
      .select(`
        *,
        routes!inner(origin_port_id, destination_port_id),
        operators(name),
        vessels(name, capacity)
      `)
      .eq('routes.origin_port_id', query.originPortId)
      .eq('routes.destination_port_id', query.destinationPortId)
      .gte('departure_time', start.toISOString())
      .lte('departure_time', end.toISOString())
      .gte('available_capacity', query.passengers)
      .eq('status', 'OPEN')
      .order('departure_time', { ascending: true });

    if (error) throw error;
    return data;
  }
}
