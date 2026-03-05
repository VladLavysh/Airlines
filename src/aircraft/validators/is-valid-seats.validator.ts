import { ValidateBy, ValidationOptions } from "class-validator";
import { SeatClassId } from "src/seat/types/seat.interface";

export default function IsValidSeats(validationOptions?: ValidationOptions) {
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
              Object.values(SeatClassId).includes(seat.seat_class_id)
          );
        },
        defaultMessage: () =>
          'Invalid seat_class_id (1=ECONOMY, 2=PREMIUM_ECONOMY, 3=BUSINESS, 4=FIRST)',
      },
    },
    validationOptions
  );
}