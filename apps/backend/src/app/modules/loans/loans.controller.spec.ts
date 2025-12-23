import { Test, TestingModule } from '@nestjs/testing';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';

describe('LoansController', () => {
  let controller: LoansController;

  const mockLoansService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByClientId: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoansController],
      providers: [
        {
          provide: LoansService,
          useValue: mockLoansService,
        },
      ],
    }).compile();

    controller = module.get<LoansController>(LoansController);
  });

  it('delegates loan creation', async () => {
    const dto = { purchaseValue: 100 };
    mockLoansService.create.mockResolvedValue({ id: 1 });

    await expect(controller.create(dto as never)).resolves.toEqual({ id: 1 });
    expect(mockLoansService.create).toHaveBeenCalledWith(dto);
  });

  it('maps loans on list', async () => {
    const loans = [
      {
        id: 10,
        dueDate: new Date('2024-06-01'),
        client: { id: 3, name: 'Maria' },
        currencyType: 'USD',
        purchaseDate: new Date('2024-01-01'),
        purchaseValue: 1000,
        finalAmount: 1100,
        interestRate: 2,
        conversionRate: 5.1,
        monthsCount: 5,
      },
    ];
    mockLoansService.findAll.mockResolvedValue(loans);

    await expect(controller.findAll()).resolves.toEqual([
      {
        id: 10,
        dueDate: loans[0].dueDate,
        client: { id: 3, name: 'Maria' },
        currency: { symbol: 'USD' },
        purchaseDate: loans[0].purchaseDate,
        purchaseValue: 1000,
        finalAmount: 1100,
        interestRate: 2,
        conversionRate: 5.1,
        monthsCount: 5,
      },
    ]);
  });

  it('delegates lookup by client id', async () => {
    mockLoansService.findByClientId.mockResolvedValue([{ id: 2 }]);

    await expect(controller.findByClientId('2')).resolves.toEqual([{ id: 2 }]);
    expect(mockLoansService.findByClientId).toHaveBeenCalledWith(2);
  });

  it('delegates lookup by id', async () => {
    mockLoansService.findOne.mockResolvedValue({ id: 5 });

    await expect(controller.findOne('5')).resolves.toEqual({ id: 5 });
    expect(mockLoansService.findOne).toHaveBeenCalledWith(5);
  });

  it('delegates update', async () => {
    const dto = { finalAmount: 1200 };
    mockLoansService.update.mockResolvedValue({ id: 7, ...dto });

    await expect(controller.update('7', dto as never)).resolves.toEqual({
      id: 7,
      finalAmount: 1200,
    });
    expect(mockLoansService.update).toHaveBeenCalledWith(7, dto);
  });

  it('delegates removal', async () => {
    mockLoansService.remove.mockResolvedValue(undefined);

    await expect(controller.remove('8')).resolves.toBeUndefined();
    expect(mockLoansService.remove).toHaveBeenCalledWith(8);
  });
});
