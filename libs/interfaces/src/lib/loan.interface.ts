import { CurrencyType } from './currencyType.enum';
import { ClientInterface } from './client.interface';

export interface LoanInterface {
  id: number;
  purchaseDate: Date;
  currencyType: CurrencyType;
  purchaseValue: number;
  dueDate:Date;
  client:ClientInterface;
}
