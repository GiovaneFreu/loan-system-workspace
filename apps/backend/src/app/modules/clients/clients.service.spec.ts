import { NotFoundException } from '@nestjs/common';
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
    getRepository: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockDataSource.getRepository.mockReturnValue(mockRepository);

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

  it('creates and persists a client', async () => {
    const dto = {
      name: 'Maria',
      birthDate: new Date('1990-01-01'),
      cpf_cnpj: '12345678900',
      monthlyIncome: 3000,
    };
    const created = { ...dto };
    const saved = { id: 1, ...created };

    mockRepository.create.mockReturnValue(created);
    mockRepository.save.mockResolvedValue(saved);

    await expect(service.create(dto)).resolves.toEqual(saved);
    expect(mockRepository.create).toHaveBeenCalledWith(dto);
    expect(mockRepository.save).toHaveBeenCalledWith(created);
  });

  it('finds all clients with loans', async () => {
    const clients = [{ id: 1, name: 'Joao', loans: [] }];
    mockRepository.find.mockResolvedValue(clients);

    await expect(service.findAll()).resolves.toEqual(clients);
    expect(mockRepository.find).toHaveBeenCalledWith({ relations: ['loans'] });
  });

  it('finds a client by id', async () => {
    const client = { id: 2, name: 'Ana', loans: [] };
    mockRepository.findOne.mockResolvedValue(client);

    await expect(service.findOne(2)).resolves.toEqual(client);
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: 2 },
      relations: ['loans'],
    });
  });

  it('throws when client is not found', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates an existing client', async () => {
    const existing = { id: 3, name: 'Ana', monthlyIncome: 2000 };
    const updated = { ...existing, name: 'Ana Maria' };

    mockRepository.findOne.mockResolvedValue(existing);
    mockRepository.save.mockResolvedValue(updated);

    await expect(service.update(3, { name: 'Ana Maria' })).resolves.toEqual(updated);
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 3, name: 'Ana Maria' })
    );
  });

  it('removes a client', async () => {
    mockRepository.delete.mockResolvedValue({ affected: 1 });

    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(mockRepository.delete).toHaveBeenCalledWith(1);
  });

  it('throws when removing a missing client', async () => {
    mockRepository.delete.mockResolvedValue({ affected: 0 });

    await expect(service.remove(999)).rejects.toBeInstanceOf(NotFoundException);
  });
});
