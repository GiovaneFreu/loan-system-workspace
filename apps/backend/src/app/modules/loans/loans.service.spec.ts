import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LoansService } from './loans.service';
import { DATA_SOURCE } from '../../database/datasource.provider';

describe('LoansService', () => {
  let service: LoansService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockDataSource = {
    getRepository: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockDataSource.getRepository.mockReturnValue(mockRepository);

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

  it('creates and persists a loan', async () => {
    const dto = {
      purchaseDate: new Date('2024-01-01'),
      currency: { symbol: 'USD', name: 'Dollar' },
      purchaseValue: 1000,
      interestRate: 2,
      dueDate: new Date('2024-06-01'),
      client: { id: 10, name: 'Maria' },
      monthsCount: 5,
      finalAmount: 1100,
      conversionRate: 5.1,
    };

    const created = {
      purchaseDate: dto.purchaseDate,
      currencyType: 'USD',
      purchaseValue: 1000,
      interestRate: 2,
      dueDate: dto.dueDate,
      client: { id: 10 },
      monthsCount: 5,
      finalAmount: 1100,
      conversionRate: 5.1,
    };

    mockRepository.create.mockReturnValue(created);
    mockRepository.save.mockResolvedValue({ id: 1, ...created });

    await expect(service.create(dto as never)).resolves.toEqual({ id: 1, ...created });
    expect(mockRepository.create).toHaveBeenCalledWith(created);
    expect(mockRepository.save).toHaveBeenCalledWith(created);
  });

  it('finds all loans with clients', async () => {
    const loans = [{ id: 1 }];
    mockRepository.find.mockResolvedValue(loans);

    await expect(service.findAll()).resolves.toEqual(loans);
    expect(mockRepository.find).toHaveBeenCalledWith({ relations: ['client'] });
  });

  it('finds a loan by id', async () => {
    const loan = { id: 2 };
    mockRepository.findOne.mockResolvedValue(loan);

    await expect(service.findOne(2)).resolves.toEqual(loan);
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: 2 },
      relations: ['client'],
    });
  });

  it('throws when loan is not found', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates an existing loan', async () => {
    const existing = { id: 3, finalAmount: 1000 };
    mockRepository.findOne.mockResolvedValue(existing);
    mockRepository.save.mockResolvedValue({ ...existing, finalAmount: 1200 });

    await expect(service.update(3, { finalAmount: 1200 } as never)).resolves.toEqual({
      id: 3,
      finalAmount: 1200,
    });
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 3, finalAmount: 1200 })
    );
  });

  it('removes a loan', async () => {
    mockRepository.delete.mockResolvedValue({ affected: 1 });

    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(mockRepository.delete).toHaveBeenCalledWith(1);
  });

  it('throws when removing a missing loan', async () => {
    mockRepository.delete.mockResolvedValue({ affected: 0 });

    await expect(service.remove(999)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('finds loans by client id', async () => {
    const loans = [{ id: 4 }];
    mockRepository.find.mockResolvedValue(loans);

    await expect(service.findByClientId(10)).resolves.toEqual(loans);
    expect(mockRepository.find).toHaveBeenCalledWith({
      where: { client: { id: 10 } },
      relations: ['client'],
    });
  });
});
