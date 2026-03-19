import { IAircraftSeat } from "src/seat/types/seat.interface";

export interface IAircraft {
  name: string;
  registration_number: string;
  manufacturer: string;
  year: number;
  price_multiplier: string | number;
  airline_id: number;
  seats: IAircraftSeat[]
}
