import {
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
  IsNotEmpty,
  MaxLength,
  IsIn,
  IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { IGetAllFlights, FLIGHT_ORDER_BY_FIELDS } from 'src/flight/types/get-all-flights.interface';
import { FlightStatus } from 'src/flight/types/flight.interface';
import { IsValidEnum } from 'src/common/validators/is-valid-enum.validator';

export class GetFlightsQueryDto implements IGetAllFlights {
  // @Transform(({ value }) => parseInt(value, 10))
  // @IsInt()
  // @Min(1)
  // @Max(100)
  // limit: number = 10;

  // @Transform(({ value }) => parseInt(value, 10))
  // @IsInt()
  // @Min(0)
  // offset: number = 0;

  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  @IsInt()
  cursor?: number;

  @Transform(({ value }) => value.toLowerCase())
  @IsNotEmpty()
  @IsIn(FLIGHT_ORDER_BY_FIELDS)
  order_by: (typeof FLIGHT_ORDER_BY_FIELDS)[number] = 'departure_time';

  @Transform(({ value }) => value.toLowerCase())
  @IsNotEmpty()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'asc';

  @IsOptional()
  @IsString()
  @MaxLength(32)
  @Transform(({ value }) => value.toLowerCase())
  @IsValidEnum(FlightStatus)
  flight_status?: FlightStatus;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  aircraft_id?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  airline_id?: number;

  @IsOptional()
  @IsDateString()
  departure_time?: Date;

  @IsOptional()
  @IsDateString()
  arrival_time?: Date;
}
