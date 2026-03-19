export enum SeatClassId {
  ECONOMY = 1,
  PREMIUM_ECONOMY = 2,
  BUSINESS = 3,
  FIRST = 4
}

export interface IAircraftSeat {
  seat_number: string;
  seat_class_id: SeatClassId;
}