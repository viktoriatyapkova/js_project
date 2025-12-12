import request from 'supertest';
import app from '../src/server.js';
import pool from '../src/utils/database.js';
import bcrypt from 'bcrypt';

describe('Moves API', () => {
  let user1Token;
  let user2Token;
  let user1Id;
  let user2Id;
  let moveId;

  beforeAll(async () => {
    // Create test users
    const passwordHash1 = await bcrypt.hash('password123', 10);
    const passwordHash2 = await bcrypt.hash('password123', 10);

    const user1Result = await pool.query(
      'INSERT INTO users (email, password_hash, username) VALUES ($1, $2, $3) RETURNING id',
      ['moves_test1@example.com', passwordHash1, 'movesuser1']
    );
    user1Id = user1Result.rows[0].id;

    const user2Result = await pool.query(
      'INSERT INTO users (email, password_hash, username) VALUES ($1, $2, $3) RETURNING id',
      ['moves_test2@example.com', passwordHash2, 'movesuser2']
    );
    user2Id = user2Result.rows[0].id;

    // Login to get tokens
    const login1 = await request(app).post('/api/auth/login').send({
      email: 'moves_test1@example.com',
      password: 'password123',
    });
    user1Token = login1.body.token;

    const login2 = await request(app).post('/api/auth/login').send({
      email: 'moves_test2@example.com',
      password: 'password123',
    });
    user2Token = login2.body.token;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM moves WHERE user_id IN ($1, $2)', [user1Id, user2Id]);
    await pool.query('DELETE FROM users WHERE id IN ($1, $2)', [user1Id, user2Id]);
    await pool.end();
  });

  describe('POST /api/moves', () => {
    it('should create a new move', async () => {
      const response = await request(app)
        .post('/api/moves')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Test Move',
          description: 'Test description',
          video_url: 'https://www.youtube.com/watch?v=test',
          difficulty_level: 'beginner',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('move');
      expect(response.body.move.name).toBe('Test Move');
      moveId = response.body.move.id;
    });

    it('should validate video URL', async () => {
      const response = await request(app)
        .post('/api/moves')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Invalid Move',
          video_url: 'https://invalid-url.com',
        });

      expect(response.status).toBe(400);
    });

    it('should require authentication', async () => {
      const response = await request(app).post('/api/moves').send({
        name: 'Test Move',
      });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/moves', () => {
    it('should get all moves for authenticated user', async () => {
      const response = await request(app)
        .get('/api/moves')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('moves');
      expect(response.body.moves.length).toBeGreaterThan(0);
    });

    it('should filter moves by difficulty level', async () => {
      const response = await request(app)
        .get('/api/moves?difficulty_level=beginner')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      expect(response.body.moves.every((m) => m.difficulty_level === 'beginner')).toBe(true);
    });

    it('should search moves by name', async () => {
      const response = await request(app)
        .get('/api/moves?search=Test')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      expect(response.body.moves.every((m) => m.name.toLowerCase().includes('test'))).toBe(true);
    });
  });

  describe('GET /api/moves/:id', () => {
    it('should get move by ID', async () => {
      const response = await request(app)
        .get(`/api/moves/${moveId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      expect(response.body.move.id).toBe(moveId);
    });

    it('should return 404 for non-existent move', async () => {
      const response = await request(app)
        .get('/api/moves/99999')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/moves/:id', () => {
    it('should update own move', async () => {
      const response = await request(app)
        .put(`/api/moves/${moveId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Updated Move',
          description: 'Updated description',
        });

      expect(response.status).toBe(200);
      expect(response.body.move.name).toBe('Updated Move');
    });

    it('should not update other users move', async () => {
      // Create move for user2
      const createResponse = await request(app)
        .post('/api/moves')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          name: 'User2 Move',
        });
      const user2MoveId = createResponse.body.move.id;

      // Try to update with user1 token
      const response = await request(app)
        .put(`/api/moves/${user2MoveId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Hacked Move',
        });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/moves/:id', () => {
    it('should delete own move', async () => {
      // Create a move to delete
      const createResponse = await request(app)
        .post('/api/moves')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'To Delete',
        });
      const deleteMoveId = createResponse.body.move.id;

      const response = await request(app)
        .delete(`/api/moves/${deleteMoveId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
    });

    it('should not delete other users move', async () => {
      // Create move for user2
      const createResponse = await request(app)
        .post('/api/moves')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          name: 'User2 Move To Delete',
        });
      const user2MoveId = createResponse.body.move.id;

      // Try to delete with user1 token
      const response = await request(app)
        .delete(`/api/moves/${user2MoveId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(403);
    });
  });
});



