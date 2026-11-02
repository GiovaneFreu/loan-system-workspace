import { addMonths, startOfDay } from 'date-fns';
import { DataSource } from 'typeorm';
import { Client } from '../modules/clients/entities/client.entity';
import { Loan } from '../modules/loans/entities/loan.entity';

/**
 * Seeds fictitious demo data when DEMO_SEED=true and the database is empty.
 *
 * The public demo runs on Cloud Run with an in-container SQLite database,
 * which is recreated whenever the service scales to zero. Seeding on startup
 * keeps the demo from opening on an empty screen. All names and documents
 * below are fictitious (the CPF/CNPJ numbers only satisfy the check digits).
 */
export async function seedDemoData(dataSource: DataSource): Promise<void> {
  const enabled = ['true', '1', 'yes'].includes(
    String(process.env.DEMO_SEED ?? '').trim().toLowerCase()
  );
  if (!enabled) {
    return;
  }

  const clientRepository = dataSource.getRepository(Client);
  if ((await clientRepository.count()) > 0) {
    return;
  }

  const clients = await clientRepository.save(
    clientRepository.create([
      { name: 'Ana Paula Ribeiro', birthDate: new Date('1988-04-17'), cpf_cnpj: '12345678143', monthlyIncome: 8500 },
      { name: 'Bruno Carvalho Lima', birthDate: new Date('1979-11-02'), cpf_cnpj: '98765432029', monthlyIncome: 12400 },
      { name: 'Carla Mendes Duarte', birthDate: new Date('1993-07-25'), cpf_cnpj: '24681357928', monthlyIncome: 6200 },
      { name: 'Diego Ferraz Nogueira', birthDate: new Date('1985-01-30'), cpf_cnpj: '13579246828', monthlyIncome: 15800 },
      { name: 'Agro Vale Comércio de Grãos Ltda', birthDate: new Date('2009-03-10'), cpf_cnpj: '11222333000181', monthlyIncome: 185000 },
    ])
  );

  const today = startOfDay(new Date());
  const loanSeeds: Array<{
    client: Client;
    currencyType: string;
    purchaseValue: number;
    conversionRate: number;
    interestRate: number;
    startOffset: number;
    monthsCount: number;
  }> = [
    { client: clients[0], currencyType: 'USD', purchaseValue: 2500, conversionRate: 5.42, interestRate: 1.2, startOffset: -4, monthsCount: 12 },
    { client: clients[1], currencyType: 'EUR', purchaseValue: 4800, conversionRate: 6.18, interestRate: 0.9, startOffset: -2, monthsCount: 18 },
    { client: clients[2], currencyType: 'USD', purchaseValue: 1200, conversionRate: 5.37, interestRate: 1.5, startOffset: -6, monthsCount: 12 },
    { client: clients[3], currencyType: 'GBP', purchaseValue: 3000, conversionRate: 7.05, interestRate: 1.1, startOffset: -1, monthsCount: 24 },
    { client: clients[4], currencyType: 'USD', purchaseValue: 85000, conversionRate: 5.4, interestRate: 0.8, startOffset: -3, monthsCount: 36 },
    { client: clients[4], currencyType: 'EUR', purchaseValue: 40000, conversionRate: 6.21, interestRate: 0.85, startOffset: -8, monthsCount: 24 },
  ];

  const loanRepository = dataSource.getRepository(Loan);
  await loanRepository.save(
    loanSeeds.map((seed) => {
      const purchaseDate = addMonths(today, seed.startOffset);
      const finalAmount =
        Math.round(seed.purchaseValue * Math.pow(1 + seed.interestRate / 100, seed.monthsCount) * 100) / 100;
      return loanRepository.create({
        client: seed.client,
        currencyType: seed.currencyType,
        purchaseValue: seed.purchaseValue,
        conversionRate: seed.conversionRate,
        interestRate: seed.interestRate,
        purchaseDate,
        dueDate: addMonths(purchaseDate, seed.monthsCount),
        monthsCount: seed.monthsCount,
        finalAmount,
      });
    })
  );

  console.log(`Demo data seeded: ${clients.length} clients, ${loanSeeds.length} loans`);
}
