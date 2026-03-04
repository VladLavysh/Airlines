export const ROUTE_ORDER_BY_FIELDS = ['departure_airport', 'arrival_airport', 'distanceKM'] as const;
export type RouteOrderByField = (typeof ROUTE_ORDER_BY_FIELDS)[number];

export interface IGetAllRoutes extends IEntityFields {
  limit: number;
  offset: number;
  order_by: RouteOrderByField;
  order: 'asc' | 'desc';
}

interface IEntityFields {
  departure_airport?: string;
  arrival_airport?: string;
  distanceKM?: number;
}
