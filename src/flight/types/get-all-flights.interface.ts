import { FlightStatus } from "./flight.interface";

export const FLIGHT_ORDER_BY_FIELDS = ['departure_time', 'arrival_time', 'flight_status', 'route_id', 'aircraft_id', 'airline_id'] as const;
export type FlightOrderByField = (typeof FLIGHT_ORDER_BY_FIELDS)[number];

export interface IGetAllFlights extends IEntityFields {
  limit: number;
  offset: number;
  order_by: FlightOrderByField;
  order: 'asc' | 'desc';
}

interface IEntityFields {
  flight_status?: FlightStatus;
  aircraft_id?: number;
  airline_id?: number;
  departure_time?: Date;
  arrival_time?: Date;
}
