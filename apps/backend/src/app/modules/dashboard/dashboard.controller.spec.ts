import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  const dashboardServiceMock = {
    getDashboardData: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: dashboardServiceMock,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('delegates dashboard data retrieval', async () => {
    const payload = { clientsTotal: 2, loansQuantityTotal: 3, loansValueTotal: 100 };
    dashboardServiceMock.getDashboardData.mockResolvedValue(payload);

    await expect(controller.getDashboardData()).resolves.toEqual(payload);
    expect(dashboardServiceMock.getDashboardData).toHaveBeenCalled();
  });
});
