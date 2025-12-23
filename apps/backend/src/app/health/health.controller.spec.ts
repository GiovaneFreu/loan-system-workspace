import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(() => {
    controller = new HealthController();
  });

  it('returns health status', async () => {
    await expect(controller.checkHealth()).resolves.toMatchObject({
      status: 'ok',
      timestamp: expect.any(String),
      uptime: expect.any(Number),
      environment: expect.any(String),
    });
  });

  it('returns readiness status', async () => {
    await expect(controller.checkReadiness()).resolves.toMatchObject({
      status: 'ready',
      timestamp: expect.any(String),
      services: {
        database: 'connected',
      },
    });
  });

  it('returns liveness status', () => {
    expect(controller.checkLiveness()).toMatchObject({
      status: 'alive',
      timestamp: expect.any(String),
      pid: expect.any(Number),
    });
  });
});
