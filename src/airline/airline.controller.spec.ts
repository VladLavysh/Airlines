import { Test, TestingModule } from '@nestjs/testing';
import { AirlineController } from './airline.controller';
import { AirlineService } from './airline.service';

describe('AirlineController', () => {
  let controller: AirlineController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      getAllAirlines: jest.fn(),
      getAirlineById: jest.fn(),
      createAirline: jest.fn(),
      updateAirlineById: jest.fn(),
      deleteAirlineById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AirlineController],
      providers: [
        {
          provide: AirlineService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AirlineController>(AirlineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAirlines', () => {
    it('should call service getAllAirlines', async () => {
      mockService.getAllAirlines.mockResolvedValue([
        { id: 1, name: 'Test Airline' },
      ]);

      const result = await controller.getAirlines({
        limit: 10,
        offset: 0,
        search: 'test',
      });

      expect(mockService.getAllAirlines).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        search: 'test',
      });
      expect(result).toEqual([{ id: 1, name: 'Test Airline' }]);
    });
  });

  describe('getAirline', () => {
    it('should call service getAirlineById', async () => {
      mockService.getAirlineById.mockResolvedValue([
        { id: 1, name: 'Test Airline' },
      ]);

      const result = await controller.getAirline(1);

      expect(mockService.getAirlineById).toHaveBeenCalledWith(1);
      expect(result).toEqual([{ id: 1, name: 'Test Airline' }]);
    });
  });

  describe('createAirline', () => {
    it('should call service createAirline', async () => {
      const airlineData = {
        name: 'New Airline',
        iata_code: 'NA',
        country: 'USA',
      };
      mockService.createAirline.mockResolvedValue([{ id: 1, ...airlineData }]);

      const result = await controller.createAirline(airlineData);

      expect(mockService.createAirline).toHaveBeenCalledWith(airlineData);
      expect(result).toEqual([{ id: 1, ...airlineData }]);
    });
  });

  describe('updateAirline', () => {
    it('should call service updateAirlineById', async () => {
      const updateData = { name: 'Updated Airline' };
      mockService.updateAirlineById.mockResolvedValue({ id: 1, ...updateData });

      const result = await controller.updateAirline(1, updateData);

      expect(mockService.updateAirlineById).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual({ id: 1, ...updateData });
    });
  });

  describe('deleteAirline', () => {
    it('should call service deleteAirlineById', async () => {
      mockService.deleteAirlineById.mockResolvedValue(undefined);

      await controller.deleteAirline(1);

      expect(mockService.deleteAirlineById).toHaveBeenCalledWith(1);
    });
  });
});
