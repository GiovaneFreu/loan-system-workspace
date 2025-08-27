import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { DATA_SOURCE } from '../../database/datasource.provider';

describe('ClientsService', () => {
  let service: ClientsService;

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
        ClientsService,
        {
          provide: DATA_SOURCE,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
