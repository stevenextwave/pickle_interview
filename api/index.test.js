const request = require('supertest');
const server = require('./index');

describe('POST /email', () => {
  it('responds with 201', async () => {
    const response = await request(server).post('/email');
    expect(response.status).toBe(201);
  });
});

afterAll(async () => {
  // Close the server after all tests are done
  await server.close();
});
