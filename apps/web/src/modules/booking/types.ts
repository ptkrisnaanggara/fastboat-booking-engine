export interface Schedule {
  id: string;
  departure_time: string;
  arrival_time: string;
  base_price: number;
  currency: string;
  available_capacity: number;
  operators?: { name: string };
  vessels?: { name: string; capacity: number };
}

export interface SearchFormValues {
  originPortId: string;
  destinationPortId: string;
  departureDate: string;
  passengers: number;
}
