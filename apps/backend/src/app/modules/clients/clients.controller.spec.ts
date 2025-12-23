import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

describe('ClientsController', () => {
  let controller: ClientsController;

  const mockClientsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        {
          provide: ClientsService,
          useValue: mockClientsService,
        },
      ],
    }).compile();

    controller = module.get<ClientsController>(ClientsController);
  });

  it('delegates client creation', async () => {
    const dto = { name: 'Ana' };
    mockClientsService.create.mockResolvedValue({ id: 1, ...dto });

    await expect(controller.create(dto as never)).resolves.toEqual({
      id: 1,
      name: 'Ana',
    });
    expect(mockClientsService.create).toHaveBeenCalledWith(dto);
  });

  it('delegates client listing', async () => {
    mockClientsService.findAll.mockResolvedValue([{ id: 1 }]);

    await expect(controller.findAll()).resolves.toEqual([{ id: 1 }]);
    expect(mockClientsService.findAll).toHaveBeenCalled();
  });

  it('delegates client lookup', async () => {
    mockClientsService.findOne.mockResolvedValue({ id: 2 });

    await expect(controller.findOne('2')).resolves.toEqual({ id: 2 });
    expect(mockClientsService.findOne).toHaveBeenCalledWith(2);
  });

  it('delegates client update', async () => {
    const dto = { name: 'Novo Nome' };
    mockClientsService.update.mockResolvedValue({ id: 3, ...dto });

    await expect(controller.update('3', dto as never)).resolves.toEqual({
      id: 3,
      name: 'Novo Nome',
    });
    expect(mockClientsService.update).toHaveBeenCalledWith(3, dto);
  });

  it('delegates client removal', async () => {
    mockClientsService.remove.mockResolvedValue(undefined);

    await expect(controller.remove('4')).resolves.toBeUndefined();
    expect(mockClientsService.remove).toHaveBeenCalledWith(4);
  });
});
