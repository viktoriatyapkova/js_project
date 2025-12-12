import request from 'supertest';
import app from '../src/server.js';
import pool from '../src/utils/database.js';
import bcrypt from 'bcrypt';

describe('Routines API', () => {
  let user1Token;
  let user2Token;
  let user1Id;
  let user2Id;
  let routineId;
  let moveId;

  beforeAll(async () => {
    // Create test users
    const passwordHash1 = await bcrypt.hash('password123', 10);
    const passwordHash2 = await bcrypt.hash('password123', 10);

    const user1Result = await pool.query(
      'INSERT INTO users (email, password_hash, username) VALUES ($1, $2, $3) RETURNING id',
      ['routines_test1@example.com', passwordHash1, 'routinesuser1']
    );
    user1Id = user1Result.rows[0].id;

    const user2Result = await pool.query(
      'INSERT INTO users (email, password_hash, username) VALUES ($1, $2, $3) RETURNING id',
      ['routines_test2@example.com', passwordHash2, 'routinesuser2']
    );
    user2Id = user2Result.rows[0].id;

    // Login to get tokens
    const login1 = await request(app).post('/api/auth/login').send({
      email: 'routines_test1@example.com',
      password: 'password123',
    });
    user1Token = login1.body.token;

    const login2 = await request(app).post('/api/auth/login').send({
      email: 'routines_test2@example.com',
      password: 'password123',
    });
    user2Token = login2.body.token;

    // Create a move for testing
    const moveResponse = await request(app)
      .post('/api/moves')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'Test Move for Routine',
      });
    moveId = moveResponse.body.move.id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM routine_moves WHERE routine_id IN (SELECT id FROM routines WHERE user_id IN ($1, $2))', [user1Id, user2Id]);
    await pool.query('DELETE FROM routines WHERE user_id IN ($1, $2)', [user1Id, user2Id]);
    await pool.query('DELETE FROM moves WHERE user_id IN ($1, $2)', [user1Id, user2Id]);
    await pool.query('DELETE FROM users WHERE id IN ($1, $2)', [user1Id, user2Id]);
    await pool.end();
  });

  describe('POST /api/routines', () => {
    it('should create a new routine', async () => {
      const response = await request(app)
        .post('/api/routines')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Test Routine',
          description: 'Test description',
          duration_minutes: 10,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('routine');
      expect(response.body.routine.name).toBe('Test Routine');
      routineId = response.body.routine.id;
    });

    it('should validate unique routine name for user', async () => {
      const response = await request(app)
        .post('/api/routines')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Test Routine',
          description: 'Duplicate name',
        });

      expect(response.status).toBe(409);
    });

    it('should allow same name for different users', async () => {
      const response = await request(app)
        .post('/api/routines')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          name: 'Test Routine',
          description: 'Same name, different user',
        });

      expect(response.status).toBe(201);
    });
  });

  describe('GET /api/routines', () => {
    it('should get all routines for authenticated user', async () => {
      const response = await request(app)
        .get('/api/routines')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('routines');
      expect(response.body.routines.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/routines/:id', () => {
    it('should get routine by ID with moves', async () => {
      const response = await request(app)
        .get(`/api/routines/${routineId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      expect(response.body.routine.id).toBe(routineId);
      expect(response.body.routine).toHaveProperty('moves');
    });
  });

  describe('POST /api/routines/:id/moves', () => {
    it('should add move to routine', async () => {
      const response = await request(app)
        .post(`/api/routines/${routineId}/moves`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          move_id: moveId,
          order: 0,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('routine_move');
    });

    it('should not add move to other users routine', async () => {
      // Create routine for user2
      const createResponse = await request(app)
        .post('/api/routines')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          name: 'User2 Routine',
        });
      const user2RoutineId = createResponse.body.routine.id;

      // Try to add move with user1 token
      const response = await request(app)
        .post(`/api/routines/${user2RoutineId}/moves`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          move_id: moveId,
          order: 0,
        });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/routines/:id/moves', () => {
    it('should get moves for routine', async () => {
      const response = await request(app)
        .get(`/api/routines/${routineId}/moves`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('moves');
      expect(response.body.moves.length).toBeGreaterThan(0);
    });
  });

  describe('DELETE /api/routines/:id/moves/:moveId', () => {
    it('should remove move from routine', async () => {
      const response = await request(app)
        .delete(`/api/routines/${routineId}/moves/${moveId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
    });
  });

  describe('PUT /api/routines/:id', () => {
    it('should update own routine', async () => {
      const response = await request(app)
        .put(`/api/routines/${routineId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Updated Routine',
          description: 'Updated description',
        });

      expect(response.status).toBe(200);
      expect(response.body.routine.name).toBe('Updated Routine');
    });

    it('should not update other users routine', async () => {
      // Create routine for user2
      const createResponse = await request(app)
        .post('/api/routines')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          name: 'User2 Routine To Update',
        });
      const user2RoutineId = createResponse.body.routine.id;

      // Try to update with user1 token
      const response = await request(app)
        .put(`/api/routines/${user2RoutineId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Hacked Routine',
        });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/routines/:id', () => {
    it('should delete own routine', async () => {
      // Create a routine to delete
      const createResponse = await request(app)
        .post('/api/routines')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'To Delete',
        });
      const deleteRoutineId = createResponse.body.routine.id;

      const response = await request(app)
        .delete(`/api/routines/${deleteRoutineId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
    });

    it('should not delete other users routine', async () => {
      // Create routine for user2
      const createResponse = await request(app)
        .post('/api/routines')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          name: 'User2 Routine To Delete',
        });
      const user2RoutineId = createResponse.body.routine.id;

      // Try to delete with user1 token
      const response = await request(app)
        .delete(`/api/routines/${user2RoutineId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(403);
    });
  });
});



