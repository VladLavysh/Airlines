import { BookingStatus } from './booking.interface';

export const BOOKING_ORDER_BY_FIELDS = ['created_at', 'updated_at', 'status'] as const;
export type BookingOrderByField = (typeof BOOKING_ORDER_BY_FIELDS)[number];

export interface IGetAllBookings extends IEntityFields {
  limit: number;
  offset: number;
  order_by: BookingOrderByField;
  order: 'asc' | 'desc';
}

interface IEntityFields {
  status?: BookingStatus;
  user_id?: number;
}
