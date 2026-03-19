import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { BookingStatus } from 'src/booking/types/booking.interface';
import { IsValidEnum } from 'src/common/validators/is-valid-enum.validator';

export class PatchBookingDto {
  @IsOptional()
  @IsString()
  @MaxLength(16)
  @Transform(({ value }) => value.toLowerCase())
  @IsValidEnum(BookingStatus)
  status?: BookingStatus;
}
