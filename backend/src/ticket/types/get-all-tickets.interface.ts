export const TICKET_ORDER_BY_FIELDS = ['id', 'price', 'booking_id'] as const;
export type TicketOrderByField = (typeof TICKET_ORDER_BY_FIELDS)[number];

export interface IGetAllTickets extends IEntityFields {
  limit: number;
  offset: number;
  order_by: TicketOrderByField;
  order: 'asc' | 'desc';
}

interface IEntityFields {
  booking_id?: number;
  flight_id?: number;
  passenger_id?: number;
}
