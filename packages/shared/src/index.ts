export type BookingStatus =
  | 'DRAFT'
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUNDED';

export interface SearchScheduleQuery {
  originPortId: string;
  destinationPortId: string;
  departureDate: string;
  passengers: number;
}

export interface PassengerInput {
  fullName: string;
  nationality?: string;
  identityType?: string;
  identityNumber?: string;
}

export interface CreateBookingInput {
  scheduleId: string;
  customer: {
    fullName: string;
    email?: string;
    phone: string;
  };
  passengers: PassengerInput[];
}
