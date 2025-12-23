import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { DATA_SOURCE } from '../../database/datasource.provider';

describe('DashboardService', () => {
  let service: DashboardService;

  const mockDataSource = {
    manager: {
      count: jest.fn(),
      find: jest.fn(),
    },
  };

  beforeEach(async () => {
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
