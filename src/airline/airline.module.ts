import { Module } from '@nestjs/common';
import { AirlineController } from './airline.controller';
import { AirlineService } from './airline.service';
import { AirlineRepository } from './airline.repository';

@Module({
  controllers: [AirlineController],
  providers: [AirlineService, AirlineRepository],
})
export class AirlineModule {}
