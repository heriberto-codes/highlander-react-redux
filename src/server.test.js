/**
 * @jest-environment node
 */

const request = require('supertest');

process.env.SECRET = 'test-secret';
const { app } = require('../server');

describe('server routes', () => {
  it('DELETE /sessions should return 204', async () => {
    await request(app).delete('/sessions').expect(204);
  });
});
