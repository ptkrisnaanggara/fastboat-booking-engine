import { useState } from 'react';
import { createBooking, searchSchedules } from './booking.api';
import type { Schedule, SearchFormValues } from './types';

export function App() {
  const [form, setForm] = useState<SearchFormValues>({
    originPortId: '',
    destinationPortId: '',
    departureDate: new Date().toISOString().slice(0, 10),
    passengers: 1,
  });
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [bookingResult, setBookingResult] = useState<any>(null);

  async function onSearch() {
    setLoading(true);
    setBookingResult(null);
    try {
      const result = await searchSchedules(form);
      setSchedules(result);
    } finally {
      setLoading(false);
    }
  }

  async function onCreateBooking() {
    if (!selectedSchedule) return;

    const result = await createBooking({
      scheduleId: selectedSchedule.id,
      customer: {
        fullName: 'Demo Customer',
        email: 'customer@example.com',
        phone: '6285738239996',
      },
      passengers: Array.from({ length: Number(form.passengers) }).map((_, index) => ({
        fullName: `Passenger ${index + 1}`,
      })),
    });

    setBookingResult(result);
  }

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">Fastboat Booking Engine</p>
          <h1>Search, book, and manage fastboat tickets.</h1>
          <p className="subtitle">
            React frontend with NestJS backend, Supabase database, Redis seat lock, and RabbitMQ events.
          </p>
        </div>
      </section>

      <section className="card">
        <h2>Search Schedule</h2>
        <div className="grid">
          <input
            placeholder="Origin Port UUID"
            value={form.originPortId}
            onChange={(event) => setForm({ ...form, originPortId: event.target.value })}
          />
          <input
            placeholder="Destination Port UUID"
            value={form.destinationPortId}
            onChange={(event) => setForm({ ...form, destinationPortId: event.target.value })}
          />
          <input
            type="date"
            value={form.departureDate}
            onChange={(event) => setForm({ ...form, departureDate: event.target.value })}
          />
          <input
            type="number"
            min={1}
            value={form.passengers}
            onChange={(event) => setForm({ ...form, passengers: Number(event.target.value) })}
          />
        </div>
        <button onClick={onSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search Fastboat'}
        </button>
      </section>

      <section className="schedule-list">
        {schedules.map((schedule) => (
          <article key={schedule.id} className="schedule-card">
            <div>
              <strong>{new Date(schedule.departure_time).toLocaleString()}</strong>
              <p>
                {schedule.operators?.name || 'Operator'} · {schedule.vessels?.name || 'Vessel'}
              </p>
              <p>{schedule.available_capacity} seats available</p>
            </div>
            <div>
              <strong>
                {schedule.currency} {Number(schedule.base_price).toLocaleString()}
              </strong>
              <button onClick={() => setSelectedSchedule(schedule)}>Select</button>
            </div>
          </article>
        ))}
      </section>

      {selectedSchedule && (
        <section className="card">
          <h2>Create Booking</h2>
          <p>Selected schedule: {selectedSchedule.id}</p>
          <button onClick={onCreateBooking}>Create Demo Booking</button>
        </section>
      )}

      {bookingResult && (
        <section className="card success">
          <h2>Booking Created</h2>
          <pre>{JSON.stringify(bookingResult, null, 2)}</pre>
        </section>
      )}
    </main>
  );
}
