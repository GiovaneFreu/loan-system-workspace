import { ClientInterface } from './client.interface';
import { CurrencyInerface } from './currency.interface';

export interface LoanInterface {
  id: number;
  purchaseDate: Date;
  currency: CurrencyInerface;
  purchaseValue: number;
  dueDate: Date;
  client:ClientInterface;
  conversionRate?: number;
  finalAmount: number;
  monthsCount: number;
  interestRate: number;
}
