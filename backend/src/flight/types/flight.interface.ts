export enum FlightStatus {
  AVAILABLE = 'available',
  PENDING = 'pending',
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
