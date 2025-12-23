import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { DATA_SOURCE } from '../../database/datasource.provider';

describe('ClientsService', () => {
  let service: ClientsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockDataSource = {
    getRepository: jest.fn().mockReturnValue(mockRepository),
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
