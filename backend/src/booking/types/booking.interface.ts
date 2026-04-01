export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export interface IBooking {
  status: BookingStatus;
  user_id: number;
  flight_id: number;
}
