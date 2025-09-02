import { ClientInterface } from './client.interface';
import { CurrencyInterface } from './currency.interface';

export interface LoanInterface {
  id: number;
  purchaseDate: Date;
  currency: CurrencyInterface;
  purchaseValue: number;
  interestRate: number;
  dueDate: Date;
  client:ClientInterface;
  monthsCount: number;
  finalAmount: number;
  conversionRate: number;
}
