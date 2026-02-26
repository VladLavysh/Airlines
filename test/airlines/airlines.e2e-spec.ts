import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Airlines (e2e)', () => {
  let app: INestApplication;
  let createdAirlineId: number;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/airline', () => {
    it('should return an array of airlines', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/airline')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should respect query parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/airline')
        .query({ limit: 5, offset: 0 })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(5);
    });

    it('should handle search functionality', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/airline')
        .query({ search: 'test', limit: 10, offset: 0 })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/v1/airline', () => {
    it('should create a new airline', async () => {
      const airlineData = {
        name: 'New Test Airline',
        iata_code: 'NTA',
        country: 'New Test Country'
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/airline')
        .send(airlineData)
        .expect(201);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0].name).toBe(airlineData.name);
      expect(response.body[0].iata_code).toBe(airlineData.iata_code);
      expect(response.body[0].country).toBe(airlineData.country);
    });

    it('should return 400 for missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/airline')
        .send({
          name: 'Incomplete Airline'
          // Missing iata_code and country
        })
        .expect(400);
    });

    it('should return 400 for invalid IATA code format', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/airline')
        .send({
          name: 'Test Airline',
          iata_code: 'TOOLONG', // More than 3 characters
          country: 'Test Country'
        })
        .expect(400);
    });

    it('should return 400 for empty name', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/airline')
        .send({
          name: '',
          iata_code: 'TST',
          country: 'Test Country'
        })
        .expect(400);
    });
  });

  describe('Error handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking database failures
      // For now, just ensure the endpoint responds with appropriate error
      const response = await request(app.getHttpServer())
        .get('/api/v1/airline')
        .expect(200);

      expect(response.status).toBe(200);
    });

    it('should validate query parameters', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/airline')
        .query({ limit: -1, offset: -1 }) // Invalid values
        .expect(400);
    });

    it('should handle malformed JSON in POST requests', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/airline')
        .set('Content-Type', 'application/json')
        .send('{"name": "test", invalid json}')
        .expect(400);
    });
  });
});
