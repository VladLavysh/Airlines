import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AirlineService } from './airline.service';
import { AirlineRepository } from './airline.repository';

describe('AirlineService', () => {
  let service: AirlineService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      findAll: jest.fn(),
      findOneById: jest.fn(),
      createOne: jest.fn(),
      updateOneById: jest.fn(),
      deleteOneById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AirlineService,
        {
          provide: AirlineRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AirlineService>(AirlineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllAirlines', () => {
    it('should call repository findAll', async () => {
      mockRepository.findAll.mockResolvedValue([{ id: 1, name: 'Test Airline' }]);

      const result = await service.getAllAirlines({ limit: 10, offset: 0 });

      expect(mockRepository.findAll).toHaveBeenCalledWith(10, 0, undefined);
      expect(result).toEqual([{ id: 1, name: 'Test Airline' }]);
    });
  });

  describe('getAirlineById', () => {
    it('should call repository findOneById', async () => {
      mockRepository.findOneById.mockResolvedValue([{ id: 1, name: 'Test Airline' }]);

      const result = await service.getAirlineById(1);

      expect(mockRepository.findOneById).toHaveBeenCalledWith(1);
      expect(result).toEqual([{ id: 1, name: 'Test Airline' }]);
    });
  });

  describe('createAirline', () => {
    it('should call repository createOne', async () => {
      const airlineData = { name: 'New Airline', iata_code: 'NA', country: 'USA' };
      mockRepository.createOne.mockResolvedValue([{ id: 1, ...airlineData }]);

      const result = await service.createAirline(airlineData);

      expect(mockRepository.createOne).toHaveBeenCalledWith('New Airline', 'NA', 'USA');
      expect(result).toEqual([{ id: 1, ...airlineData }]);
    });
  });

  describe('updateAirlineById', () => {
    it('should update airline successfully', async () => {
      const updatedAirline = { id: 1, name: 'Updated Airline', iata_code: 'UA', country: 'USA' };
      mockRepository.updateOneById.mockResolvedValue([updatedAirline]);

      const result = await service.updateAirlineById(1, { name: 'Updated Airline' });

      expect(mockRepository.updateOneById).toHaveBeenCalledWith(1, { name: 'Updated Airline' });
      expect(result).toEqual(updatedAirline);
    });

    it('should throw NotFoundException when airline not found', async () => {
      mockRepository.updateOneById.mockResolvedValue([]);

      await expect(service.updateAirlineById(999, { name: 'Updated' }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteAirlineById', () => {
    it('should delete airline successfully', async () => {
      mockRepository.deleteOneById.mockResolvedValue([{ id: 1, name: 'Test Airline' }]);

      await service.deleteAirlineById(1);

      expect(mockRepository.deleteOneById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when airline not found', async () => {
      mockRepository.deleteOneById.mockResolvedValue([]);

      await expect(service.deleteAirlineById(999))
        .rejects.toThrow(NotFoundException);
    });
  });
});
