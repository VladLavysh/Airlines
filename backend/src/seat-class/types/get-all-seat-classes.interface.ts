export const SEAT_CLASS_ORDER_BY_FIELDS = ['name', 'price_multiplier'] as const;
export type SeatClassOrderByField = (typeof SEAT_CLASS_ORDER_BY_FIELDS)[number];

export interface IGetAllSeatClasses extends IEntityFields {
  limit: number;
  offset: number;
  order_by: SeatClassOrderByField;
  order: 'asc' | 'desc';
}

interface IEntityFields {
  name?: string;
  price_multiplier?: string;
}
