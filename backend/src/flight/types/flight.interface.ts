export enum FlightStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DELAYED = 'delayed',
}

export interface IFlight {
  departure_time: Date;
  arrival_time: Date;
  flight_status: FlightStatus;
  route_id: number;
  aircraft_id: number;
  airline_id: number;
}
