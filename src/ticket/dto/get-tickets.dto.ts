import { IsInt, Min, Max, IsOptional, IsNotEmpty, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { IGetAllTickets, TICKET_ORDER_BY_FIELDS } from 'src/ticket/types/get-all-tickets.interface';

export class GetTicketsQueryDto implements IGetAllTickets {
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
  @IsIn(TICKET_ORDER_BY_FIELDS)
  order_by: (typeof TICKET_ORDER_BY_FIELDS)[number] = 'id';

  @Transform(({ value }) => value.toLowerCase())
  @IsNotEmpty()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'asc';

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  booking_id?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  flight_id?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  passenger_id?: number;
}
