import { CurrencyType, LoanInterface } from '@loan-system-workspace/interfaces';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Loan implements LoanInterface {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "date", nullable: false })
  purchaseDate: Date;

  @Column({ type: "varchar", length: 3, nullable: false })
  currencyType: CurrencyType;
}
