import { CurrencyType } from './currencyType.enum';

export interface LoanInterface {
  id: number;
  purchaseDate: Date;
  currencyType: CurrencyType;
}
