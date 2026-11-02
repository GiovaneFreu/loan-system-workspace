import { DataSource } from 'typeorm';
import { Client } from '../modules/clients/entities/client.entity';
import { Loan } from '../modules/loans/entities/loan.entity';
import { seedDemoData } from './demo-seed';

describe('seedDemoData', () => {
  const originalDemoSeed = process.env.DEMO_SEED;

  const buildDataSource = (existingClients: number) => {
    const clientRepository = {
      count: jest.fn().mockResolvedValue(existingClients),
      create: jest.fn((clients) => clients),
      save: jest.fn(async (clients) =>
        clients.map((client, index) => ({ ...client, id: index + 1 }))
      ),
    };
    const loanRepository = {
      create: jest.fn((loan) => loan),
      save: jest.fn(async (loans) => loans),
    };
    const dataSource = {
      getRepository: jest.fn((entity) =>
        entity === Client ? clientRepository : loanRepository
      ),
    } as unknown as DataSource;

    return { dataSource, clientRepository, loanRepository };
  };

  afterEach(() => {
    if (originalDemoSeed === undefined) {
      delete process.env.DEMO_SEED;
    } else {
      process.env.DEMO_SEED = originalDemoSeed;
    }
    jest.restoreAllMocks();
  });

  it('does nothing when DEMO_SEED is not enabled', async () => {
    delete process.env.DEMO_SEED;
    const { dataSource } = buildDataSource(0);

    await seedDemoData(dataSource);

    expect(dataSource.getRepository).not.toHaveBeenCalled();
  });

  it('does not seed when the database already has clients', async () => {
    process.env.DEMO_SEED = 'true';
    const { dataSource, clientRepository, loanRepository } = buildDataSource(3);

    await seedDemoData(dataSource);

    expect(clientRepository.count).toHaveBeenCalled();
    expect(clientRepository.save).not.toHaveBeenCalled();
    expect(loanRepository.save).not.toHaveBeenCalled();
  });

  it('seeds clients and loans with consistent amounts when enabled and empty', async () => {
    process.env.DEMO_SEED = 'yes';
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const { dataSource, clientRepository, loanRepository } = buildDataSource(0);

    await seedDemoData(dataSource);

    expect(dataSource.getRepository).toHaveBeenCalledWith(Loan);
    const clients = clientRepository.save.mock.calls[0][0];
    const loans = loanRepository.save.mock.calls[0][0];
    expect(clients).toHaveLength(5);
    expect(loans).toHaveLength(6);

    for (const loan of loans) {
      const expected =
        Math.round(
          loan.purchaseValue *
            Math.pow(1 + loan.interestRate / 100, loan.monthsCount) *
            100
        ) / 100;
      expect(loan.finalAmount).toBe(expected);
      expect(loan.dueDate.getTime()).toBeGreaterThan(loan.purchaseDate.getTime());
    }
  });
});
