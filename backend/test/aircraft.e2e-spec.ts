import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from 'src/app.module';

describe('Aircraft (e2e)', () => {
  let app: INestApplication;
  let createdAircraftId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/aircraft', () => {
    it('should return an array of aircraft', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/aircraft')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should respect limit and offset query parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/aircraft')
        .query({ limit: 5, offset: 0 })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(5);
    });

    it('should filter by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/aircraft')
        .query({ name: 'Boeing' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by manufacturer', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/aircraft')
        .query({ manufacturer: 'Airbus' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by year', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/aircraft')
        .query({ year: 2020 })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by total_seats range', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/aircraft')
        .query({ total_seats_from: 100, total_seats_to: 300 })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by airline_id', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/aircraft')
        .query({ airline_id: 1 })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should support order_by and order parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/aircraft')
        .query({ order_by: 'year', order: 'desc' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 400 for invalid limit', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/aircraft')
        .query({ limit: -1 })
        .expect(400);
    });

    it('should return 400 for invalid offset', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/aircraft')
        .query({ offset: -1 })
        .expect(400);
    });

    it('should return 400 for limit exceeding max', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/aircraft')
        .query({ limit: 101 })
        .expect(400);
    });

    it('should return 400 for invalid year', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/aircraft')
        .query({ year: 1800 })
        .expect(400);
    });
  });

  describe('POST /api/v1/aircraft', () => {
    it('should create a new aircraft', async () => {
      const aircraftData = {
        name: 'Boeing 737-800',
        registration_number: 'N12345',
        manufacturer: 'Boeing',
        year: 2020,
        total_seats: 189,
        airline_id: 1,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/aircraft')
        .send(aircraftData)
        .expect(201);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0].name).toBe(aircraftData.name);
      expect(response.body[0].registration_number).toBe(aircraftData.registration_number);
      expect(response.body[0].manufacturer).toBe(aircraftData.manufacturer);
      expect(response.body[0].year).toBe(aircraftData.year);
      expect(response.body[0].total_seats).toBe(aircraftData.total_seats);
      expect(response.body[0].airline_id).toBe(aircraftData.airline_id);

      createdAircraftId = response.body[0].id;
    });

    it('should return 400 for missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/aircraft')
        .send({
          name: 'Incomplete Aircraft',
        })
        .expect(400);
    });

    it('should return 400 for empty name', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/aircraft')
        .send({
          name: '',
          registration_number: 'N12345',
          manufacturer: 'Boeing',
          year: 2020,
          total_seats: 189,
          airline_id: 1,
        })
        .expect(400);
    });

    it('should return 400 when name exceeds max length', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/aircraft')
        .send({
          name: 'A'.repeat(65),
          registration_number: 'N12345',
          manufacturer: 'Boeing',
          year: 2020,
          total_seats: 189,
          airline_id: 1,
        })
        .expect(400);
    });

    it('should return 400 when registration_number exceeds max length', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/aircraft')
        .send({
          name: 'Boeing 737',
          registration_number: 'A'.repeat(17),
          manufacturer: 'Boeing',
          year: 2020,
          total_seats: 189,
          airline_id: 1,
        })
        .expect(400);
    });

    it('should return 400 for invalid year (too old)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/aircraft')
        .send({
          name: 'Boeing 737',
          registration_number: 'N12345',
          manufacturer: 'Boeing',
          year: 1899,
          total_seats: 189,
          airline_id: 1,
        })
        .expect(400);
    });

    it('should return 400 for invalid year (too new)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/aircraft')
        .send({
          name: 'Boeing 737',
          registration_number: 'N12345',
          manufacturer: 'Boeing',
          year: 2031,
          total_seats: 189,
          airline_id: 1,
        })
        .expect(400);
    });

    it('should return 400 for invalid total_seats', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/aircraft')
        .send({
          name: 'Boeing 737',
          registration_number: 'N12345',
          manufacturer: 'Boeing',
          year: 2020,
          total_seats: 0,
          airline_id: 1,
        })
        .expect(400);
    });

    it('should return 400 for invalid airline_id', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/aircraft')
        .send({
          name: 'Boeing 737',
          registration_number: 'N12345',
          manufacturer: 'Boeing',
          year: 2020,
          total_seats: 189,
          airline_id: 0,
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/aircraft/:id', () => {
    it('should return a single aircraft by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/aircraft/${createdAircraftId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdAircraftId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('registration_number');
    });

    it('should return 400 for invalid id format', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/aircraft/invalid')
        .expect(400);
    });

    it('should return 404 for non-existent aircraft', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/aircraft/999999')
        .expect(404);
    });
  });

  describe('PATCH /api/v1/aircraft/:id', () => {
    it('should update aircraft name', async () => {
      const updateData = {
        name: 'Updated Aircraft Name',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/aircraft/${createdAircraftId}`)
        .send(updateData)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0].name).toBe(updateData.name);
    });

    it('should update multiple fields', async () => {
      const updateData = {
        manufacturer: 'Airbus',
        total_seats: 220,
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/aircraft/${createdAircraftId}`)
        .send(updateData)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0].manufacturer).toBe(updateData.manufacturer);
      expect(response.body[0].total_seats).toBe(updateData.total_seats);
    });

    it('should return 400 for invalid year in update', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/aircraft/${createdAircraftId}`)
        .send({ year: 1800 })
        .expect(400);
    });

    it('should return 400 for invalid total_seats in update', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/aircraft/${createdAircraftId}`)
        .send({ total_seats: 0 })
        .expect(400);
    });

    it('should return 404 for non-existent aircraft', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/aircraft/999999')
        .send({ name: 'Test' })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/aircraft/:id', () => {
    it('should delete an aircraft', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/aircraft/${createdAircraftId}`)
        .expect(200);
    });

    it('should return 404 when deleting non-existent aircraft', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/aircraft/999999')
        .expect(404);
    });

    it('should return 400 for invalid id format', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/aircraft/invalid')
        .expect(400);
    });
  });

  describe('Error handling', () => {
    it('should handle malformed JSON in POST requests', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/aircraft')
        .set('Content-Type', 'application/json')
        .send('{"name": "test", invalid json}')
        .expect(400);
    });

    it('should reject unknown fields in POST', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/aircraft')
        .send({
          name: 'Boeing 737',
          registration_number: 'N12345',
          manufacturer: 'Boeing',
          year: 2020,
          total_seats: 189,
          airline_id: 1,
          unknown_field: 'should be rejected',
        })
        .expect(400);
    });
  });
});
