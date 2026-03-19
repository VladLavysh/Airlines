import { IsNotEmpty, IsString, MaxLength, IsInt, Min, IsDate } from 'class-validator';
import { IFlight } from 'src/flight/types/flight.interface';
import { FlightStatus } from 'src/flight/types/flight.interface';
import { Transform, Type } from 'class-transformer';
import { IsValidEnum } from 'src/common/validators/is-valid-enum.validator';

export class CreateFlightDto implements IFlight {
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  departure_time: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  arrival_time: Date;

  @IsNotEmpty()
  @IsString()
  @MaxLength(32)
  @Transform(({ value }) => value.toLowerCase())
  @IsValidEnum(FlightStatus)
  flight_status: FlightStatus;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  route_id: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  aircraft_id: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  airline_id: number;
}
