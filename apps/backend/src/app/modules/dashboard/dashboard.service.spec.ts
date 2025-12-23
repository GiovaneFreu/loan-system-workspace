import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { DATA_SOURCE } from '../../database/datasource.provider';
import { Client } from '../clients/entities/client.entity';
import { Loan } from '../loans/entities/loan.entity';

describe('DashboardService', () => {
  let service: DashboardService;

  const mockDataSource = {
    manager: {
      count: jest.fn(),
      find: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: DATA_SOURCE,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('returns aggregated dashboard data', async () => {
    mockDataSource.manager.count.mockResolvedValue(3);
    mockDataSource.manager.find.mockResolvedValue([
      { purchaseValue: 1000, conversionRate: 5 },
      { purchaseValue: 200, conversionRate: 2 },
    ]);

    await expect(service.getDashboardData()).resolves.toEqual({
      clientsTotal: 3,
      loansQuantityTotal: 2,
      loansValueTotal: 5400,
    });

    expect(mockDataSource.manager.count).toHaveBeenCalledWith(Client);
    expect(mockDataSource.manager.find).toHaveBeenCalledWith(Loan);
  });
});
