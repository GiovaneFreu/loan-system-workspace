import { CurrencyInterface, LoanInterface } from '@loan-system-workspace/interfaces';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Client } from '../../clients/entities/client.entity';

@Entity()
export class Loan implements Omit<LoanInterface,'currency'> {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "date", nullable: false })
  purchaseDate: Date;

  @Column({ type: "varchar", length: 3, nullable: false })
  currencyType: CurrencyInterface['symbol'];

  @Column({ type: "float", scale: 2, nullable: false })
  purchaseValue: number;

  @Column({ type: "float", scale: 2, nullable: false })
  conversionRate: number;

  @Column({ type: "float", scale: 2, nullable: false })
  finalAmount: number;

  @Column({ type: "float", scale: 2, nullable: false })
  interestRate: number;

  @Column({ type: "date", nullable: false })
  dueDate: Date;

  @Column({ type: "int", nullable: false })
  monthsCount: number;

  @ManyToOne(() => Client, (client) => client.id)
  @JoinColumn({ name: 'client_id' })
  client: Client;
}
