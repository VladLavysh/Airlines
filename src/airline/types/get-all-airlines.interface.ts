export const AIRLINE_ORDER_BY_FIELDS = ['name', 'iata_code', 'country', 'price_multiplier'] as const;
export type AirlineOrderByField = (typeof AIRLINE_ORDER_BY_FIELDS)[number];

export interface IGetAllAirlines extends IEntityFields {
  limit: number;
  offset: number;
  order_by: AirlineOrderByField;
  order: 'asc' | 'desc';
}

interface IEntityFields {
  name?: string;
  iata_code?: string;
  country?: string;
  price_multiplier?: string;
}
