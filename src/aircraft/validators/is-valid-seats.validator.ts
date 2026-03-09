import { ValidateBy, ValidationOptions } from "class-validator";
import { SeatClassId } from "src/seat/types/seat.interface";

export default function IsValidSeats(validationOptions?: ValidationOptions) {
  const validSeatClassIds = Object.values(SeatClassId).filter(v => typeof v === 'number');
  
  return ValidateBy(
    {
      name: 'isValidSeats',
      validator: {
        validate: (value: any[]) => {
          if (!Array.isArray(value)) return false;
          return value.every(
            (seat) =>
              seat.seat_number &&
              typeof seat.seat_number === 'string' &&
              validSeatClassIds.includes(seat.seat_class_id)
          );
        },
        defaultMessage: () =>
          'Invalid seat_class_id. Valid values: 1=ECONOMY, 2=PREMIUM_ECONOMY, 3=BUSINESS, 4=FIRST',
      },
    },
    validationOptions
  );
}