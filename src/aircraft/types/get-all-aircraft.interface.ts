export const AIRCRAFT_ORDER_BY_FIELDS = [
  'name',
  'registration_number',
  'manufacturer',
  'year',
  'airline_id',
] as const;
export type AircraftOrderByField = (typeof AIRCRAFT_ORDER_BY_FIELDS)[number];

export interface IGetAllAircraft extends IEntityFields {
  limit: number;
  offset: number;
  order_by: AircraftOrderByField;
  order: 'asc' | 'desc';
}

interface IEntityFields {
  name?: string;
  registration_number?: string;
  manufacturer?: string;
  year?: number;
  airline_id?: number;
}