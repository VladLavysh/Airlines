export const PASSENGER_ORDER_BY_FIELDS = ['first_name', 'last_name', 'created_at'] as const;
export type PassengerOrderByField = (typeof PASSENGER_ORDER_BY_FIELDS)[number];

export interface IGetAllPassengers extends IEntityFields {
  limit: number;
  offset: number;
  order_by: PassengerOrderByField;
  order: 'asc' | 'desc';
}

interface IEntityFields {
  first_name?: string;
  last_name?: string;
  passport_number?: string;
}
