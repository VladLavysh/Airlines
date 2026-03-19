import { IsInt, Min, Max, IsOptional, IsString, IsNotEmpty, MaxLength, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { IGetAllBookings, BOOKING_ORDER_BY_FIELDS } from 'src/booking/types/get-all-bookings.interface';
import { BookingStatus } from 'src/booking/types/booking.interface';
import { IsValidEnum } from 'src/common/validators/is-valid-enum.validator';

export class GetBookingsQueryDto implements IGetAllBookings {
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(0)
  offset: number = 0;

  @Transform(({ value }) => value.toLowerCase())
  @IsNotEmpty()
  @IsIn(BOOKING_ORDER_BY_FIELDS)
  order_by: (typeof BOOKING_ORDER_BY_FIELDS)[number] = 'created_at';

  @Transform(({ value }) => value.toLowerCase())
  @IsNotEmpty()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsString()
  @MaxLength(16)
  @Transform(({ value }) => value.toLowerCase())
  @IsValidEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  user_id?: number;
}
