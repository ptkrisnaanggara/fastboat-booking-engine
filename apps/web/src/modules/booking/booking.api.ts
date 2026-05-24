import { api } from '../../lib/api';
import type { Schedule, SearchFormValues } from './types';

export async function searchSchedules(values: SearchFormValues): Promise<Schedule[]> {
  const { data } = await api.get('/api/v1/schedules', { params: values });
  return data;
}

export async function createBooking(payload: {
  scheduleId: string;
  customer: { fullName: string; email?: string; phone: string };
  passengers: { fullName: string }[];
}) {
  const { data } = await api.post('/api/v1/bookings', payload);
  return data;
}
