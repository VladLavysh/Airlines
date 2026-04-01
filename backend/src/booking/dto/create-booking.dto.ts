import { IsOptional, IsString, MaxLength, IsInt, Min, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { BookingStatus } from 'src/booking/types/booking.interface';
import { IsValidEnum } from 'src/common/validators/is-valid-enum.validator';

export class CreateBookingDto {
  @IsOptional()
  @IsString()
  @MaxLength(16)
  @Transform(({ value }) => value.toLowerCase())
  @IsValidEnum(BookingStatus)
  status?: BookingStatus;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  flight_id: number;
}
