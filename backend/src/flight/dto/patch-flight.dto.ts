import { IsOptional, IsString, MaxLength, IsInt, Min, IsDate } from 'class-validator';
import { IFlight } from 'src/flight/types/flight.interface';
import { FlightStatus } from 'src/flight/types/flight.interface';
import { Transform, Type } from 'class-transformer';
import { IsValidEnum } from 'src/common/validators/is-valid-enum.validator';

export class PatchFlightDto implements Partial<IFlight> {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  departure_time?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  arrival_time?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  @Transform(({ value }) => value.toLowerCase())
  @IsValidEnum(FlightStatus)
  flight_status?: FlightStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  route_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  aircraft_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  airline_id?: number;
}
