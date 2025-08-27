import { Test, TestingModule } from '@nestjs/testing';
import { LoansService } from './loans.service';
import { DATA_SOURCE } from '../../database/datasource.provider';

describe('LoansService', () => {
  let service: LoansService;

  const mockDataSource = {
    manager: {
      find: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoansService,
        {
          provide: DATA_SOURCE,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<LoansService>(LoansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
