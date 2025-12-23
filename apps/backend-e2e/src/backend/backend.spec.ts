import axios from 'axios';

describe('Health endpoints', () => {
  it('returns liveness data', async () => {
    const res = await axios.get('/api/live');

    expect(res.status).toBe(200);
    expect(res.data).toMatchObject({
      status: 'alive',
      timestamp: expect.any(String),
      pid: expect.any(Number),
    });
  });

  it('returns readiness data', async () => {
    const res = await axios.get('/api/ready');

    expect(res.status).toBe(200);
    expect(res.data).toMatchObject({
      status: 'ready',
      timestamp: expect.any(String),
      services: {
        database: 'connected',
      },
    });
  });

  it('returns health data', async () => {
    const res = await axios.get('/api/health');

    expect(res.status).toBe(200);
    expect(res.data).toMatchObject({
      status: 'ok',
      timestamp: expect.any(String),
      uptime: expect.any(Number),
      environment: expect.any(String),
    });
  });
});
